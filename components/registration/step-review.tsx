"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  calculateFee,
  VIP_PRICE_USD,
  VIP_SPOUSE_PRICE_USD,
} from "@/lib/registration-schema"

interface StepReviewProps {
  dict: any
  data: Record<string, string>
  onChange?: (field: string, value: string) => void
  invite?: boolean
  priceUsd?: number
  vip?: boolean
  /** Complimentary registration: show the waived fee instead of a payment card. */
  free?: boolean
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%]">{value}</span>
    </div>
  )
}

export function StepReview({ dict, data, onChange, invite, priceUsd, vip, free }: StepReviewProps) {
  const t = dict.registration
  const f = t.fields
  const r = t.review

  const fee = calculateFee(data.nation || "", priceUsd)
  const isMongolian = fee.currency === "MNT"

  const [exchangeRate, setExchangeRate] = useState<number | null>(null)

  useEffect(() => {
    if (!isMongolian && !free) {
      fetch("/api/exchange-rate")
        .then((res) => res.json())
        .then((data) => {
          if (data.rate) setExchangeRate(data.rate)
        })
        .catch(() => {})
    }
  }, [isMongolian, free])

  // Default payment method: golomt for all, but set it if not already chosen.
  // Free (complimentary) registrations never reach a payment step.
  useEffect(() => {
    if (!invite && !free && !data.payment_method) {
      onChange?.("payment_method", "golomt")
    }
  }, [invite, free, data.payment_method, onChange])

  const mntEquivalent =
    !isMongolian && exchangeRate
      ? Math.round(fee.amount * exchangeRate)
      : null

  const selectedMethod = data.payment_method || "golomt"

  return (
    <div className="space-y-6">
      <Card className="rounded-xl">
        <CardContent className="pt-4">
          <h3 className="font-semibold mb-3">{r.personalInfo}</h3>
          {!vip && (
            <ReviewRow label={f.registrationType} value={f.registrationTypes?.[data.registration_type] || data.registration_type} />
          )}
          <ReviewRow label={f.sector} value={f.sectors?.[data.sector] || data.sector} />
          <ReviewRow label={f.lastname} value={data.lastname} />
          <ReviewRow label={f.firstname} value={data.firstname} />
          <ReviewRow label={f.gender} value={f.genders?.[data.gender] || data.gender} />
          <ReviewRow label={f.birth} value={data.birth} />
          <ReviewRow label={f.nation} value={data.nation} />
          <ReviewRow label={f.residence} value={data.residence} />
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardContent className="pt-4">
          <h3 className="font-semibold mb-3">{r.professionalInfo}</h3>
          {vip && (
            <>
              <ReviewRow
                label={f.yglSpouseShort}
                value={f.yglSpouseOptions?.[data.ygl_spouse] || data.ygl_spouse}
              />
              {data.ygl_spouse === "yes" && (
                <ReviewRow label={f.yglSpouseOf} value={data.ygl_spouse_of} />
              )}
            </>
          )}
          <ReviewRow label={f.company} value={data.company} />
          {!vip && (
            <ReviewRow label={f.companyRegister} value={data.company_register} />
          )}
          <ReviewRow label={f.position} value={data.position} />
          <ReviewRow label={f.email} value={data.email} />
          <ReviewRow label={f.phone} value={data.phone} />
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardContent className="pt-4">
          <h3 className="font-semibold mb-3">{r.documents}</h3>
          <ReviewRow label={f.passportno} value={data.passportno} />
          <ReviewRow
            label={f.visa}
            value={f.visaOptions?.[data.visa] || data.visa}
          />
          <ReviewRow
            label={f.passportImg}
            value={data.passport_img ? r.uploaded : r.notUploaded}
          />
          <ReviewRow
            label={f.img}
            value={data.img ? r.uploaded : r.notUploaded}
          />
        </CardContent>
      </Card>

      {free && (
        <Card className="rounded-xl border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <h3 className="font-semibold mb-3">{r.fee}</h3>
            <Separator className="mb-3" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {r.complimentary || "Complimentary invitation"}
              </span>
              <span className="text-lg font-bold text-green-700">
                <span className="text-muted-foreground line-through font-medium text-sm mr-2">
                  $
                  {(data.ygl_spouse === "yes"
                    ? VIP_SPOUSE_PRICE_USD
                    : VIP_PRICE_USD
                  ).toLocaleString()}
                </span>
                {r.freeLabel || "Free"}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {r.complimentaryNote || "Your participation fee is covered. No payment is required."}
            </p>
          </CardContent>
        </Card>
      )}

      {!invite && !free && (
        <Card className="rounded-xl border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <h3 className="font-semibold mb-3">{r.fee}</h3>
            <Separator className="mb-3" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {isMongolian ? r.domestic : r.international}
              </span>
              <span className="text-lg font-bold text-primary">
                {priceUsd
                  ? `$${fee.amount.toLocaleString()}`
                  : isMongolian
                    ? r.feeAmountMNT
                    : r.feeAmountUSD}
              </span>
            </div>
            {!isMongolian && mntEquivalent && (
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {r.mntEquivalent} (1 USD = {exchangeRate?.toLocaleString()} MNT)
                </span>
                <span className="text-sm font-semibold text-primary">
                  ₮{mntEquivalent.toLocaleString()}
                </span>
              </div>
            )}

            <Separator className="my-3" />
            <h3 className="font-semibold mb-3">{r.paymentMethod}</h3>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onChange?.("payment_method", "golomt")}
                className={`flex-1 rounded-lg border-2 p-3 text-center transition-colors ${
                  selectedMethod === "golomt"
                    ? "border-primary bg-primary/10"
                    : "border-muted hover:border-primary/40"
                }`}
              >
                <span className="text-sm font-medium">{r.golomt}</span>
              </button>
              {isMongolian && (
                <button
                  type="button"
                  onClick={() => onChange?.("payment_method", "byl")}
                  className={`flex-1 rounded-lg border-2 p-3 text-center transition-colors ${
                    selectedMethod === "byl"
                      ? "border-primary bg-primary/10"
                      : "border-muted hover:border-primary/40"
                  }`}
                >
                  <span className="text-sm font-medium">{r.byl}</span>
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
