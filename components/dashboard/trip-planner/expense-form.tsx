"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowRight,
  Briefcase,
  CreditCard,
  Heart,
  Home,
  Plane,
  Shield,
  ShoppingBag,
  Sparkles,
  Ticket,
  Utensils,
} from "lucide-react"
import { formatCurrency } from "@/utils/currency"
import { useExchangeRates } from "@/utils/exchange-rates"
import type { Trip, ExpenseCategory, FundType } from "@/types/trip"
import { useResponsive } from "@/hooks/use-responsive"

const expenseCategories = [
  { value: "accommodation", label: "Accommodation", icon: <Home className="h-4 w-4" /> },
  { value: "food", label: "Food & Drinks", icon: <Utensils className="h-4 w-4" /> },
  { value: "transportation", label: "Transportation", icon: <Plane className="h-4 w-4" /> },
  { value: "activities", label: "Activities & Tours", icon: <Ticket className="h-4 w-4" /> },
  { value: "shopping", label: "Shopping", icon: <ShoppingBag className="h-4 w-4" /> },
  { value: "entertainment", label: "Entertainment", icon: <Sparkles className="h-4 w-4" /> },
  { value: "health", label: "Health & Medical", icon: <Heart className="h-4 w-4" /> },
  { value: "other", label: "Other", icon: <Briefcase className="h-4 w-4" /> },
]

interface ExpenseFormProps {
  isEdit?: boolean
  onSubmit: () => void
  onCancel: () => void
  expenseData: {
    name: string
    category: ExpenseCategory
    date: string
    amount: number
    notes: string
    fundType: FundType
  }
  setExpenseData: React.Dispatch<
    React.SetStateAction<{
      name: string
      category: ExpenseCategory
      date: string
      amount: number
      notes: string
      fundType: FundType
    }>
  >
  selectedTrip: Trip | null
  formErrors: Record<string, string>
}

export function ExpenseForm({
  isEdit = false,
  onSubmit,
  onCancel,
  expenseData,
  setExpenseData,
  selectedTrip,
  formErrors,
}: ExpenseFormProps) {
  const { convertCurrency } = useExchangeRates()
  const { isMobile, isTablet } = useResponsive()

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="expense-name">Expense Name</Label>
        <Input
          id="expense-name"
          value={expenseData.name}
          onChange={(e) => setExpenseData({ ...expenseData, name: e.target.value })}
          placeholder="Hotel Booking"
          className={formErrors.name ? "border-red-500" : ""}
        />
        {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="expense-category">Category</Label>
          <Select
            value={expenseData.category}
            onValueChange={(value) => setExpenseData({ ...expenseData, category: value as ExpenseCategory })}
          >
            <SelectTrigger id="expense-category" className={formErrors.category ? "border-red-500" : ""}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {expenseCategories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  <div className="flex items-center">
                    <span className="mr-2">{category.icon}</span>
                    {category.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.category && <p className="text-xs text-red-500">{formErrors.category}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="expense-date">Date</Label>
          <Input
            id="expense-date"
            type="date"
            value={expenseData.date}
            onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })}
            className={formErrors.date ? "border-red-500" : ""}
          />
          {formErrors.date && <p className="text-xs text-red-500">{formErrors.date}</p>}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="expense-fund">Fund Type</Label>
        <Select
          value={expenseData.fundType}
          onValueChange={(value) => setExpenseData({ ...expenseData, fundType: value as FundType })}
        >
          <SelectTrigger id="expense-fund" className={formErrors.fundType ? "border-red-500" : ""}>
            <SelectValue placeholder="Select fund" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="budget">
              <div className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4 text-primary" />
                Trip Budget
              </div>
            </SelectItem>
            <SelectItem value="safety">
              <div className="flex items-center">
                <Shield className="mr-2 h-4 w-4 text-amber-500" />
                Safety Funds
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        {formErrors.fundType && <p className="text-xs text-red-500">{formErrors.fundType}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="expense-amount">Amount in {selectedTrip?.tripCurrency}</Label>
        <Input
          id="expense-amount"
          type="number"
          min={0}
          step={0.01}
          value={expenseData.amount}
          onChange={(e) => setExpenseData({ ...expenseData, amount: Number.parseFloat(e.target.value) || 0 })}
          placeholder="0.00"
          className={formErrors.amount ? "border-red-500" : ""}
        />
        {formErrors.amount && <p className="text-xs text-red-500">{formErrors.amount}</p>}
        {selectedTrip && expenseData.amount > 0 && (
          <div className="text-xs space-y-1">
            <p className="font-medium text-muted-foreground flex items-center">
              <span>Conversion:</span>
              <ArrowRight className="h-3 w-3 mx-1" />
              <span className="text-foreground">
                {formatCurrency(
                  convertCurrency(expenseData.amount, selectedTrip.tripCurrency, selectedTrip.homeCurrency),
                  selectedTrip.homeCurrency,
                )}
              </span>
            </p>
            <p className="text-muted-foreground">
              This amount will be deducted from your budget in {selectedTrip.homeCurrency}
            </p>
          </div>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="expense-notes">Notes (Optional)</Label>
        <Textarea
          id="expense-notes"
          value={expenseData.notes}
          onChange={(e) => setExpenseData({ ...expenseData, notes: e.target.value })}
          placeholder="Additional details about the expense"
        />
      </div>
      <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button onClick={onSubmit} className="w-full sm:w-auto">
          {isEdit ? "Update Expense" : "Add Expense"}
        </Button>
      </div>
    </div>
  )
}
