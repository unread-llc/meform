import { randomBytes } from "crypto"
import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb"
import { docClient, TABLE_NAME } from "@/lib/aws/dynamodb"

// Complimentary YGL guest invitations, one per guest, generated from the admin
// panel. They live in the registrations table under an "invite#" id prefix and
// carry item_type so the admin registrations scan can filter them out — see
// app/api/admin/registrations/route.ts. Codes are looked up by exact key, so no
// secondary index is needed.

export const VIP_INVITE_ITEM_TYPE = "vip_invite"

const idFor = (code: string) => `invite#${code}`

export interface VipInvite {
  id: string
  item_type: typeof VIP_INVITE_ITEM_TYPE
  code: string
  guest_name?: string
  guest_email?: string
  note?: string
  /** Shared link: any number of guests may register with it until revoked. */
  reusable?: boolean
  use_count?: number
  created_at: string
  revoked_at?: string
  redeemed_at?: string
  last_redeemed_at?: string
  redeemed_registration_id?: string
}

export type InviteState = "active" | "redeemed" | "revoked"

export function inviteState(invite: VipInvite): InviteState {
  if (invite.revoked_at) return "revoked"
  // Reusable links stay open however many times they are used; only revoking
  // closes them.
  if (!invite.reusable && invite.redeemed_at) return "redeemed"
  return "active"
}

// 96 bits of randomness, URL-safe. Long enough that guessing is infeasible.
export function generateInviteCode(): string {
  return `ygl-${randomBytes(12).toString("base64url")}`
}

export async function createVipInvite(fields: {
  guest_name?: string
  guest_email?: string
  note?: string
  reusable?: boolean
}): Promise<VipInvite> {
  const code = generateInviteCode()
  const invite: VipInvite = {
    id: idFor(code),
    item_type: VIP_INVITE_ITEM_TYPE,
    code,
    ...(fields.guest_name ? { guest_name: fields.guest_name } : {}),
    ...(fields.guest_email ? { guest_email: fields.guest_email } : {}),
    ...(fields.note ? { note: fields.note } : {}),
    ...(fields.reusable ? { reusable: true, use_count: 0 } : {}),
    created_at: new Date().toISOString(),
  }
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: invite,
      ConditionExpression: "attribute_not_exists(id)",
    })
  )
  return invite
}

export async function getVipInvite(code: string): Promise<VipInvite | null> {
  if (!code || code.includes("#")) return null
  const res = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { id: idFor(code) } })
  )
  const item = res.Item as VipInvite | undefined
  return item?.item_type === VIP_INVITE_ITEM_TYPE ? item : null
}

export async function listVipInvites(): Promise<VipInvite[]> {
  const res = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "item_type = :t",
      ExpressionAttributeValues: { ":t": VIP_INVITE_ITEM_TYPE },
      Limit: 1000,
    })
  )
  const items = (res.Items || []) as VipInvite[]
  return items.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))
}

// True when the link may still be opened (exists, not revoked, not used).
export async function isVipInviteOpenable(code: string): Promise<boolean> {
  const invite = await getVipInvite(code).catch(() => null)
  return !!invite && inviteState(invite) === "active"
}

export type ClaimResult =
  | { ok: true; invite: VipInvite }
  | { ok: false; reason: "not_found" | "revoked" | "used" }

// Atomically mark an invitation as redeemed. The condition makes this safe
// against double submits and two guests sharing a forwarded link — only the
// first writer wins.
export async function claimVipInvite(
  code: string,
  registrationId: string
): Promise<ClaimResult> {
  if (!code || code.includes("#")) return { ok: false, reason: "not_found" }

  const existing = await getVipInvite(code)
  if (!existing) return { ok: false, reason: "not_found" }
  if (existing.revoked_at) return { ok: false, reason: "revoked" }

  // Shared links just count uses and stay open; revoking is what closes them.
  if (existing.reusable) {
    try {
      const res = await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { id: idFor(code) },
          UpdateExpression:
            "SET last_redeemed_at = :now, redeemed_registration_id = :rid ADD use_count :one",
          ConditionExpression:
            "attribute_exists(id) AND item_type = :t AND attribute_not_exists(revoked_at)",
          ExpressionAttributeValues: {
            ":now": new Date().toISOString(),
            ":rid": registrationId,
            ":t": VIP_INVITE_ITEM_TYPE,
            ":one": 1,
          },
          ReturnValues: "ALL_NEW",
        })
      )
      return { ok: true, invite: res.Attributes as VipInvite }
    } catch (err: any) {
      if (err?.name !== "ConditionalCheckFailedException") throw err
      return { ok: false, reason: "revoked" }
    }
  }

  try {
    const res = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: idFor(code) },
        UpdateExpression:
          "SET redeemed_at = :now, redeemed_registration_id = :rid",
        ConditionExpression:
          "attribute_exists(id) AND item_type = :t AND attribute_not_exists(redeemed_at) AND attribute_not_exists(revoked_at)",
        ExpressionAttributeValues: {
          ":now": new Date().toISOString(),
          ":rid": registrationId,
          ":t": VIP_INVITE_ITEM_TYPE,
        },
        ReturnValues: "ALL_NEW",
      })
    )
    return { ok: true, invite: res.Attributes as VipInvite }
  } catch (err: any) {
    if (err?.name !== "ConditionalCheckFailedException") throw err
    // Work out which precondition failed, for a useful message.
    const current = await getVipInvite(code).catch(() => null)
    if (!current) return { ok: false, reason: "not_found" }
    if (current.revoked_at) return { ok: false, reason: "revoked" }
    return { ok: false, reason: "used" }
  }
}

// Release a claim if the registration could not be created after claiming.
export async function releaseVipInvite(code: string): Promise<void> {
  const existing = await getVipInvite(code).catch(() => null)
  if (!existing) return

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id: idFor(code) },
      // Reusable links only spent a use; single-use links get reopened.
      ...(existing.reusable
        ? {
            UpdateExpression: "ADD use_count :minusOne",
            ExpressionAttributeValues: {
              ":t": VIP_INVITE_ITEM_TYPE,
              ":minusOne": -1,
            },
          }
        : {
            UpdateExpression: "REMOVE redeemed_at, redeemed_registration_id",
            ExpressionAttributeValues: { ":t": VIP_INVITE_ITEM_TYPE },
          }),
      ConditionExpression: "attribute_exists(id) AND item_type = :t",
    })
  )
}

export async function revokeVipInvite(code: string): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id: idFor(code) },
      UpdateExpression: "SET revoked_at = :now",
      ConditionExpression: "attribute_exists(id) AND item_type = :t",
      ExpressionAttributeValues: {
        ":now": new Date().toISOString(),
        ":t": VIP_INVITE_ITEM_TYPE,
      },
    })
  )
}

export async function deleteVipInvite(code: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id: idFor(code) },
      ConditionExpression: "attribute_exists(id) AND item_type = :t",
      ExpressionAttributeValues: { ":t": VIP_INVITE_ITEM_TYPE },
    })
  )
}
