import { format, parseISO, isAfter, isBefore, isToday } from "date-fns"
import type { Trip, FundStatus, TripStatus, Notification } from "@/types/trip"
import { v4 as uuidv4 } from "uuid"

export function calculateTotalSpent(trip: Trip, fundType?: "budget" | "miscellaneous" | "safety"): number {
  if (!trip.expenses || trip.expenses.length === 0) return 0

  return trip.expenses.reduce((total, expense) => {
    // Always use the converted amount in home currency for budget calculations
    if (!fundType || expense.fundType === fundType) {
      return total + expense.amountInHomeCurrency
    }
    return total
  }, 0)
}

export function calculateFundsStatus(trip: Trip): FundStatus {
  // Calculate total spent for each fund type using the home currency amounts
  const budgetSpent = calculateTotalSpent(trip, "budget")
  const miscellaneousSpent = calculateTotalSpent(trip, "miscellaneous")
  const safetySpent = calculateTotalSpent(trip, "safety")

  // Calculate remaining funds
  const budgetRemaining = Math.max(0, trip.budget - budgetSpent)
  const miscellaneousRemaining = Math.max(0, trip.miscellaneousFunds - miscellaneousSpent)
  const safetyRemaining = Math.max(0, trip.safetyFunds - safetySpent)

  // Determine status
  let status: "budget" | "miscellaneous" | "safety" | "depleted" = "budget"

  if (budgetRemaining === 0) {
    if (miscellaneousRemaining === 0) {
      if (safetyRemaining === 0) {
        status = "depleted"
      } else {
        status = "safety"
      }
    } else {
      status = "miscellaneous"
    }
  }

  return {
    budgetRemaining,
    miscellaneousRemaining,
    safetyRemaining,
    status,
  }
}

export function getTripStatus(trip: Trip): TripStatus {
  const today = new Date()
  const startDate = parseISO(trip.startDate)
  const endDate = parseISO(trip.endDate)

  if (trip.status === "cancelled") return "cancelled"
  if (trip.status === "completed") return "completed"

  if (isAfter(today, endDate)) {
    return "completed"
  } else if (isAfter(today, startDate) || isToday(startDate)) {
    return "ongoing"
  } else {
    return "planned"
  }
}

export function updateTripStatuses(trips: Trip[]): Trip[] {
  return trips.map((trip) => {
    const currentStatus = getTripStatus(trip)
    if (currentStatus !== trip.status) {
      return { ...trip, status: currentStatus }
    }
    return trip
  })
}

export function getTripDates(trip: Trip): string[] {
  const dates: string[] = []
  const start = parseISO(trip.startDate)
  const end = parseISO(trip.endDate)

  const current = new Date(start)
  while (isBefore(current, end) || isToday(current)) {
    dates.push(format(current, "yyyy-MM-dd"))
    current.setDate(current.getDate() + 1)
  }

  return dates
}

export function calculateTripProgress(trip: Trip): number {
  const today = new Date()
  const startDate = parseISO(trip.startDate)
  const endDate = parseISO(trip.endDate)

  if (isBefore(today, startDate)) return 0
  if (isAfter(today, endDate)) return 100

  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const daysElapsed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  return Math.round((daysElapsed / totalDays) * 100)
}

export function generateBudgetNotifications(trip: Trip): Notification[] {
  const notifications: Notification[] = []
  const { budgetRemaining, miscellaneousRemaining, safetyRemaining, status } = calculateFundsStatus(trip)

  const budgetPercentage = ((trip.budget - budgetRemaining) / trip.budget) * 100
  const miscellaneousPercentage =
    trip.miscellaneousFunds > 0
      ? ((trip.miscellaneousFunds - miscellaneousRemaining) / trip.miscellaneousFunds) * 100
      : 0
  const safetyPercentage = trip.safetyFunds > 0 ? ((trip.safetyFunds - safetyRemaining) / trip.safetyFunds) * 100 : 0

  // Budget alerts
  if (budgetPercentage >= 90) {
    notifications.push({
      id: uuidv4(),
      title: "Budget Alert",
      message: `You've used 90% of your budget for '${trip.name}'`,
      type: "critical",
      category: "budget",
      timestamp: new Date().toISOString(),
      read: false,
      actionable: true,
      actionText: "Review Budget",
      actionLink: `/dashboard/trips?id=${trip.id}`,
      tripId: trip.id,
    })
  } else if (budgetPercentage >= 75) {
    notifications.push({
      id: uuidv4(),
      title: "Budget Alert",
      message: `You've used 75% of your budget for '${trip.name}'`,
      type: "warning",
      category: "budget",
      timestamp: new Date().toISOString(),
      read: false,
      actionable: true,
      actionText: "Review Budget",
      actionLink: `/dashboard/trips?id=${trip.id}`,
      tripId: trip.id,
    })
  } else if (budgetPercentage >= 50) {
    notifications.push({
      id: uuidv4(),
      title: "Budget Alert",
      message: `You've used 50% of your budget for '${trip.name}'`,
      type: "info",
      category: "budget",
      timestamp: new Date().toISOString(),
      read: false,
      actionable: true,
      actionText: "Review Budget",
      actionLink: `/dashboard/trips?id=${trip.id}`,
      tripId: trip.id,
    })
  }

  // Fund depletion alerts
  if (status === "miscellaneous") {
    notifications.push({
      id: uuidv4(),
      title: "Budget Depleted",
      message: `Your budget for '${trip.name}' has been depleted. Expenses are now being deducted from your miscellaneous funds.`,
      type: "critical",
      category: "budget",
      timestamp: new Date().toISOString(),
      read: false,
      actionable: true,
      actionText: "Add Funds",
      actionLink: `/dashboard/trips?id=${trip.id}`,
      tripId: trip.id,
    })
  } else if (status === "safety") {
    notifications.push({
      id: uuidv4(),
      title: "Miscellaneous Funds Depleted",
      message: `Your budget and miscellaneous funds for '${trip.name}' have been depleted. Expenses are now being deducted from your safety funds.`,
      type: "critical",
      category: "budget",
      timestamp: new Date().toISOString(),
      read: false,
      actionable: true,
      actionText: "Add Funds",
      actionLink: `/dashboard/trips?id=${trip.id}`,
      tripId: trip.id,
    })
  } else if (status === "depleted") {
    notifications.push({
      id: uuidv4(),
      title: "All Funds Depleted",
      message: `All funds for '${trip.name}' have been depleted. Please add more funds to continue tracking expenses.`,
      type: "critical",
      category: "budget",
      timestamp: new Date().toISOString(),
      read: false,
      actionable: true,
      actionText: "Add Funds",
      actionLink: `/dashboard/trips?id=${trip.id}`,
      tripId: trip.id,
    })
  }

  return notifications
}
