import { Home, Utensils, Plane, Ticket, ShoppingBag, Sparkles, Heart, Briefcase } from "lucide-react"

// Expense categories with icons
export const expenseCategories = [
  { value: "accommodation", label: "Accommodation", icon: <Home className="h-4 w-4" /> },
  { value: "food", label: "Food & Drinks", icon: <Utensils className="h-4 w-4" /> },
  { value: "transportation", label: "Transportation", icon: <Plane className="h-4 w-4" /> },
  { value: "activities", label: "Activities & Tours", icon: <Ticket className="h-4 w-4" /> },
  { value: "shopping", label: "Shopping", icon: <ShoppingBag className="h-4 w-4" /> },
  { value: "entertainment", label: "Entertainment", icon: <Sparkles className="h-4 w-4" /> },
  { value: "health", label: "Health & Medical", icon: <Heart className="h-4 w-4" /> },
  { value: "other", label: "Other", icon: <Briefcase className="h-4 w-4" /> },
]
