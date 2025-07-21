"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import type { SplitlyGroup, SplitlyExpense, SplitlySettlement, Balance, SplitlyMember } from "@/types/splitly"
import { useToast } from "@/hooks/use-toast"
import {
  getSplitlyGroups,
  createSplitlyGroup,
  updateSplitlyGroup,
  deleteSplitlyGroup,
  addSplitlyMember,
  updateSplitlyMember,
  removeSplitlyMember,
  addSplitlyExpense,
  updateSplitlyExpense,
  deleteSplitlyExpense,
  addSplitlySettlement,
  updateSplitlySettlement,
  deleteSplitlySettlement,
} from "@/lib/firestore-service"

// Update the getExchangeRate function to use the existing utility
const getExchangeRate = async (fromCurrency: string, toCurrency: string): Promise<number> => {
  if (fromCurrency === toCurrency) return 1

  try {
    // Load exchange rate data from localStorage
    const storedData = localStorage.getItem("tripwiser-exchange-rates")
    if (!storedData) {
      throw new Error("No exchange rate data available")
    }

    const exchangeRateData = JSON.parse(storedData)
    const rates = exchangeRateData.rates

    if (!rates || !rates[fromCurrency] || !rates[toCurrency]) {
      throw new Error("Exchange rate not available for the selected currencies")
    }

    // Calculate the exchange rate using the base currency (USD)
    return rates[toCurrency] / rates[fromCurrency]
  } catch (error) {
    console.error("Error getting exchange rate:", error)
    // Return 1 as fallback (no conversion)
    return 1
  }
}

// Helper function to clean object from undefined values
const removeUndefinedValues = (obj: Record<string, any>): Record<string, any> => {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      // If value is an object (but not null, array, or date), recursively clean it
      if (value !== null && typeof value === "object" && !(value instanceof Date) && !Array.isArray(value)) {
        const cleanedValue = removeUndefinedValues(value)
        if (Object.keys(cleanedValue).length > 0) {
          acc[key] = cleanedValue
        }
      }
      // If it's an array, clean each object in the array
      else if (Array.isArray(value)) {
        const cleanedArray = value.map((item) =>
          typeof item === "object" && item !== null ? removeUndefinedValues(item) : item,
        )
        acc[key] = cleanedArray
      }
      // Otherwise, include the value if it's not undefined
      else if (value !== undefined) {
        acc[key] = value
      }
      return acc
    },
    {} as Record<string, any>,
  )
}

