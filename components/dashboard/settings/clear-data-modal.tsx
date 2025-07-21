"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { doc, collection, getDocs, writeBatch } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ClearDataModalProps {
  trigger: React.ReactNode
}

export function ClearDataModal({ trigger }: ClearDataModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleClearData = async () => {
    if (!user) return

    setIsDeleting(true)

    try {
      // Delete all user data from Firestore
      const batch = writeBatch(db)

      // Delete trips and their subcollections
      const tripsRef = collection(db, "users", user.uid, "trips")
      const tripsSnapshot = await getDocs(tripsRef)

      for (const tripDoc of tripsSnapshot.docs) {
        // Delete expenses subcollection
        const expensesRef = collection(db, "users", user.uid, "trips", tripDoc.id, "expenses")
        const expensesSnapshot = await getDocs(expensesRef)
        expensesSnapshot.docs.forEach((doc) => batch.delete(doc.ref))

        // Delete tasks subcollection
        const tasksRef = collection(db, "users", user.uid, "trips", tripDoc.id, "tasks")
        const tasksSnapshot = await getDocs(tasksRef)
        tasksSnapshot.docs.forEach((doc) => batch.delete(doc.ref))

        // Delete the trip document
        batch.delete(tripDoc.ref)
      }

      // Delete todos
      const todosRef = collection(db, "users", user.uid, "todos")
      const todosSnapshot = await getDocs(todosRef)
      todosSnapshot.docs.forEach((doc) => batch.delete(doc.ref))

      // Delete notifications
      const notificationsRef = collection(db, "users", user.uid, "notifications")
      const notificationsSnapshot = await getDocs(notificationsRef)
      notificationsSnapshot.docs.forEach((doc) => batch.delete(doc.ref))

      // Delete splitly groups
      const splitlyGroupsRef = collection(db, "users", user.uid, "splitlyGroups")
      const splitlyGroupsSnapshot = await getDocs(splitlyGroupsRef)
      splitlyGroupsSnapshot.docs.forEach((doc) => batch.delete(doc.ref))

      // Delete user document
      const userRef = doc(db, "users", user.uid)
      batch.delete(userRef)

      // Commit the batch
      await batch.commit()

      toast({
        title: "Data cleared",
        description: "Your data has been successfully cleared.",
        variant: "default",
      })

      // Refresh the current page
      router.refresh()
    } catch (err) {
      console.error("Error clearing data:", err)
      toast({
        title: "Error",
        description: "Unable to clear data. Try again.",
        variant: "destructive",
      })
      setIsDeleting(false)
      setIsOpen(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently remove all your data from our servers, but your account
            will remain active.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleClearData}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Clearing...
              </>
            ) : (
              "Clear All Data"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
