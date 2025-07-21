"use client"

import { Button } from "@/components/ui/button"

import { useState } from "react"
import { Calendar, MoreVertical, Edit, Trash2, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { SplitlyGroup, SplitlySettlement } from "@/types/splitly"
import { AddSettlementModal } from "@/components/dashboard/splitly/add-settlement-modal"
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

interface SettlementListProps {
  group: SplitlyGroup
}

export function SettlementList({ group }: SettlementListProps) {
  const { deleteSettlement, calculateBalances } = useSplitlyGroups()
  const [editingSettlement, setEditingSettlement] = useState<SplitlySettlement | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [settlementToDelete, setSettlementToDelete] = useState<string | null>(null)
  const balances = calculateBalances(group.id)

  // Sort settlements by date (newest first)
  const sortedSettlements = [...group.settlements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
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

  const handleEditSettlement = (settlement: SplitlySettlement) => {
    setEditingSettlement(settlement)
    setIsEditModalOpen(true)
  }

  const handleDeleteSettlement = (settlementId: string) => {
    deleteSettlement(group.id, settlementId)
    setSettlementToDelete(null)
  }

  if (group.settlements.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center border border-border">
          <ArrowRight className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No settlements yet</h3>
        <p className="text-muted-foreground">Record a settlement when someone pays back what they owe.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {sortedSettlements.map((settlement) => (
          <Card
            key={settlement.id}
            className="border border-border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200"
          >
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">
                      {getMemberName(settlement.paidBy)} → {getMemberName(settlement.paidTo)}
                    </h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover text-popover-foreground">
                        <DropdownMenuItem onClick={() => handleEditSettlement(settlement)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setSettlementToDelete(settlement.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Calendar className="mr-1 h-3 w-3" />
                    {formatDate(settlement.date)}
                  </div>
                  {settlement.notes && <div className="mt-2 text-sm text-muted-foreground">{settlement.notes}</div>}
                </div>
                <div className="mt-4 md:mt-0 md:ml-4 flex flex-col items-end">
                  <div className="text-xl font-bold">{formatCurrency(settlement.amount)}</div>
                  {settlement.currency !== group.baseCurrency && (
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(settlement.amount, settlement.currency)} {settlement.currency}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingSettlement && (
        <AddSettlementModal
          open={isEditModalOpen}
          onOpenChange={(open) => {
            setIsEditModalOpen(open)
            if (!open) setEditingSettlement(null)
          }}
          group={group}
          balances={balances}
          settlement={editingSettlement}
        />
      )}

      <AlertDialog open={!!settlementToDelete} onOpenChange={(open) => !open && setSettlementToDelete(null)}>
        <AlertDialogContent className="bg-background text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this settlement and affect all balances. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => settlementToDelete && handleDeleteSettlement(settlementToDelete)}
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
