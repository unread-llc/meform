"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { registrationSchema, isValidMnRegisterNo } from "@/lib/registration-schema"
import { StepPersonalInfo } from "./step-personal-info"
import { StepProfessional } from "./step-professional"
import { StepDocuments } from "./step-documents"
import { StepReview } from "./step-review"
import type { Locale } from "@/lib/i18n"

const STEPS = ["personal", "professional", "documents", "review"] as const
type Step = (typeof STEPS)[number]

const STEP_FIELDS: Record<Step, string[]> = {
  personal: ["registration_type", "sector", "lastname", "firstname", "gender", "birth", "nation", "residence"],
  professional: ["company", "company_register", "position", "email", "phone"],
  documents: ["passportno", "visa", "passport_img", "img"],
  review: [],
}

interface RegistrationFormProps {
  dict: any
  locale: Locale
  invite?: boolean
  priceUsd?: number
  /** YGL Learning Journey variant: no registration type / company register, custom sectors. */
  vip?: boolean
}

export function RegistrationForm({ dict, locale, invite, priceUsd, vip }: RegistrationFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  // In VIP mode there's no "registration type" question; everyone is treated as an
  // individual, which also drops the company-register requirement.
  const [formData, setFormData] = useState<Record<string, string>>(
    vip ? { registration_type: "individual" } : {}
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const step = STEPS[currentStep]
  const progress = ((currentStep + 1) / STEPS.length) * 100

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const validateStep = (): boolean => {
    const fields = STEP_FIELDS[step]
    const newErrors: Record<string, string> = {}

    for (const field of fields) {
      if (formData.registration_type === "individual" && ["company", "company_register", "position"].includes(field)) continue
      const value = formData[field]
      if (!value || value.trim() === "") {
        newErrors[field] = dict.registration.validation.required
      }
    }

    if (formData.email && fields.includes("email")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = dict.registration.validation.invalidEmail
      }
    }

    if (formData.passportno && fields.includes("passportno") && locale === "mn") {
      if (!isValidMnRegisterNo(formData.passportno)) {
        newErrors.passportno = dict.registration.validation.invalidRegisterNo
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateStep()) return
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    const parsed = registrationSchema.safeParse(formData)
    if (!parsed.success) {
      const flatErrors = parsed.error.flatten().fieldErrors
      const newErrors: Record<string, string> = {}
      for (const [key, msgs] of Object.entries(flatErrors)) {
        if (msgs && msgs.length > 0) {
          newErrors[key] = msgs[0]
        }
      }
      setErrors(newErrors)
      return
    }

    setSubmitting(true)
    try {
      const endpoint = invite ? "/api/register/invite" : "/api/register"
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, locale, ...(priceUsd ? { price_usd: priceUsd } : {}) }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Registration failed")
      }

      const result = await res.json()
      if (invite) {
        router.push(`/${locale}/register/success?registration_id=${result.registrationId}`)
      } else if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      }
    } catch (error) {
      console.error("Submit error:", error)
      setErrors({ _form: "Failed to process registration. Please try again." })
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-3">
        <div className="flex justify-between">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => {
                if (i < currentStep) setCurrentStep(i)
              }}
              className={cn(
                "text-xs sm:text-sm font-medium transition-colors",
                i === currentStep
                  ? "text-primary"
                  : i < currentStep
                    ? "text-foreground cursor-pointer hover:text-primary"
                    : "text-muted-foreground"
              )}
            >
              <span className="hidden sm:inline">
                {i + 1}. {dict.registration.steps[s]}
              </span>
              <span className="sm:hidden">{i + 1}</span>
            </button>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step content */}
      <Card className="rounded-2xl">
        <CardContent className="pt-6">
          {step === "personal" && (
            <StepPersonalInfo
              dict={dict}
              data={formData}
              onChange={handleChange}
              errors={errors}
              invite={invite}
              vip={vip}
            />
          )}
          {step === "professional" && (
            <StepProfessional
              dict={dict}
              data={formData}
              onChange={handleChange}
              errors={errors}
              registrationType={formData.registration_type}
            />
          )}
          {step === "documents" && (
            <StepDocuments
              dict={dict}
              data={formData}
              onChange={handleChange}
              errors={errors}
            />
          )}
          {step === "review" && <StepReview dict={dict} data={formData} onChange={handleChange} invite={invite} priceUsd={priceUsd} vip={vip} />}
        </CardContent>
      </Card>

      {/* Form-level error */}
      {errors._form && (
        <p className="text-sm text-destructive text-center">{errors._form}</p>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="flex-1 sm:flex-none"
        >
          {dict.registration.navigation.back}
        </Button>

        {step === "review" ? (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 sm:flex-none"
          >
            {submitting
              ? dict.registration.processing
              : invite
                ? dict.registration.navigation.submitInvite
                : dict.registration.navigation.submit}
          </Button>
        ) : (
          <Button onClick={handleNext} className="flex-1 sm:flex-none">
            {dict.registration.navigation.next}
          </Button>
        )}
      </div>
    </div>
  )
}
