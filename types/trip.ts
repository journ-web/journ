export type TripStatus = "planned" | "ongoing" | "completed" | "cancelled"
export type TripType = "solo" | "couple" | "family" | "business" | "friends"
export type FundType = "budget" | "miscellaneous" | "safety"
export type ExpenseCategory =
  | "accommodation"
  | "food"
  | "transportation"
  | "activities"
  | "shopping"
  | "entertainment"
  | "health"
  | "other"

export interface Task {
  id: string
  name: string
  notes?: string
  location?: string
  time: string
  budgetCost?: number
  completed: boolean
}

export interface Expense {
  id: string
  name: string
  category: ExpenseCategory
  date: string
  amount: number
  amountInHomeCurrency: number
  fundType: FundType
  notes?: string
  tripId: string
  createdAt: string
}

export interface Trip {
  id: string
  name: string
  destination: string
  startDate: string
  endDate: string
  tripType: TripType
  people: number
  budget: number
  miscellaneousFunds: number
  safetyFunds: number
  status: TripStatus
  homeCurrency: string
  tripCurrency: string
  exchangeRate: number
  tasks: Record<string, Task[]> // key is date string, value is array of tasks
  expenses: Expense[]
}

export interface FundStatus {
  budgetRemaining: number
  miscellaneousRemaining: number
  safetyRemaining: number
  status: "budget" | "miscellaneous" | "safety" | "depleted"
}
