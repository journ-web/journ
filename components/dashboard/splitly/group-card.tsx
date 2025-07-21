import Link from "next/link"
import { Users, Calendar, CreditCard, Plane, TrendingUp } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { SplitlyGroup } from "@/types/splitly"

interface GroupCardProps {
  group: SplitlyGroup
}

export function GroupCard({ group }: GroupCardProps) {
  const createdDate = new Date(group.createdAt).toLocaleDateString()
  const totalExpenses = group.expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: group.baseCurrency,
    }).format(amount)
  }

  return (
    <Link href={`/dashboard/splitly/${group.id}`} className="group block">
      <Card className="h-full transition-all duration-200 hover:shadow-lg border border-border bg-card text-card-foreground">
        {/* Simple Header */}
        <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-4">
          {" "}
          {/* Adjusted padding for smaller screens */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {" "}
              {/* Adjusted spacing */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                {" "}
                {/* Adjusted size */}
                <Plane className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> {/* Adjusted icon size */}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {" "}
                  {/* Adjusted font size */}
                  {group.name}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {group.baseCurrency}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-3 sm:p-6 sm:space-y-4">
          {" "}
          {/* Adjusted padding and spacing */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {" "}
            {/* Adjusted gap */}
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-muted">
              <Users className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">{group.members.length}</p>
                <p className="text-xs text-muted-foreground">{group.members.length === 1 ? "traveler" : "travelers"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-muted">
              <CreditCard className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">{group.expenses.length}</p>
                <p className="text-xs text-muted-foreground">{group.expenses.length === 1 ? "expense" : "expenses"}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 p-2 rounded-lg bg-muted">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Started {createdDate}</span>
          </div>
          {totalExpenses > 0 && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Total Spent</span>
                </div>
                <span className="text-base sm:text-lg font-bold text-primary">{formatCurrency(totalExpenses)}</span>{" "}
                {/* Adjusted font size */}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 sm:p-6 sm:pt-0">
          {" "}
          {/* Adjusted padding */}
          <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
            <span>Adventure awaits</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Active</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
