"use client"

import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { visaOptions } from "@/lib/registration-schema"
import { Upload, CheckCircle2 } from "lucide-react"

interface StepDocumentsProps {
  dict: any
  data: Record<string, string>
  onChange: (field: string, value: string) => void
  errors: Record<string, string>
}

function FileUpload({
  field,
  label,
  hint,
  dict,
  value,
  onChange,
  error,
}: {
  field: string
  label: string
  hint: string
  dict: any
  value: string
  onChange: (field: string, value: string) => void
  error?: string
}) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const t = dict.registration.upload

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (file.size > 5 * 1024 * 1024) {
        setUploadError(t.maxSize)
        return
      }

      setUploading(true)
      setUploadError("")

      try {
        const res = await fetch("/api/register/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            field,
          }),
        })

        if (!res.ok) throw new Error("Failed to get upload URL")

        const { url, key } = await res.json()

        const uploadRes = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        })

        if (!uploadRes.ok) throw new Error("Upload failed")

        onChange(field, key)
      } catch {
        setUploadError(t.error)
      } finally {
        setUploading(false)
      }
    },
    [field, onChange, t]
  )

  return (
    <div className="space-y-2">
      <Label>{label} *</Label>
      <p className="text-sm text-muted-foreground">{hint}</p>
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
        {uploading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">{t.uploading}</span>
          </div>
        ) : value ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm">{t.uploaded}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="w-6 h-6" />
            <span className="text-sm">{t.dragDrop}</span>
            <span className="text-xs">{t.maxSize}</span>
          </div>
        )}
        <input
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </label>
      {(error || uploadError) && (
        <p className="text-sm text-destructive">{error || uploadError}</p>
      )}
    </div>
  )
}

export function StepDocuments({
  dict,
  data,
  onChange,
  errors,
}: StepDocumentsProps) {
  const t = dict.registration.fields

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>{t.passportno} *</Label>
        <Input
          value={data.passportno || ""}
          onChange={(e) => onChange("passportno", e.target.value)}
        />
        {errors.passportno && (
          <p className="text-sm text-destructive">{errors.passportno}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>{t.visa} *</Label>
        <RadioGroup
          value={data.visa || ""}
          onValueChange={(v) => onChange("visa", v)}
          className="flex gap-6"
        >
          {visaOptions.map((v) => (
            <div key={v} className="flex items-center gap-2">
              <RadioGroupItem value={v} id={`visa-${v}`} />
              <Label htmlFor={`visa-${v}`} className="font-normal cursor-pointer">
                {t.visaOptions[v]}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {errors.visa && (
          <p className="text-sm text-destructive">{errors.visa}</p>
        )}
      </div>

      <FileUpload
        field="passport_img"
        label={t.passportImg}
        hint={t.passportImgHint}
        dict={dict}
        value={data.passport_img || ""}
        onChange={onChange}
        error={errors.passport_img}
      />

      <FileUpload
        field="img"
        label={t.img}
        hint={t.imgHint}
        dict={dict}
        value={data.img || ""}
        onChange={onChange}
        error={errors.img}
      />
    </div>
  )
}
