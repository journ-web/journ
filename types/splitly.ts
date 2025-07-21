export interface SplitlyMember {
  id: string
  name: string
  email?: string // Make email optional
}

export interface SplitlyExpense {
  id: string
  title: string
  amount: number
  originalAmount?: number // Original amount before conversion
  currency: string // Currency code (e.g., USD, EUR)
  paidBy: string // member id
  date: string
  participants: {
    memberId: string
    amount: number
  }[]
  splitType: "equal" | "custom"
  notes?: string
  createdAt: string
}

export interface SplitlySettlement {
  id: string
  paidBy: string // member id
  paidTo: string // member id
  amount: number
  currency: string // Currency code
  date: string
  notes?: string
  createdAt: string
}

export interface SplitlyGroup {
  id: string
  name: string
  baseCurrency: string // Base currency for the group
  members: SplitlyMember[]
  expenses: SplitlyExpense[]
  settlements: SplitlySettlement[]
  createdAt: string
  updatedAt: string
}

export interface Balance {
  from: string // member id
  to: string // member id
  amount: number
}
