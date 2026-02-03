# Date Picker Component

The Date Picker component provides a user-friendly way to select dates in your application. It combines the Calendar and Popover components to create an interactive date selection experience.

## Components

### DatePicker

A single date picker component.

#### Usage

```tsx
import { DatePicker } from '@/components/ui/date-picker'

export function DatePickerDemo() {
  const [date, setDate] = React.useState<Date>()

  return (
    <DatePicker
      date={date}
      onDateChange={setDate}
      placeholder="Select a date"
    />
  )
}
```

#### Props

- `date?: Date` - The currently selected date
- `onDateChange?: (date: Date | undefined) => void` - Callback when date changes
- `placeholder?: string` - Placeholder text when no date is selected (default: "Pick a date")
- `disabled?: boolean` - Whether the date picker is disabled
- `className?: string` - Additional CSS classes

### DateRangePicker

A date range picker component for selecting a start and end date.

#### Usage

```tsx
import { DateRangePicker } from '@/components/ui/date-picker'

export function DateRangePickerDemo() {
  const [dateFrom, setDateFrom] = React.useState<Date>()
  const [dateTo, setDateTo] = React.useState<Date>()

  const handleDateChange = (from: Date | undefined, to: Date | undefined) => {
    setDateFrom(from)
    setDateTo(to)
  }

  return (
    <DateRangePicker
      dateFrom={dateFrom}
      dateTo={dateTo}
      onDateChange={handleDateChange}
      placeholder="Select a date range"
    />
  )
}
```

#### Props

- `dateFrom?: Date` - The start date of the range
- `dateTo?: Date` - The end date of the range
- `onDateChange?: (dateFrom: Date | undefined, dateTo: Date | undefined) => void` - Callback when date range changes
- `placeholder?: string` - Placeholder text when no date range is selected (default: "Pick a date range")
- `disabled?: boolean` - Whether the date range picker is disabled
- `className?: string` - Additional CSS classes

## Examples

### Basic Date Picker

```tsx
'use client'

import * as React from 'react'
import { DatePicker } from '@/components/ui/date-picker'

export default function Example() {
  const [date, setDate] = React.useState<Date>()

  return (
    <div className="space-y-4">
      <DatePicker date={date} onDateChange={setDate} />
      {date && <p>Selected date: {date.toLocaleDateString()}</p>}
    </div>
  )
}
```

### Date Range Picker

```tsx
'use client'

import * as React from 'react'
import { DateRangePicker } from '@/components/ui/date-picker'

export default function Example() {
  const [dateFrom, setDateFrom] = React.useState<Date>()
  const [dateTo, setDateTo] = React.useState<Date>()

  const handleDateChange = (from: Date | undefined, to: Date | undefined) => {
    setDateFrom(from)
    setDateTo(to)
  }

  return (
    <div className="space-y-4">
      <DateRangePicker
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateChange={handleDateChange}
      />
      {dateFrom && dateTo && (
        <p>
          Selected range: {dateFrom.toLocaleDateString()} to{' '}
          {dateTo.toLocaleDateString()}
        </p>
      )}
    </div>
  )
}
```

### With Form

```tsx
'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { DatePicker } from '@/components/ui/date-picker'
import { Button } from '@/components/ui/button'

interface FormData {
  date: Date
}

export default function Example() {
  const { handleSubmit, setValue, watch } = useForm<FormData>()
  const date = watch('date')

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <DatePicker
        date={date}
        onDateChange={(newDate) => setValue('date', newDate as Date)}
        placeholder="Select event date"
      />
      <Button type="submit">Submit</Button>
    </form>
  )
}
```

## Features

- Single date selection
- Date range selection
- Customizable placeholder text
- Disabled state support
- Integration with form libraries
- Responsive design
- Keyboard navigation support
- Accessibility features

## Dependencies

The Date Picker component depends on:
- `date-fns` - Date formatting and manipulation
- `react-day-picker` - Calendar UI
- `lucide-react` - Calendar icon
- `@radix-ui/react-popover` - Popover functionality
