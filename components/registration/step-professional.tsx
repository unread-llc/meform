"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "./phone-input"

interface StepProfessionalProps {
  dict: any
  data: Record<string, string>
  onChange: (field: string, value: string) => void
  errors: Record<string, string>
  registrationType?: string
}

export function StepProfessional({
  dict,
  data,
  onChange,
  errors,
  registrationType,
}: StepProfessionalProps) {
  const t = dict.registration.fields
  const isIndividual = registrationType === "individual"

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>{t.company}{!isIndividual && " *"}</Label>
        <Input
          value={data.company || ""}
          onChange={(e) => onChange("company", e.target.value)}
        />
        {errors.company && (
          <p className="text-sm text-destructive">{errors.company}</p>
        )}
      </div>

      {!isIndividual && (
        <div className="space-y-2">
          <Label>{t.companyRegister} *</Label>
          <Input
            value={data.company_register || ""}
            onChange={(e) => onChange("company_register", e.target.value)}
          />
          {errors.company_register && (
            <p className="text-sm text-destructive">{errors.company_register}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label>{t.position}{!isIndividual && " *"}</Label>
        <Input
          value={data.position || ""}
          onChange={(e) => onChange("position", e.target.value)}
        />
        {errors.position && (
          <p className="text-sm text-destructive">{errors.position}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>{t.email} *</Label>
        <Input
          type="email"
          value={data.email || ""}
          onChange={(e) => onChange("email", e.target.value)}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>{t.phone} *</Label>
        <PhoneInput
          value={data.phone || ""}
          onChange={(v) => onChange("phone", v)}
          placeholder={t.phonePlaceholder || "Phone number"}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone}</p>
        )}
      </div>
    </div>
  )
}
