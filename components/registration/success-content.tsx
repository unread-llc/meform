"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"

interface VerifyResult {
  valid: boolean
  firstname?: string
  lastname?: string
  payment_status?: string
}

export function SuccessContent({
  locale,
  dict,
}: {
  locale: string
  dict: any
}) {
  const searchParams = useSearchParams()
  // Golomt callback uses ?invoice=MEF2026-{uuid}&status_code=000
  // byl.mn callback uses ?registration_id={uuid}
  const invoiceParam = searchParams.get("invoice") || ""
  const registrationId =
    searchParams.get("registration_id") ||
    (invoiceParam.startsWith("MEF2026-")
      ? invoiceParam.replace("MEF2026-", "")
      : "")
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<VerifyResult | null>(null)

  useEffect(() => {
    if (!registrationId) {
      setLoading(false)
      return
    }
    fetch(`/api/register/verify?id=${encodeURIComponent(registrationId)}`)
      .then((res) => res.json())
      .then((data) => setResult(data))
      .catch(() => setResult(null))
      .finally(() => setLoading(false))
  }, [registrationId])

  if (loading) {
    return (
      <Card className="rounded-3xl text-center">
        <CardContent className="py-16">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!registrationId || !result?.valid) {
    return (
      <Card className="rounded-3xl text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">
            {dict.registration.success.invalidTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            {dict.registration.success.invalidDescription}
          </p>
          <Button asChild className="w-full">
            <Link href={`/${locale}`}>
              {dict.registration.success.backToHome}
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const qrData = `MEF2026:${registrationId}`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`
  const isPaid = result.payment_status === "paid"

  return (
    <Card className="rounded-3xl text-center">
      <CardHeader className="pb-4">
        <div className={`mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center ${isPaid ? "bg-green-100" : "bg-yellow-100"}`}>
          {isPaid ? (
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          ) : (
            <Loader2 className="w-8 h-8 text-yellow-600" />
          )}
        </div>
        <CardTitle className="text-2xl">
          {isPaid ? dict.registration.success.title : dict.registration.success.pendingTitle}
        </CardTitle>
        <p className="text-muted-foreground">
          {isPaid ? dict.registration.success.subtitle : dict.registration.success.pendingSubtitle}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          {isPaid ? dict.registration.success.description : dict.registration.success.pendingDescription}
        </p>

        {isPaid && (
          <>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {dict.registration.success.registrationId}
              </p>
              <p className="font-mono text-sm bg-muted rounded-lg p-3 break-all">
                {registrationId}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {dict.registration.success.qrCode}
              </p>
              <div className="flex justify-center">
                <img
                  src={qrUrl}
                  alt="Registration QR Code"
                  width={200}
                  height={200}
                  className="rounded-lg"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {dict.registration.success.qrDescription}
              </p>
            </div>
          </>
        )}

        <Button asChild className="w-full">
          <Link href={`/${locale}`}>
            {dict.registration.success.backToHome}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
