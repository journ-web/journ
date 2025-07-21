"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SplitlyGroup, SplitlySettlement, Balance } from "@/types/splitly"
import { useSplitlyGroups } from "@/hooks/use-splitly-groups"
import { useToast } from "@/hooks/use-toast"
import { CURRENCY_CODES } from "@/utils/currency-data"
import { CURRENCY_DATA } from "@/utils/currency-data"

interface AddSettlementModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: SplitlyGroup
  balances: Balance[]
  settlement?: SplitlySettlement // For editing existing settlement
}

export function AddSettlementModal({ open, onOpenChange, group, balances, settlement }: AddSettlementModalProps) {
  const { addSettlement, updateSettlement } = useSplitlyGroups()
  const { toast } = useToast()
  const [paidBy, setPaidBy] = useState("")
  const [paidTo, setPaidTo] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState(group.baseCurrency)
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [notes, setNotes] = useState("")
  const [suggestedAmount, setSuggestedAmount] = useState<number | null>(null)
  const isEditing = !!settlement

  // Initialize form when the modal opens or when editing a settlement
  useEffect(() => {
    if (open) {
      if (settlement) {
        // Editing mode
        setPaidBy(settlement.paidBy)
        setPaidTo(settlement.paidTo)
        setAmount(settlement.amount.toString())
        setCurrency(settlement.currency || group.baseCurrency)
        setDate(settlement.date)
        setNotes(settlement.notes || "")
      } else {
        // New settlement mode
        setCurrency(group.baseCurrency)
        // Default to first member if available
        if (group.members.length > 0) {
          setPaidBy(group.members[0].id)
        }
      }
    }
  }, [open, group, settlement])

  // Reset form when modal closes
  useEffect(() => {
    if (!open && !isEditing) {
      setPaidBy("")
      setPaidTo("")
      setAmount("")
      setCurrency(group.baseCurrency)
      setDate(new Date().toISOString().split("T")[0])
      setNotes("")
      setSuggestedAmount(null)
    }
  }, [open, isEditing, group.baseCurrency])

  // Update suggested amount when paidBy or paidTo changes
  useEffect(() => {
    if (paidBy && paidTo) {
      // Find if there's a balance between these two members
      const balance = balances.find(
        (b) => (b.from === paidBy && b.to === paidTo) || (b.from === paidTo && b.to === paidBy),
      )

      if (balance) {
        if (balance.from === paidBy && balance.to === paidTo) {
          // This is a reverse settlement (paying back a debt)
          setSuggestedAmount(null)
        } else {
          // This is a normal settlement
          setSuggestedAmount(balance.amount)
        }
      } else {
        setSuggestedAmount(null)
      }
    } else {
      setSuggestedAmount(null)
    }
  }, [paidBy, paidTo, balances])

  const handleSubmit = async () => {
    // Validate inputs
    if (!paidBy) {
      toast({
        title: "⚠ Validation Error",
        description: "Please select who paid the settlement",
        variant: "destructive",
      })
      return
    }

    if (!paidTo) {
      toast({
        title: "⚠ Validation Error",
        description: "Please select who received the payment",
        variant: "destructive",
      })
      return
    }

    if (paidBy === paidTo) {
      toast({
        title: "⚠ Validation Error",
        description: "A person cannot pay themselves",
        variant: "destructive",
      })
      return
    }

    if (!amount || isNaN(Number.parseFloat(amount)) || Number.parseFloat(amount) <= 0) {
      toast({
        title: "⚠ Validation Error",
        description: "Please enter a valid amount greater than zero",
        variant: "destructive",
      })
      return
    }

    if (!date) {
      toast({
        title: "⚠ Validation Error",
        description: "Please select a date for this settlement",
        variant: "destructive",
      })
      return
    }

    // Check if settlement amount exceeds what is owed
    const balance = balances.find((b) => b.from === paidBy && b.to === paidTo)

    if (balance && Number.parseFloat(amount) > balance.amount) {
      toast({
        title: "⚠ Validation Error",
        description: "You cannot settle more than the owed amount",
        variant: "destructive",
      })
      return
    }

    // Create or update the settlement
    const settlementData = {
      paidBy,
      paidTo,
      amount: Number.parseFloat(amount),
      currency,
      date,
      notes: notes.trim() || undefined,
    }

    if (isEditing && settlement) {
      await updateSettlement(group.id, settlement.id, settlementData)
      toast({
        title: "✏ Success",
        description: "Settlement edited successfully",
      })
    } else {
      await addSettlement(group.id, settlementData)
      toast({
        title: "✅ Success",
        description: "Settlement successful – balance updated",
      })
    }

    onOpenChange(false)
  }

  const handleUseSuggestedAmount = () => {
    if (suggestedAmount !== null) {
      setAmount(suggestedAmount.toFixed(2))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background text-foreground">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit settlement" : "Add a settlement"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update settlement details" : "Record a payment between group members."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="paid-by">Paid by</Label>
            <Select value={paidBy} onValueChange={setPaidBy}>
              <SelectTrigger id="paid-by">
                <SelectValue placeholder="Select a person" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground">
                {group.members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="paid-to">Paid to</Label>
            <Select value={paidTo} onValueChange={setPaidTo}>
              <SelectTrigger id="paid-to">
                <SelectValue placeholder="Select a person" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground">
                {group.members.map((member) => (
                  <SelectItem key={member.id} value={member.id} disabled={member.id === paidBy}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {suggestedAmount !== null && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1 w-full text-sm bg-transparent"
                  onClick={handleUseSuggestedAmount}
                >
                  Use suggested amount:{" "}
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: group.baseCurrency,
                  }).format(suggestedAmount)}
                </Button>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] bg-popover text-popover-foreground">
                  {CURRENCY_CODES.map((currencyCode) => {
                    const currencyData = CURRENCY_DATA.find((c) => c.code === currencyCode)
                    return (
                      <SelectItem key={currencyCode} value={currencyCode}>
                        {currencyData?.flag} {currencyCode} - {currencyData?.name}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          {currency !== group.baseCurrency && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              <p className="font-medium mb-1">Currency Conversion</p>
              <p>
                This settlement will be converted from {currency} to {group.baseCurrency} (group base currency) using
                the latest exchange rates.
              </p>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>{isEditing ? "Update" : "Add"} Settlement</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
