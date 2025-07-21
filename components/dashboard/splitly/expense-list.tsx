"use client"

import { Button } from "@/components/ui/button"

import { useState } from "react"
import { Calendar, MoreVertical, Edit, Trash2, CreditCard } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { SplitlyGroup, SplitlyExpense } from "@/types/splitly"
import { Input } from "@/components/ui/input"
import { AddExpenseModal } from "@/components/dashboard/splitly/add-expense-modal"
import { useSplitlyGroups } from "@/hooks/use-splitly-groups"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ExpenseListProps {
  group: SplitlyGroup
}

export function ExpenseList({ group }: ExpenseListProps) {
  const { deleteExpense } = useSplitlyGroups()
  const [searchTerm, setSearchTerm] = useState("")
  const [editingExpense, setEditingExpense] = useState<SplitlyExpense | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null)

  // Sort expenses by date (newest first)
  const sortedExpenses = [...group.expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Filter expenses by search term
  const filteredExpenses = sortedExpenses.filter((expense) =>
    expense.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getMemberName = (memberId: string) => {
    const member = group.members.find((m) => m.id === memberId)
    return member ? member.name : "Unknown"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number, currency: string = group.baseCurrency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const handleEditExpense = (expense: SplitlyExpense) => {
    setEditingExpense(expense)
    setIsEditModalOpen(true)
  }

  const handleDeleteExpense = (expenseId: string) => {
    deleteExpense(group.id, expenseId)
    setExpenseToDelete(null)
  }

  if (group.expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center border border-border">
          <CreditCard className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No expenses yet</h3>
        <p className="text-muted-foreground">Add an expense to start tracking who owes whom.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 rounded-xl border border-border bg-input text-foreground focus:ring-2 focus:ring-primary/20"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No expenses found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              group={group}
              getMemberName={getMemberName}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              onEdit={handleEditExpense}
              onDelete={() => setExpenseToDelete(expense.id)}
            />
          ))}
        </div>
      )}

      {editingExpense && (
        <AddExpenseModal
          open={isEditModalOpen}
          onOpenChange={(open) => {
            setIsEditModalOpen(open)
            if (!open) setEditingExpense(null)
          }}
          group={group}
          expense={editingExpense}
        />
      )}

      <AlertDialog open={!!expenseToDelete} onOpenChange={(open) => !open && setExpenseToDelete(null)}>
        <AlertDialogContent className="bg-background text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this expense and affect all balances. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => expenseToDelete && handleDeleteExpense(expenseToDelete)}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface ExpenseCardProps {
  expense: SplitlyExpense
  group: SplitlyGroup
  getMemberName: (memberId: string) => string
  formatDate: (dateString: string) => string
  formatCurrency: (amount: number, currency?: string) => string
  onEdit: (expense: SplitlyExpense) => void
  onDelete: () => void
}

function ExpenseCard({
  expense,
  group,
  getMemberName,
  formatDate,
  formatCurrency,
  onEdit,
  onDelete,
}: ExpenseCardProps) {
  return (
    <Card className="border border-border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{expense.title}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover text-popover-foreground">
                  <DropdownMenuItem onClick={() => onEdit(expense)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Calendar className="mr-1 h-3 w-3" />
              {formatDate(expense.date)}
            </div>
            <div className="mt-2">
              <span className="text-sm font-medium">Paid by:</span>{" "}
              <span className="text-sm">{getMemberName(expense.paidBy)}</span>
            </div>
            {expense.notes && <div className="mt-2 text-sm text-muted-foreground">{expense.notes}</div>}
          </div>
          <div className="mt-4 md:mt-0 md:ml-4 flex flex-col items-end">
            <div className="text-xl font-bold">{formatCurrency(expense.amount)}</div>
            {expense.originalAmount && expense.currency !== group.baseCurrency && (
              <div className="text-xs text-muted-foreground">
                Original: {formatCurrency(expense.originalAmount, expense.currency)} {expense.currency}
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              {expense.splitType === "equal" ? "Split equally" : "Custom split"}
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="text-sm font-medium mb-2">Participants</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {expense.participants.map((participant) => (
              <div
                key={participant.memberId}
                className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded-lg"
              >
                <span>{getMemberName(participant.memberId)}</span>
                <span className="font-medium">{formatCurrency(participant.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
