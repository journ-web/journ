"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { useAuth } from "@/contexts/auth-context"
import { CURRENCY_CODES } from "@/utils/currency-data"
import { CURRENCY_DATA } from "@/utils/currency-data"

interface CreateGroupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateGroupModal({ open, onOpenChange }: CreateGroupModalProps) {
  const router = useRouter()
  const { createGroup } = useSplitlyGroups()
  const { toast } = useToast()
  const { user } = useAuth()
  const [groupName, setGroupName] = useState("")
  const [baseCurrency, setBaseCurrency] = useState("USD")
  const [members, setMembers] = useState([{ name: "", email: "" }])
  const [includeCurrentUser, setIncludeCurrentUser] = useState(true)

  // Initialize with current user
  useEffect(() => {
    if (open && user && includeCurrentUser) {
      // Check if current user is already in the list
      const currentUserExists = members.some(
        (member) => member.email === user.email || (member.name && member.name.includes(user.displayName || "")),
      )

      if (!currentUserExists) {
        setMembers([
          { name: user.displayName || "Me", email: user.email || "" },
          ...members.filter((member) => member.name || member.email), // Keep only non-empty members
        ])
      }
    }
  }, [open, user, includeCurrentUser])

  const handleAddMember = () => {
    setMembers([...members, { name: "", email: "" }])
  }

  const handleRemoveMember = (index: number) => {
    if (members.length <= 1) {
      toast({
        title: "Error",
        description: "A group must have at least 1 member",
        variant: "destructive",
      })
      return
    }
    setMembers(members.filter((_, i) => i !== index))
  }

  const handleMemberChange = (index: number, field: "name" | "email", value: string) => {
    const newMembers = [...members]
    newMembers[index][field] = value
    setMembers(newMembers)
  }

  const handleSubmit = () => {
    // Validate inputs
    if (!groupName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a group name",
        variant: "destructive",
      })
      return
    }

    // Check if all members have names
    const invalidMembers = members.filter((member) => !member.name.trim())
    if (invalidMembers.length > 0) {
      toast({
        title: "Error",
        description: "All members must have a name",
        variant: "destructive",
      })
      return
    }

    // Create the group
    const newGroup = createGroup(groupName, baseCurrency, members)
    onOpenChange(false)

    // Reset form
    setGroupName("")
    setBaseCurrency("USD")
    setMembers([{ name: "", email: "" }])

    // Navigate to the new group
    router.push(`/dashboard/splitly/${newGroup.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-background text-foreground">
        <DialogHeader>
          <DialogTitle>Create a new group</DialogTitle>
          <DialogDescription>Create a group to start splitting expenses with friends and family.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              placeholder="e.g., Roommates, Trip to Paris"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
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
              All expenses will be converted to this currency for calculations using live exchange rates.
            </p>
          </div>

          {user && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="include-current-user"
                checked={includeCurrentUser}
                onChange={(e) => setIncludeCurrentUser(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="include-current-user" className="text-sm font-normal">
                Include myself as a member
              </Label>
            </div>
          )}

          <div className="grid gap-2">
            <Label>Group Members</Label>
            <div className="space-y-3">
              {members.map((member, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Name (required)"
                      value={member.name}
                      onChange={(e) => handleMemberChange(index, "name", e.target.value)}
                    />
                    <Input
                      placeholder="Email (optional)"
                      type="email"
                      value={member.email}
                      onChange={(e) => handleMemberChange(index, "email", e.target.value)}
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-2 bg-transparent" onClick={handleAddMember}>
              <Plus className="mr-2 h-4 w-4" /> Add Member
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Group</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