export function useSplitlyGroups() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [groups, setGroups] = useState<SplitlyGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadGroups = async () => {
      if (!user?.uid) {
        setLoading(false)
        return
      }

      try {
        const result = await getSplitlyGroups(user.uid)
        if (result.success) {
          setGroups(result.data)
        } else {
          console.error("Error loading groups:", result.error)
        }
      } catch (error) {
        console.error("Error loading groups:", error)
      } finally {
        setLoading(false)
      }
    }

    loadGroups()
  }, [user])

  const createGroup = async (name: string, baseCurrency: string, members: { name: string; email?: string }[]) => {
    if (!user?.uid) {
      toast({
        title: "Error",
        description: "You must be logged in to create a group",
        variant: "destructive",
      })
      return null
    }

    const membersWithIds = members.map((member) => ({
      id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: member.name,
      email: member.email,
    }))

    const newGroup: Omit<SplitlyGroup, "id" | "createdAt" | "updatedAt"> = {
      name,
      baseCurrency,
      members: membersWithIds,
      expenses: [],
      settlements: [],
    }

    const result = await createSplitlyGroup(user.uid, newGroup)

    if (result.success) {
      const createdGroup = {
        ...newGroup,
        id: result.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as SplitlyGroup

      setGroups((prevGroups) => [...prevGroups, createdGroup])

      toast({
        title: "Success",
        description: `Group "${name}" created successfully`,
      })

      return createdGroup
    } else {
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      })
      return null
    }
  }

  const getGroup = (groupId: string) => {
    return groups.find((group) => group.id === groupId)
  }

  const updateGroup = async (groupId: string, updates: Partial<Omit<SplitlyGroup, "id" | "createdAt">>) => {
    if (!user?.uid) {
      toast({
        title: "Error",
        description: "You must be logged in to update a group",
        variant: "destructive",
      })
      return
    }

    try {
      // Clean the updates to remove any undefined values
      const cleanedUpdates = removeUndefinedValues(updates)

      const result = await updateSplitlyGroup(user.uid, groupId, cleanedUpdates)

      if (result.success) {
        // Update the local state with the changes
        setGroups((prevGroups) =>
          prevGroups.map((group) => {
            if (group.id === groupId) {
              return {
                ...group,
                ...cleanedUpdates,
                updatedAt: new Date().toISOString(),
              }
            }
            return group
          }),
        )

        toast({
          title: "Success",
          description: "Group updated successfully",
        })

        return true
      } else {
        toast({
          title: "Error",
          description: "Failed to update group",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error("Error updating group:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      return false
    }
  }

  const deleteGroup = async (groupId: string) => {
    if (!user?.uid) {
      toast({
        title: "Error",
        description: "You must be logged in to delete a group",
        variant: "destructive",
      })
      return
    }

    const result = await deleteSplitlyGroup(user.uid, groupId)

    if (result.success) {
      setGroups((prevGroups) => prevGroups.filter((group) => group.id !== groupId))

      toast({
        title: "Success",
        description: "Group deleted successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive",
      })
    }
  }

  const addMember = async (groupId: string, member: Omit<SplitlyMember, "id">) => {
    if (!user?.uid) {
      toast({
        title: "Error",
        description: "You must be logged in to add a member",
        variant: "destructive",
      })
      return
    }

    try {
      // Clean the member data
      const cleanedMember = removeUndefinedValues(member)

      const result = await addSplitlyMember(user.uid, groupId, cleanedMember)

      if (result.success) {
        const newMember: SplitlyMember = {
          ...cleanedMember,
          id: result.id,
        }

        // Update the local state with the new member
        setGroups((prevGroups) =>
          prevGroups.map((group) => {
            if (group.id === groupId) {
              return {
                ...group,
                members: [...group.members, newMember],
                updatedAt: new Date().toISOString(),
              }
            }
            return group
          }),
        )

        toast({
          title: "Success",
          description: `Member "${member.name}" added successfully`,
        })

        return newMember
      } else {
        toast({
          title: "Error",
          description: "Failed to add member",
          variant: "destructive",
        })
        return null
      }
    } catch (error) {
      console.error("Error adding member:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      return null
    }
  }

  const updateMember = async (groupId: string, memberId: string, updates: Partial<Omit<SplitlyMember, "id">>) => {
    if (!user?.uid) {
      toast({
        title: "Error",
        description: "You must be logged in to update a member",
        variant: "destructive",
      })
      return
    }

    const result = await updateSplitlyMember(user.uid, groupId, memberId, updates)

    if (result.success) {
      setGroups((prevGroups) =>
        prevGroups.map((group) => {
          if (group.id === groupId) {
            return {
              ...group,
              members: group.members.map((member) => {
                if (member.id === memberId) {
                  return {
                    ...member,
                    ...updates,
                  }
                }
                return member
              }),
              updatedAt: new Date().toISOString(),
            }
          }
          return group
        }),
      )

      toast({
        title: "Success",
        description: "Member updated successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to update member",
        variant: "destructive",
      })
    }
  }

  const removeMember = async (groupId: string, memberId: string) => {
    if (!user?.uid) {
      toast({
        title: "Error",
        description: "You must be logged in to remove a member",
        variant: "destructive",
      })
      return false
    }

    try {
      const result = await removeSplitlyMember(user.uid, groupId, memberId)

      if (result.success) {
        // Update the local state by removing the member
        setGroups((prevGroups) =>
          prevGroups.map((group) => {
            if (group.id === groupId) {
              return {
                ...group,
                members: group.members.filter((member) => member.id !== memberId),
                updatedAt: new Date().toISOString(),
              }
            }
            return group
          }),
        )

        toast({
          title: "Success",
          description: "Member removed successfully",
        })

        return true
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to remove member",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error("Error removing member:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      return false
    }
  }

  // Update the addExpense function to use the exchange rate utility and Firestore
  const addExpense = async (groupId: string, expense: Omit<SplitlyExpense, "id" | "createdAt" | "originalAmount">) => {
    if (!user?.uid) {
      toast({
        title: "Error",
        description: "You must be logged in to add an expense",
        variant: "destructive",
      })
      return
    }

    const group = getGroup(groupId)
    if (!group) return

    // Convert expense amount to group base currency if needed
    let convertedAmount = expense.amount
    let originalAmount = undefined

    if (expense.currency !== group.baseCurrency) {
      try {
        const rate = await getExchangeRate(expense.currency, group.baseCurrency)
        originalAmount = expense.amount
        convertedAmount = expense.amount * rate
      } catch (error) {
        console.error("Error converting currency:", error)
        toast({
          title: "⚠️ Warning",
          description: "Could not convert currency. Using original amount.",
          variant: "destructive",
        })
      }
    }

    // Adjust participant amounts based on the conversion
    const conversionRatio = originalAmount ? convertedAmount / originalAmount : 1
    const adjustedParticipants = expense.participants.map((participant) => ({
      ...participant,
      amount: participant.amount * conversionRatio,
    }))

    const newExpense: Omit<SplitlyExpense, "id" | "createdAt"> = {
      ...expense,
      amount: convertedAmount,
      originalAmount,
      participants: adjustedParticipants,
      date: expense.date,
    }

    // Clean the expense data to remove any undefined values
    const cleanedExpense = removeUndefinedValues(newExpense)

    const result = await addSplitlyExpense(user.uid, groupId, cleanedExpense)

    if (result.success) {
      const createdExpense: SplitlyExpense = {
        ...cleanedExpense,
        id: result.id,
        createdAt: new Date().toISOString(),
      }

      setGroups((prevGroups) =>
        prevGroups.map((group) => {
          if (group.id === groupId) {
            return {
              ...group,
              expenses: [...group.expenses, createdExpense],
              updatedAt: new Date().toISOString(),
            }
          }
          return group
        }),
      )

      toast({
        title: "✅ Success",
        description: "Expense recorded successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      })
    }
  }

  // Update the updateExpense function to handle currency conversion and use Firestore
  const updateExpense = async (
    groupId: string,
    expenseId: string,
    updates: Partial<Omit<SplitlyExpense, "id" | "createdAt">>,
  ) => {
    if (!user?.uid) {
      toast({
        title: "Error",
        description: "You must be logged in to update an expense",
        variant: "destructive",
      })
      return
    }

    const group = getGroup(groupId)
    if (!group) return

    const expense = group.expenses.find((e) => e.id === expenseId)
    if (!expense) return

    // Handle currency conversion if currency or amount changed
    let convertedAmount = updates.amount !== undefined ? updates.amount : expense.amount
    let originalAmount = expense.originalAmount

    if (
      (updates.currency && updates.currency !== group.baseCurrency) ||
      (updates.amount !== undefined && (updates.currency || expense.currency) !== group.baseCurrency)
    ) {
      const currencyToConvert = updates.currency || expense.currency

      try {
        const rate = await getExchangeRate(currencyToConvert, group.baseCurrency)
        originalAmount = convertedAmount
        convertedAmount = convertedAmount * rate
      } catch (error) {
        console.error("Error converting currency:", error)
        toast({
          title: "⚠️ Warning",
          description: "Could not convert currency. Using original amount.",
          variant: "destructive",
        })
      }
    }

    // Adjust participant amounts if needed
    let adjustedParticipants = updates.participants || expense.participants
    if (updates.amount !== undefined || updates.currency) {
      const oldTotal = expense.amount
      const newTotal = convertedAmount
      const ratio = newTotal / oldTotal

      if (expense.splitType === "equal") {
        // For equal splits, recalculate based on the new total
        const participantCount = adjustedParticipants.length
        const equalShare = newTotal / participantCount
        adjustedParticipants = adjustedParticipants.map((p) => ({
          ...p,
          amount: equalShare,
        }))
      } else {
        // For custom splits, scale the amounts proportionally
        adjustedParticipants = adjustedParticipants.map((p) => ({
          ...p,
          amount: p.amount * ratio,
        }))
      }
    }

    const updatedExpense = {
      ...updates,
      amount: convertedAmount,
      originalAmount,
      participants: adjustedParticipants,
    }

    // Clean the expense data to remove any undefined values
    const cleanedExpense = removeUndefinedValues(updatedExpense)

    const result = await updateSplitlyExpense(user.uid, groupId, expenseId, cleanedExpense)

    if (result.success) {
      setGroups((prevGroups) =>
        prevGroups.map((group) => {
          if (group.id === groupId) {
            return {
              ...group,
              expenses: group.expenses.map((expense) => {
                if (expense.id === expenseId) {
                  return {
                    ...expense,
                    ...cleanedExpense,
                  }
                }
                return expense
              }),
              updatedAt: new Date().toISOString(),
            }
          }
          return group
        }),
      )

      toast({
        title: "✏️ Success",
        description: "Expense edited successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to update expense",
        variant: "destructive",
      })
    }
  }

  const deleteExpense = async (groupId: string, expenseId: string) => {
    if (!user?.uid) {
      toast({
        title: "Error",
        description: "You must be logged in to delete an expense",
        variant: "destructive",
      })
      return
    }

    const result = await deleteSplitlyExpense(user.uid, groupId, expenseId)

    if (result.success) {
      setGroups((prevGroups) =>
        prevGroups.map((group) => {
          if (group.id === groupId) {
            return {
              ...group,
              expenses: group.expenses.filter((expense) => expense.id !== expenseId),
              updatedAt: new Date().toISOString(),
            }
          }
          return group
        }),
      )

      toast({
        title: "🗑 Success",
        description: "Expense deleted successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      })
    }
  }

  // Update the addSettlement function to handle currency conversion and use Firestore
  const addSettlement = async (groupId: string, settlement: Omit<SplitlySettlement, "id" | "createdAt">) => {
    if (!user?.uid) {
      toast({
        title: "Error",
        description: "You must be logged in to add a settlement",
        variant: "destructive",
      })
      return
    }

    const group = getGroup(groupId)
    if (!group) return

    // Convert settlement amount to group base currency if needed
    let convertedAmount = settlement.amount

    if (settlement.currency !== group.baseCurrency) {
      try {
        const rate = await getExchangeRate(settlement.currency, group.baseCurrency)
        convertedAmount = settlement.amount * rate
      } catch (error) {
        console.error("Error converting currency:", error)
        toast({
          title: "⚠️ Warning",
          description: "Could not convert currency. Using original amount.",
          variant: "destructive",
        })
      }
    }

    const newSettlement: Omit<SplitlySettlement, "id" | "createdAt"> = {
      ...settlement,
      amount: convertedAmount,
    }

    // Clean the settlement data to remove any undefined values
    const cleanedSettlement = removeUndefinedValues(newSettlement)

    const result = await addSplitlySettlement(user.uid, groupId, cleanedSettlement)

    if (result.success) {
      const createdSettlement: SplitlySettlement = {
        ...cleanedSettlement,
        id: result.id,
        createdAt: new Date().toISOString(),
      }

      setGroups((prevGroups) =>
        prevGroups.map((group) => {
          if (group.id === groupId) {
            return {
              ...group,
              settlements: [...group.settlements, createdSettlement],
              updatedAt: new Date().toISOString(),
            }
          }
          return group
        }),
      )

      toast({
        title: "✅ Success",
        description: "Settlement successful – balance updated",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to add settlement",
        variant: "destructive",
      })
    }
  }

  const updateSettlement = async (
    groupId: string,
    settlementId: string,
    updates: Partial<Omit<SplitlySettlement, "id" | "createdAt">>,
  ) => {
    if (!user?.uid) {
      toast({
        title: "Error",
        description: "You must be logged in to update a settlement",
        variant: "destructive",
      })
      return
    }

    const group = getGroup(groupId)
    if (!group) return

    const settlement = group.settlements.find((s) => s.id === settlementId)
    if (!settlement) return

    // Handle currency conversion if currency or amount changed
    let convertedAmount = updates.amount !== undefined ? updates.amount : settlement.amount

    if (
      (updates.currency && updates.currency !== group.baseCurrency) ||
      (updates.amount !== undefined && (updates.currency || settlement.currency) !== group.baseCurrency)
    ) {
      const currencyToConvert = updates.currency || settlement.currency

      try {
        const rate = await getExchangeRate(currencyToConvert, group.baseCurrency)
        convertedAmount = convertedAmount * rate
      } catch (error) {
        console.error("Error converting currency:", error)
        toast({
          title: "Warning",
          description: "Could not convert currency. Using original amount.",
          variant: "destructive",
        })
      }
    }

    const updatedSettlement = {
      ...updates,
      amount: convertedAmount,
    }

    // Clean the settlement data to remove any undefined values
    const cleanedSettlement = removeUndefinedValues(updatedSettlement)

    const result = await updateSplitlySettlement(user.uid, groupId, settlementId, cleanedSettlement)

    if (result.success) {
      setGroups((prevGroups) =>
        prevGroups.map((group) => {
          if (group.id === groupId) {
            return {
              ...group,
              settlements: group.settlements.map((settlement) => {
                if (settlement.id === settlementId) {
                  return {
                    ...settlement,
                    ...cleanedSettlement,
                  }
                }
                return settlement
              }),
              updatedAt: new Date().toISOString(),
            }
          }
          return group
        }),
      )

      toast({
        title: "✏ Success",
        description: "Settlement edited successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to update settlement",
        variant: "destructive",
      })
    }
  }

  const deleteSettlement = async (groupId: string, settlementId: string) => {
    if (!user?.uid) {
      toast({
        title: "Error",
        description: "You must be logged in to delete a settlement",
        variant: "destructive",
      })
      return
    }

    const result = await deleteSplitlySettlement(user.uid, groupId, settlementId)

    if (result.success) {
      setGroups((prevGroups) =>
        prevGroups.map((group) => {
          if (group.id === groupId) {
            return {
              ...group,
              settlements: group.settlements.filter((settlement) => settlement.id !== settlementId),
              updatedAt: new Date().toISOString(),
            }
          }
          return group
        }),
      )

      toast({
        title: "🗑 Success",
        description: "Settlement deleted successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to delete settlement",
        variant: "destructive",
      })
    }
  }

  const calculateBalances = (groupId: string): Balance[] => {
    const group = getGroup(groupId)
    if (!group) return []

    // Create a map to track how much each person owes/is owed
    const balanceMap: Record<string, Record<string, number>> = {}

    // Initialize balance map with 0 for all member pairs
    group.members.forEach((member1) => {
      balanceMap[member1.id] = {}
      group.members.forEach((member2) => {
        if (member1.id !== member2.id) {
          balanceMap[member1.id][member2.id] = 0
        }
      })
    })

    // Process all expenses
    group.expenses.forEach((expense) => {
      const paidBy = expense.paidBy

      // For each participant who owes money
      expense.participants.forEach((participant) => {
        const participantId = participant.memberId

        if (paidBy !== participantId) {
          // Participant owes money to the payer
          balanceMap[participantId][paidBy] += participant.amount

          // Reciprocal relationship (negative value)
          balanceMap[paidBy][participantId] -= participant.amount
        }
      })
    })

    // Process all settlements
    group.settlements.forEach((settlement) => {
      const paidBy = settlement.paidBy
      const paidTo = settlement.paidTo

      // Person who paid the settlement reduces what they owe
      balanceMap[paidBy][paidTo] -= settlement.amount

      // Person who received the settlement reduces what they are owed
      balanceMap[paidTo][paidBy] += settlement.amount
    })

    // Convert the balance map to a list of who owes whom
    const balances: Balance[] = []

    // For each pair of members
    for (let i = 0; i < group.members.length; i++) {
      for (let j = i + 1; j < group.members.length; j++) {
        const member1 = group.members[i]
        const member2 = group.members[j]

        // Get the net balance between these two members
        const member1OwesToMember2 = balanceMap[member1.id][member2.id]

        if (member1OwesToMember2 > 0.01) {
          // member1 owes member2
          balances.push({
            from: member1.id,
            to: member2.id,
            amount: member1OwesToMember2,
          })
        } else if (member1OwesToMember2 < -0.01) {
          // member2 owes member1
          balances.push({
            from: member2.id,
            to: member1.id,
            amount: Math.abs(member1OwesToMember2),
          })
        }
        // If the balance is close to zero (between -0.01 and 0.01), we don't add it to the balances
      }
    }

    return balances
  }

  return {
    groups,
    loading,
    createGroup,
    getGroup,
    updateGroup,
    deleteGroup,
    addMember,
    updateMember,
    removeMember,
    addExpense,
    updateExpense,
    deleteExpense,
    addSettlement,
    updateSettlement,
    deleteSettlement,
    calculateBalances,
  }
}
