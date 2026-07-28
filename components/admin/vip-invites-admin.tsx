"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Ticket,
  Plus,
  Copy,
  Check,
  Ban,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

interface Invite {
  code: string
  guest_name?: string
  guest_email?: string
  note?: string
  created_at: string
  revoked_at?: string
  redeemed_at?: string
  redeemed_registration_id?: string
  state: "active" | "redeemed" | "revoked"
}

const STATE_STYLES: Record<Invite["state"], string> = {
  active: "bg-green-100 text-green-700",
  redeemed: "bg-blue-100 text-blue-700",
  revoked: "bg-gray-200 text-gray-600",
}

export default function VipInvitesAdmin({ password }: { password: string }) {
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState<string | null>(null)

  const linkFor = (code: string) =>
    `${typeof window !== "undefined" ? window.location.origin : ""}/en/register/vip/guest/${code}`

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/vip-invites", {
        headers: { "x-admin-password": password },
        cache: "no-store",
      })
      if (res.ok) setInvites((await res.json()).invites || [])
    } catch {
      /* non-fatal */
    } finally {
      setLoading(false)
    }
  }, [password])

  useEffect(() => {
    load()
  }, [load])

  const create = async () => {
    setCreating(true)
    setError("")
    try {
      const res = await fetch("/api/admin/vip-invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ guest_name: name, guest_email: email }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Could not create the invitation.")
      }
      const { invite } = await res.json()
      setName("")
      setEmail("")
      setInvites((prev) => [invite, ...prev])
      // Put the new link on the clipboard straight away.
      copy(invite.code)
    } catch (e: any) {
      setError(e?.message || "Something went wrong.")
    } finally {
      setCreating(false)
    }
  }

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(linkFor(code))
      setCopied(code)
      setTimeout(() => setCopied((c) => (c === code ? null : c)), 2000)
    } catch {
      setError("Could not copy — select the link and copy manually.")
    }
  }

  const revoke = async (invite: Invite) => {
    const who = invite.guest_name || invite.code
    if (!confirm(`Revoke the invitation for ${who}? The link will stop working.`)) return
    try {
      const res = await fetch("/api/admin/vip-invites/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ code: invite.code }),
      })
      if (!res.ok) throw new Error("Failed to revoke")
      setInvites((prev) =>
        prev.map((i) =>
          i.code === invite.code
            ? { ...i, state: "revoked", revoked_at: new Date().toISOString() }
            : i
        )
      )
    } catch {
      setError("Failed to revoke the invitation.")
    }
  }

  const activeCount = invites.filter((i) => i.state === "active").length
  const usedCount = invites.filter((i) => i.state === "redeemed").length

  return (
    <Card className="rounded-2xl mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-2 text-lg">
          <span className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            YGL Guest Invitations
            <span className="text-sm font-normal text-muted-foreground">
              {loading
                ? ""
                : `— ${invites.length} total, ${activeCount} unused, ${usedCount} registered`}
            </span>
          </span>
          <Button variant="ghost" size="sm" onClick={() => setOpen((o) => !o)}>
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CardTitle>
      </CardHeader>

      {open && (
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Each invitation is a single-use link for one guest to register free for the
            YGL Learning Journey. Revoke one at any time — it stops working immediately.
          </p>

          {/* Create */}
          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-1.5 flex-1 min-w-[160px]">
              <label className="text-sm font-medium">Guest name (optional)</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jane Doe"
                disabled={creating}
              />
            </div>
            <div className="space-y-1.5 flex-1 min-w-[160px]">
              <label className="text-sm font-medium">Email (optional)</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                disabled={creating}
              />
            </div>
            <Button onClick={create} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1.5" /> Generate link
                </>
              )}
            </Button>
          </div>

          {error && (
            <p className="text-sm text-destructive flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
            </p>
          )}

          {/* List */}
          {loading ? (
            <p className="text-sm text-muted-foreground inline-flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading invitations…
            </p>
          ) : invites.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No invitations yet. Generate one above to get a shareable link.
            </p>
          ) : (
            <div className="rounded-xl border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2.5 font-medium">Guest</th>
                    <th className="text-left p-2.5 font-medium">Link</th>
                    <th className="text-left p-2.5 font-medium">Status</th>
                    <th className="text-left p-2.5 font-medium">Created</th>
                    <th className="text-left p-2.5 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {invites.map((i) => (
                    <tr key={i.code} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-2.5">
                        <span className="font-medium">{i.guest_name || "—"}</span>
                        {i.guest_email && (
                          <span className="block text-xs text-muted-foreground">
                            {i.guest_email}
                          </span>
                        )}
                      </td>
                      <td className="p-2.5">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {i.code}
                        </code>
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATE_STYLES[i.state]}`}
                        >
                          {i.state === "redeemed" ? "registered" : i.state}
                        </span>
                        {i.redeemed_at && (
                          <span className="block text-xs text-muted-foreground">
                            {new Date(i.redeemed_at).toLocaleDateString()}
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 whitespace-nowrap text-muted-foreground">
                        {i.created_at ? new Date(i.created_at).toLocaleDateString() : ""}
                      </td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            title="Copy link"
                            onClick={() => copy(i.code)}
                          >
                            {copied === i.code ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          {i.state === "active" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Revoke"
                              onClick={() => revoke(i)}
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
