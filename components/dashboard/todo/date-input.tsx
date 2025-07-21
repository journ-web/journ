"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { format, parse, isValid } from "date-fns"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface DateInputProps {
  id?: string
  date?: Date
  placeholder?: string
  required?: boolean
  clearable?: boolean
  onDateChange: (date: Date | undefined) => void
  error?: string
}

export const DateInput: React.FC<DateInputProps> = ({
  id,
  date,
  placeholder,
  required,
  clearable,
  onDateChange,
  error,
}) => {
  const [inputValue, setInputValue] = useState("")
  const [validationError, setValidationError] = useState<string>("")

  // Update input value when date prop changes
  useEffect(() => {
    if (date) {
      setInputValue(format(date, "dd/MM/yyyy"))
    } else {
      setInputValue("")
    }
  }, [date])

  // Validate date format and convert to Date object
  const validateAndParseDate = (value: string): Date | undefined => {
    // Skip validation if empty
    if (!value.trim()) {
      return undefined
    }

    // Check format with regex (DD/MM/YYYY)
    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    if (!dateRegex.test(value)) {
      setValidationError("Please use DD/MM/YYYY format")
      return undefined
    }

    // Parse the date
    const parsedDate = parse(value, "dd/MM/yyyy", new Date())

    // Check if date is valid
    if (!isValid(parsedDate)) {
      setValidationError("Invalid date")
      return undefined
    }

    // Additional validation for realistic dates
    const [day, month, year] = value.split("/").map(Number)

    // Check month range
    if (month < 1 || month > 12) {
      setValidationError("Month must be between 1 and 12")
      return undefined
    }

    // Check day range based on month
    const daysInMonth = new Date(year, month, 0).getDate()
    if (day < 1 || day > daysInMonth) {
      setValidationError(`Day must be between 1 and ${daysInMonth} for this month`)
      return undefined
    }

    // Clear validation error if date is valid
    setValidationError("")
    return parsedDate
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    // Auto-format as user types (add slashes)
    if (value.length === 2 && !value.includes("/") && inputValue.length < value.length) {
      setInputValue(value + "/")
    } else if (
      value.length === 5 &&
      value.charAt(2) === "/" &&
      !value.includes("/", 3) &&
      inputValue.length < value.length
    ) {
      setInputValue(value + "/")
    }
  }

  const handleBlur = () => {
    if (!inputValue.trim() && !required) {
      onDateChange(undefined)
      setValidationError("")
      return
    }

    if (!inputValue.trim() && required) {
      setValidationError("Date is required")
      return
    }

    const parsedDate = validateAndParseDate(inputValue)
    if (parsedDate) {
      onDateChange(parsedDate)
    } else if (required && !parsedDate) {
      // If date is required but invalid, keep the current date
      // but show validation error
    } else if (!required) {
      // If date is not required and invalid, clear the date
      onDateChange(undefined)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setInputValue("")
    onDateChange(undefined)
    setValidationError("")
  }

  return (
    <div className="w-full">
      <div className="relative">
        <Input
          id={id}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn("w-full", (error || validationError) && "border-destructive")}
          inputMode="numeric"
          aria-invalid={!!(error || validationError)}
          aria-describedby={id ? `${id}-error` : undefined}
        />
        {inputValue && clearable && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            onClick={handleClear}
            type="button"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      {(error || validationError) && (
        <p id={id ? `${id}-error` : undefined} className="mt-1 text-sm text-destructive">
          {error || validationError}
        </p>
      )}
    </div>
  )
}
