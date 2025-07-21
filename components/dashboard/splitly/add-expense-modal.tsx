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
import { Checkbox } from "@/components/ui/checkbox"
import type { SplitlyGroup, SplitlyExpense } from "@/types/splitly"
import { useSplitlyGroups } from "@/hooks/use-splitly-groups"
import { useToast } from "@/hooks/use-toast"
import { CURRENCY_CODES } from "@/utils/currency-data"
import { CURRENCY_DATA } from "@/utils/currency-data"

interface AddExpenseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: SplitlyGroup
  expense?: SplitlyExpense // For editing existing expense
}

export function AddExpenseModal({ open, onOpenChange, group, expense }: AddExpenseModalProps) {
  const { addExpense, updateExpense } = useSplitlyGroups()
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState(group.baseCurrency)
  const [paidBy, setPaidBy] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [notes, setNotes] = useState("")
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal")
  const [participants, setParticipants] = useState<{ memberId: string; selected: boolean; amount: string }[]>([])
  const isEditing = !!expense

  // Initialize form when the modal opens or when editing an expense
  useEffect(() => {
    if (open) {
      if (expense) {
        // Editing mode
        setTitle(expense.title)
        setAmount(expense.originalAmount?.toString() || expense.amount.toString())
        setCurrency(expense.currency || group.baseCurrency)
        setPaidBy(expense.paidBy)
        setDate(expense.date)
        setNotes(expense.notes || "")
        setSplitType(expense.splitType)

        // Set participants
        const participantMap = new Map(expense.participants.map((p) => [p.memberId, p.amount]))

        setParticipants(
          group.members.map((member) => ({
            memberId: member.id,
            selected: participantMap.has(member.id),
            amount: participantMap.get(member.id)?.toString() || "",
          })),
        )
      } else {
        // New expense mode
        setPaidBy(group.members[0]?.id || "")
        setParticipants(
          group.members.map((member) => ({
            memberId: member.id,
            selected: true,
            amount: "",
          })),
        )
      }
    }
  }, [open, group, expense])

  // Reset form when modal closes
  useEffect(() => {
    if (!open && !isEditing) {
      setTitle("")
      setAmount("")
      setCurrency(group.baseCurrency)
      setPaidBy("")
      setDate(new Date().toISOString().split("T")[0])
      setNotes("")
      setSplitType("equal")
      setParticipants([])
    }
  }, [open, isEditing, group.baseCurrency])

  // Update participant amounts when amount or split type changes
  useEffect(() => {
    if (splitType === "equal" && amount) {
      const selectedParticipants = participants.filter((p) => p.selected)
      if (selectedParticipants.length > 0) {
        const amountValue = Number.parseFloat(amount)
        const equalShare = amountValue / selectedParticipants.length

        setParticipants(
          participants.map((participant) => ({
            ...participant,
            amount: participant.selected ? equalShare.toFixed(2) : "0",
          })),
        )
      }
    }
  }, [amount, splitType, participants.map((p) => p.selected).join(",")])

  const handleParticipantToggle = (memberId: string, selected: boolean) => {
    setParticipants(
      participants.map((participant) =>
        participant.memberId === memberId ? { ...participant, selected } : participant,
      ),
    )
  }

  const handleParticipantAmountChange = (memberId: string, value: string) => {
    setParticipants(
      participants.map((participant) =>
        participant.memberId === memberId ? { ...participant, amount: value } : participant,
      ),
    )
  }

  const handleSubmit = async () => {
    // Validate inputs
    if (!title.trim()) {
      toast({
        title: "⚠ Validation Error",
        description: "Please fill all required fields - expense title is missing",
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

    if (!paidBy) {
      toast({
        title: "⚠ Validation Error",
        description: "Please select who paid for this expense",
        variant: "destructive",
      })
      return
    }

    if (!date) {
      toast({
        title: "⚠ Validation Error",
        description: "Please select a date for this expense",
        variant: "destructive",
      })
      return
    }

    const selectedParticipants = participants.filter((p) => p.selected)
    if (selectedParticipants.length === 0) {
      toast({
        title: "⚠ Validation Error",
        description: "Please select at least one participant for this expense",
        variant: "destructive",
      })
      return
    }

    // For custom split, validate that the sum equals the total amount
    if (splitType === "custom") {
      const totalShares = selectedParticipants.reduce((sum, p) => sum + (Number.parseFloat(p.amount) || 0), 0)

      if (Math.abs(totalShares - Number.parseFloat(amount)) > 0.01) {
        toast({
          title: "⚠ Validation Error",
          description: "The sum of shares must equal the total amount",
          variant: "destructive",
        })
        return
      }
    }

    // Create or update the expense
    const expenseData = {
      title,
      amount: Number.parseFloat(amount),
      currency,
      paidBy,
      date,
      participants: selectedParticipants.map((p) => ({
        memberId: p.memberId,
        amount: Number.parseFloat(p.amount),
      })),
      splitType,
      notes: notes.trim() || undefined,
    }

    if (isEditing && expense) {
      await updateExpense(group.id, expense.id, expenseData)
      toast({
        title: "✏ Success",
        description: "Expense edited successfully",
      })
    } else {
      await addExpense(group.id, expenseData)
      toast({
        title: "✅ Success",
        description: "Expense recorded successfully",
      })
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-background text-foreground">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit expense" : "Add an expense"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update expense details" : "Add an expense to split among group members."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Dinner, Groceries"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
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
                This expense will be converted from {currency} to {group.baseCurrency} (group base currency) using the
                latest exchange rates.
              </p>
            </div>
          )}
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
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="split-type">Split type</Label>
            <Select value={splitType} onValueChange={(value) => setSplitType(value as "equal" | "custom")}>
              <SelectTrigger id="split-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground">
                <SelectItem value="equal">Equal</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Participants</Label>
            <div className="space-y-2 border rounded-md p-3 bg-card text-card-foreground">
              {participants.map((participant) => {
                const member = group.members.find((m) => m.id === participant.memberId)
                return (
                  <div key={participant.memberId} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`participant-${participant.memberId}`}
                        checked={participant.selected}
                        onCheckedChange={(checked) => handleParticipantToggle(participant.memberId, checked as boolean)}
                      />
                      <Label htmlFor={`participant-${participant.memberId}`} className="text-sm font-normal">
                        {member?.name}
                      </Label>
                    </div>
                    {splitType === "custom" && participant.selected && (
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={participant.amount}
                        onChange={(e) => handleParticipantAmountChange(participant.memberId, e.target.value)}
                        className="w-24"
                      />
                    )}
                  </div>
                )
              })}
            </div>
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
          <Button onClick={handleSubmit}>{isEditing ? "Update" : "Add"} Expense</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
