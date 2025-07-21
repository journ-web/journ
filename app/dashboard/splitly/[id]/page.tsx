"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Plus, Edit, Trash2, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSplitlyGroups } from "@/hooks/use-splitly-groups"
import { AddExpenseModal } from "@/components/dashboard/splitly/add-expense-modal"
import { AddSettlementModal } from "@/components/dashboard/splitly/add-settlement-modal"
import { EditGroupModal } from "@/components/dashboard/splitly/edit-group-modal"
import { ExpenseList } from "@/components/dashboard/splitly/expense-list"
import { BalanceList } from "@/components/dashboard/splitly/balance-list"
import { SettlementList } from "@/components/dashboard/splitly/settlement-list"
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
import Link from "next/link"

export default function GroupDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id as string
  const { getGroup, calculateBalances, deleteGroup } = useSplitlyGroups()
  const group = getGroup(groupId)
  const balances = calculateBalances(groupId)

  const [activeTab, setActiveTab] = useState("expenses")
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false)
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleDeleteGroup = () => {
    deleteGroup(groupId)
    router.push("/dashboard/splitly")
  }

  if (!group) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link href="/dashboard/splitly">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Groups
            </Button>
          </Link>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Group not found</h2>
          <p className="text-muted-foreground mt-2">The group you're looking for doesn't exist or has been deleted.</p>
          <Link href="/dashboard/splitly">
            <Button className="mt-6">Go back to Groups</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Link href="/dashboard/splitly">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Groups
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditGroupModalOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Group
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Group
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-muted-foreground mt-1">
            {group.members.length} members • Base Currency: {group.baseCurrency}
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          {activeTab === "expenses" && (
            <Button onClick={() => setIsExpenseModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Expense
            </Button>
          )}
          {activeTab === "settlements" && (
            <Button onClick={() => setIsSettlementModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Settlement
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-2">Group Members</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {group.members.map((member) => (
            <div key={member.id} className="flex items-center p-3 bg-muted rounded-md">
              <div className="flex-1">
                <div className="font-medium">{member.name}</div>
                {member.email && <div className="text-sm text-muted-foreground">{member.email}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-4">Group Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-muted rounded-md">
            <div className="text-sm text-muted-foreground">Total Group Expenses</div>
            <div className="text-xl font-bold mt-1">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: group.baseCurrency,
              }).format(group.expenses.reduce((sum, expense) => sum + expense.amount, 0))}
            </div>
            <div className="text-xs text-muted-foreground mt-1">All amounts in {group.baseCurrency}</div>
          </div>
          <div className="p-3 bg-muted rounded-md">
            <div className="text-sm text-muted-foreground">Outstanding Balances</div>
            <div className="text-xl font-bold mt-1">
              {balances.length > 0 ? balances.length : <span className="text-green-600">All settled</span>}
            </div>
          </div>
          <div className="p-3 bg-muted rounded-md">
            <div className="text-sm text-muted-foreground">Settlements</div>
            <div className="text-xl font-bold mt-1">{group.settlements.length}</div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
          <TabsTrigger value="settlements">Settlements</TabsTrigger>
        </TabsList>
        <TabsContent value="expenses">
          <ExpenseList group={group} />
        </TabsContent>
        <TabsContent value="balances">
          <BalanceList
            group={group}
            balances={balances}
            onAddSettlement={() => {
              setActiveTab("balances")
              setIsSettlementModalOpen(true)
            }}
          />
        </TabsContent>
        <TabsContent value="settlements">
          <SettlementList group={group} />
        </TabsContent>
      </Tabs>

      <AddExpenseModal open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen} group={group} />
      <AddSettlementModal
        open={isSettlementModalOpen}
        onOpenChange={setIsSettlementModalOpen}
        group={group}
        balances={balances}
      />
      <EditGroupModal open={isEditGroupModalOpen} onOpenChange={setIsEditGroupModalOpen} group={group} />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the group "{group.name}" and all its expenses and settlements. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGroup} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
