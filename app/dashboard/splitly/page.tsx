"use client"

import { useState } from "react"
import { Plus, Users, Compass, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSplitlyGroups } from "@/hooks/use-splitly-groups"
import { CreateGroupModal } from "@/components/dashboard/splitly/create-group-modal"
import { GroupCard } from "@/components/dashboard/splitly/group-card"

export default function SplitlyPage() {
  const { groups, loading } = useSplitlyGroups()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)] bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading your travel groups...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Simple Header */}
        <div className="bg-card text-card-foreground rounded-lg p-6 mb-8 border border-border">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Compass className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">Splitly</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Split travel expenses effortlessly with your adventure companions.
              </p>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>{groups.length} Travel Groups</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <span>Worldwide Adventures</span>
                </div>
              </div>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)} className="mt-6 lg:mt-0 px-6 py-3">
              <Plus className="mr-2 h-5 w-5" />
              Create Travel Group
            </Button>
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-lg bg-muted flex items-center justify-center border border-border">
                <Compass className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">Ready for Your First Adventure?</h3>
              <p className="text-muted-foreground mb-8">
                Create your first travel group to start splitting expenses with your fellow explorers.
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)} className="px-8 py-3">
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Group
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Your Travel Groups</h2>
              <p className="text-muted-foreground">Manage expenses for all your adventures</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {groups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          </div>
        )}

        <CreateGroupModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
      </div>
    </div>
  )
}
