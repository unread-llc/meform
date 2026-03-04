"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { countries } from "@/lib/countries"

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function PhoneInput({ value, onChange, placeholder = "Phone number" }: PhoneInputProps) {
  const [open, setOpen] = useState(false)

  // Parse dial code from value (e.g. "+976 99001122" → "+976")
  const parseDialCode = () => {
    if (!value) return countries[0] // Default to Mongolia
    for (const c of countries) {
      if (value.startsWith(c.dial + " ") || value === c.dial) {
        return c
      }
    }
    return countries[0]
  }

  const selected = parseDialCode()
  const phoneNumber = value?.startsWith(selected.dial)
    ? value.slice(selected.dial.length).trim()
    : value || ""

  const handleDialChange = (country: typeof countries[0]) => {
    onChange(phoneNumber ? `${country.dial} ${phoneNumber}` : country.dial)
    setOpen(false)
  }

  const handleNumberChange = (num: string) => {
    // Only allow digits, spaces, and dashes in the number part
    const cleaned = num.replace(/[^\d\s\-]/g, "")
    onChange(cleaned ? `${selected.dial} ${cleaned}` : selected.dial)
  }

  return (
    <div className="flex gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[110px] shrink-0 justify-between px-2 font-normal"
          >
            <span className="truncate">{selected.flag} {selected.dial}</span>
            <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search country..." />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {countries.map((c) => (
                  <CommandItem
                    key={c.code}
                    value={`${c.name} ${c.dial}`}
                    onSelect={() => handleDialChange(c)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected.code === c.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {c.flag} {c.name} <span className="ml-auto text-muted-foreground text-xs">{c.dial}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Input
        type="tel"
        value={phoneNumber}
        onChange={(e) => handleNumberChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
      />
    </div>
  )
}
