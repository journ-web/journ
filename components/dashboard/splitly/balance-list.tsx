"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { SplitlyGroup, Balance } from "@/types/splitly"
import { useMemo } from "react"
import { CheckCircle2 } from "lucide-react"

interface BalanceListProps {
  group: SplitlyGroup
  balances: Balance[]
  onAddSettlement: () => void
}

export function BalanceList({ group, balances, onAddSettlement }: BalanceListProps) {
  const getMemberName = (memberId: string) => {
    const member = group.members.find((m) => m.id === memberId)
    return member ? member.name : "Unknown"
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: group.baseCurrency,
    }).format(amount)
  }

  // Calculate total paid, owed, and net balance for each member
  const memberBalances = useMemo(() => {
    const result: Record<string, { paid: number; owed: number; net: number }> = {}

    // Initialize with zero values for all members
    group.members.forEach((member) => {
      result[member.id] = { paid: 0, owed: 0, net: 0 }
    })

    // Calculate from expenses
    group.expenses.forEach((expense) => {
      // Add to paid amount for the payer
      result[expense.paidBy].paid += expense.amount

      // Add to owed amounts for participants
      expense.participants.forEach((participant) => {
        result[participant.memberId].owed += participant.amount
      })
    })

    // Apply settlements
    group.settlements.forEach((settlement) => {
      result[settlement.paidBy].paid += settlement.amount
      result[settlement.paidTo].owed += settlement.amount
    })

    // Calculate net balance
    Object.keys(result).forEach((memberId) => {
      result[memberId].net = result[memberId].paid - result[memberId].owed
    })

    return result
  }, [group.expenses, group.settlements, group.members])

  if (balances.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-200 dark:border-emerald-700">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">All settled!</h3>
          <p className="text-muted-foreground mb-6">Everyone is settled up! No one owes anyone else.</p>
          <Button
            onClick={onAddSettlement}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" /> Record a Settlement
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground mb-4 p-3 bg-muted/50 rounded-xl border border-border">
        All balances are shown in the group's base currency: <strong>{group.baseCurrency}</strong>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center justify-between">
          Outstanding Balances
          <Button
            onClick={onAddSettlement}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Settlement
          </Button>
        </h3>

        {balances.map((balance, index) => (
          <Card
            key={index}
            className="border border-border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200"
          >
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-medium">{getMemberName(balance.from)}</span>
                    <span className="mx-2 text-muted-foreground">owes</span>
                    <span className="font-medium">{getMemberName(balance.to)}</span>
                  </div>
                </div>
                <div className="mt-2 md:mt-0 md:ml-4">
                  <div className="text-xl font-bold">{formatCurrency(balance.amount)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-semibold">Member Balances</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {group.members.map((member) => {
            const balance = memberBalances[member.id]
            const isPositive = balance.net >= 0

            return (
              <Card
                key={member.id}
                className="border border-border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200"
              >
                <CardContent className="p-4">
                  <h4 className="font-medium text-lg">{member.name}</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Total Paid:</span>
                      <span>{formatCurrency(balance.paid)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Owed:</span>
                      <span>{formatCurrency(balance.owed)}</span>
                    </div>
                    <div className="border-t border-border pt-1 mt-1 flex justify-between font-medium">
                      <span>Net Balance:</span>
                      <span className={isPositive ? "text-emerald-600" : "text-red-600"}>
                        {isPositive
                          ? `You are owed ${formatCurrency(balance.net)}`
                          : `You owe ${formatCurrency(Math.abs(balance.net))}`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
