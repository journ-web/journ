"use client"

import { useState, useEffect } from "react"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSplitlyGroups } from "@/hooks/use-splitly-groups"
import { useToast } from "@/hooks/use-toast"
import type { SplitlyGroup, SplitlyMember } from "@/types/splitly"
import { CURRENCY_CODES, CURRENCY_DATA } from "@/utils/currency-data"

interface EditGroupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: SplitlyGroup
}

export function EditGroupModal({ open, onOpenChange, group }: EditGroupModalProps) {
  const { updateGroup, addMember, removeMember } = useSplitlyGroups()
  const { toast } = useToast()
  const [groupName, setGroupName] = useState(group.name)
  const [baseCurrency, setBaseCurrency] = useState(group.baseCurrency)
  const [members, setMembers] = useState<(SplitlyMember & { isNew?: boolean })[]>([])
  const [newMember, setNewMember] = useState({ name: "", email: "" })

  // Initialize with current group data
  useEffect(() => {
    if (open && group) {
      setGroupName(group.name)
      setBaseCurrency(group.baseCurrency)
      // Create a deep copy of the members array to avoid reference issues
      setMembers(group.members.map((member) => ({ ...member })))
      setNewMember({ name: "", email: "" })
    }
  }, [open, group])

  const handleAddMember = () => {
    const trimmedName = newMember.name.trim()
    if (!trimmedName) {
      toast({
        title: "Error",
        description: "Member name is required",
        variant: "destructive",
      })
      return
    }

    // Check for duplicate names
    const isDuplicate = members.some((member) => member.name.toLowerCase().trim() === trimmedName.toLowerCase())

    if (isDuplicate) {
      toast({
        title: "Error",
        description: "A member with this name already exists",
        variant: "destructive",
      })
      return
    }

    // Add the new member with a temporary ID
    setMembers([
      ...members,
      {
        ...newMember,
        name: trimmedName,
        email: newMember.email.trim(),
        id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        isNew: true,
      },
    ])

    // Reset the form
    setNewMember({ name: "", email: "" })
  }

  const handleRemoveMember = (index: number) => {
    const memberToRemove = members[index]

    // Check if this is an existing member with expenses or settlements
    if (!memberToRemove.isNew) {
      // This check is just for UI feedback - the actual validation happens in the hook
      const hasExpenses = group.expenses.some(
        (expense) =>
          expense.paidBy === memberToRemove.id || expense.participants.some((p) => p.memberId === memberToRemove.id),
      )

      const hasSettlements = group.settlements.some(
        (settlement) => settlement.paidBy === memberToRemove.id || settlement.paidTo === memberToRemove.id,
      )

      if (hasExpenses || hasSettlements) {
        toast({
          title: "Cannot remove member",
          description: "This member has existing expenses or settlements",
          variant: "destructive",
        })
        return
      }
    }

    setMembers(members.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    // Validate inputs
    if (!groupName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a group name",
        variant: "destructive",
      })
      return
    }

    // Check for duplicate member names
    const memberNames = members.map((member) => member.name.toLowerCase().trim())
    const hasDuplicates = memberNames.some((name, index) => memberNames.indexOf(name) !== index && name !== "")

    if (hasDuplicates) {
      toast({
        title: "Error",
        description: "Duplicate member names are not allowed",
        variant: "destructive",
      })
      return
    }

    // First update group details
    await updateGroup(group.id, {
      name: groupName,
      baseCurrency,
    })

    // Handle members (both new and existing)
    const existingMembers = members.filter((member) => !member.isNew)
    const newMembers = members.filter((member) => member.isNew)

    // Add new members one by one
    for (const member of newMembers) {
      if (member.name.trim()) {
        await addMember(group.id, {
          name: member.name,
          email: member.email || "",
        })
      }
    }

    // Handle removed members
    const existingMemberIds = existingMembers.map((member) => member.id)
    for (const originalMember of group.members) {
      if (!existingMemberIds.includes(originalMember.id)) {
        await removeMember(group.id, originalMember.id)
      }
    }

    toast({
      title: "Success",
      description: "Group updated successfully!",
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-background text-foreground">
        <DialogHeader>
          <DialogTitle>Edit group</DialogTitle>
          <DialogDescription>Update group details and manage members.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input id="group-name" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="base-currency">Base Currency</Label>
            <Select value={baseCurrency} onValueChange={setBaseCurrency}>
              <SelectTrigger id="base-currency">
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
            <p className="text-xs text-muted-foreground">
              All expenses will be converted to this currency for calculations.
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Group Members</Label>
            <div className="space-y-3">
              {members.map((member, index) => (
                <div key={member.id} className="flex items-center gap-2">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <Input value={member.name} readOnly className="bg-muted" />
                    <Input value={member.email || ""} readOnly className="bg-muted" />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Input
                  placeholder="Name (required)"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                />
                <Input
                  placeholder="Email (optional)"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                />
              </div>
              <Button variant="outline" size="icon" onClick={handleAddMember}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
