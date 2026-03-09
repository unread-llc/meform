"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { paidSectorOptions, inviteSectorOptions, genderOptions } from "@/lib/registration-schema"
import { CountryCombobox } from "./country-combobox"

interface StepPersonalInfoProps {
  dict: any
  data: Record<string, string>
  onChange: (field: string, value: string) => void
  errors: Record<string, string>
  invite?: boolean
}

export function StepPersonalInfo({
  dict,
  data,
  onChange,
  errors,
  invite,
}: StepPersonalInfoProps) {
  const t = dict.registration.fields
  const sectors = invite ? inviteSectorOptions : paidSectorOptions

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>{t.sector} *</Label>
        <Select value={data.sector || ""} onValueChange={(v) => onChange("sector", v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t.sectorPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {sectors.map((s) => (
              <SelectItem key={s} value={s}>
                {t.sectors[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.sector && (
          <p className="text-sm text-destructive">{errors.sector}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t.lastname} *</Label>
          <Input
            value={data.lastname || ""}
            onChange={(e) => onChange("lastname", e.target.value)}
          />
          {errors.lastname && (
            <p className="text-sm text-destructive">{errors.lastname}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>{t.firstname} *</Label>
          <Input
            value={data.firstname || ""}
            onChange={(e) => onChange("firstname", e.target.value)}
          />
          {errors.firstname && (
            <p className="text-sm text-destructive">{errors.firstname}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t.gender} *</Label>
        <RadioGroup
          value={data.gender || ""}
          onValueChange={(v) => onChange("gender", v)}
          className="flex gap-6"
        >
          {genderOptions.map((g) => (
            <div key={g} className="flex items-center gap-2">
              <RadioGroupItem value={g} id={`gender-${g}`} />
              <Label htmlFor={`gender-${g}`} className="font-normal cursor-pointer">
                {t.genders[g]}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {errors.gender && (
          <p className="text-sm text-destructive">{errors.gender}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>{t.birth} *</Label>
        <Input
          type="date"
          value={data.birth || ""}
          onChange={(e) => onChange("birth", e.target.value)}
        />
        {errors.birth && (
          <p className="text-sm text-destructive">{errors.birth}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t.nation} *</Label>
          <CountryCombobox
            value={data.nation || ""}
            onChange={(v) => onChange("nation", v)}
            placeholder={t.nationPlaceholder}
          />
          {errors.nation && (
            <p className="text-sm text-destructive">{errors.nation}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>{t.residence} *</Label>
          <CountryCombobox
            value={data.residence || ""}
            onChange={(v) => onChange("residence", v)}
            placeholder={t.residencePlaceholder}
          />
          {errors.residence && (
            <p className="text-sm text-destructive">{errors.residence}</p>
          )}
        </div>
      </div>
    </div>
  )
}
