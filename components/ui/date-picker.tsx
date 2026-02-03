'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = 'Pick a date',
  disabled = false,
  className,
}: DatePickerProps) {
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(date)

  const handleDateChange = (newDate: Date | undefined) => {
    setInternalDate(newDate)
    onDateChange?.(newDate)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          disabled={disabled}
          className={cn(
            'w-[280px] justify-start text-left font-normal',
            !internalDate && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {internalDate ? format(internalDate, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={internalDate}
          onSelect={handleDateChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

interface DateRangePickerProps {
  dateFrom?: Date
  dateTo?: Date
  onDateChange?: (dateFrom: Date | undefined, dateTo: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DateRangePicker({
  dateFrom,
  dateTo,
  onDateChange,
  placeholder = 'Pick a date range',
  disabled = false,
  className,
}: DateRangePickerProps) {
  const [internalRange, setInternalRange] = React.useState<{
    from?: Date
    to?: Date
  }>({
    from: dateFrom,
    to: dateTo,
  })

  const handleRangeChange = (range: { from?: Date; to?: Date } | undefined) => {
    setInternalRange(range || {})
    onDateChange?.(range?.from, range?.to)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          disabled={disabled}
          className={cn(
            'w-[300px] justify-start text-left font-normal',
            !internalRange.from && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {internalRange.from ? (
            internalRange.to ? (
              <>
                {format(internalRange.from, 'LLL dd, y')} -{' '}
                {format(internalRange.to, 'LLL dd, y')}
              </>
            ) : (
              format(internalRange.from, 'LLL dd, y')
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={internalRange.from}
          selected={internalRange}
          onSelect={handleRangeChange}
          numberOfMonths={2}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
