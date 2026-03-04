import { NextRequest, NextResponse } from "next/server"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mef2026admin"

const client = new DynamoDBClient({
  region: process.env.MEF_AWS_REGION || "ap-southeast-1",
  maxAttempts: 3,
})
const docClient = DynamoDBDocumentClient.from(client)
const TABLE_NAME = process.env.MEF_DYNAMODB_TABLE || "mef-registrations"

export async function GET(request: NextRequest) {
  const password = request.headers.get("x-admin-password")
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Single scan — fine for <2000 registrations.
    // Do NOT add pagination/recursive scanning.
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        Limit: 5000,
      })
    )

    return NextResponse.json({
      count: result.Items?.length || 0,
      registrations: result.Items || [],
    })
  } catch (error) {
    console.error("Admin fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    )
  }
}
