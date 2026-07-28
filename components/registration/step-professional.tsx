"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { yglSpouseOptions } from "@/lib/registration-schema"
import { PhoneInput } from "./phone-input"

interface StepProfessionalProps {
  dict: any
  data: Record<string, string>
  onChange: (field: string, value: string) => void
  errors: Record<string, string>
  registrationType?: string
  vip?: boolean
  /** Complimentary registration: hide fee amounts in option labels. */
  free?: boolean
}

export function StepProfessional({
  dict,
  data,
  onChange,
  errors,
  registrationType,
  vip,
  free,
}: StepProfessionalProps) {
  const t = dict.registration.fields
  const isIndividual = registrationType === "individual"

  return (
    <div className="space-y-5">
      {vip && (
        <>
          <div className="space-y-2">
            <Label>{t.yglSpouse} *</Label>
            <RadioGroup
              value={data.ygl_spouse || ""}
              onValueChange={(v) => {
                onChange("ygl_spouse", v)
                if (v !== "yes") onChange("ygl_spouse_of", "")
              }}
              className="flex flex-col gap-2"
            >
              {yglSpouseOptions.map((opt) => (
                <div key={opt} className="flex items-center gap-2">
                  <RadioGroupItem value={opt} id={`ygl-spouse-${opt}`} />
                  <Label htmlFor={`ygl-spouse-${opt}`} className="font-normal cursor-pointer">
                    {free
                      ? // Complimentary guests never pay, so strip any fee
                        // parenthetical from the option label.
                        (t.yglSpouseOptions[opt] || "").replace(/\s*\(.*\)\s*$/, "")
                      : t.yglSpouseOptions[opt]}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.ygl_spouse && (
              <p className="text-sm text-destructive">{errors.ygl_spouse}</p>
            )}
          </div>

          {data.ygl_spouse === "yes" && (
            <div className="space-y-2">
              <Label>{t.yglSpouseOf} *</Label>
              <p className="text-sm text-muted-foreground">{t.yglSpouseOfHint}</p>
              <Input
                value={data.ygl_spouse_of || ""}
                onChange={(e) => onChange("ygl_spouse_of", e.target.value)}
              />
              {errors.ygl_spouse_of && (
                <p className="text-sm text-destructive">{errors.ygl_spouse_of}</p>
              )}
            </div>
          )}
        </>
      )}
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
