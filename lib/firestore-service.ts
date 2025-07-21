import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  setDoc,
  onSnapshot, // Ensure onSnapshot is imported for real-time listeners
  Timestamp,
  writeBatch,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type {
  Trip,
  Task,
  Expense,
  Notification,
  TodoTask,
  SplitlyGroup,
  SplitlyExpense,
  SplitlySettlement,
  SplitlyMember,
} from "@/types"
import type { JournalEntry, CreateJournalEntryData, UpdateJournalEntryData } from "@/types/journal"
import type { BlogPost } from "@/types/blog"
import type { TodoItem } from "@/types/todo"
import { format } from "date-fns" // Import format for date fallback

// User operations
export const createUserDocument = async (userId: string, userData: { name: string; email: string }) => {
  try {
    const userRef = doc(db, "users", userId)
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
    })
    return { success: true }
  } catch (error) {
    console.error("Error creating user document:", error)
    return { success: false, error }
  }
}

export const getUserDocument = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      return { success: true, data: { id: userSnap.id, ...userSnap.data() } }
    } else {
      return { success: false, error: "User document not found" }
    }
  } catch (error) {
    console.error("Error getting user document:", error)
    return { success: false, error }
  }
}

// Trip operations
export const tripService = {
  async create(userId: string, trip: Omit<Trip, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const tripRef = collection(db, "users", userId, "trips")
    const now = Timestamp.now()
    const docRef = await addDoc(tripRef, {
      ...trip,
      createdAt: now,
      updatedAt: now,
    })
    return docRef.id
  },

  async update(userId: string, tripId: string, updates: Partial<Trip>): Promise<void> {
    const tripRef = doc(db, "users", userId, "trips", tripId)
    await updateDoc(tripRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
  },

  async delete(userId: string, tripId: string): Promise<void> {
    const tripRef = doc(db, "users", userId, "trips", tripId)
    await deleteDoc(tripRef)
  },

  async get(userId: string, tripId: string): Promise<Trip | null> {
    const tripRef = doc(db, "users", userId, "trips", tripId)
    const tripSnap = await getDoc(tripRef)

    if (tripSnap.exists()) {
      const data = tripSnap.data()
      return {
        id: tripSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        startDate: data.startDate?.toDate() || new Date(),
        endDate: data.endDate?.toDate() || new Date(),
      } as Trip
    }

    return null
  },

  async getAll(userId: string): Promise<Trip[]> {
    const tripsRef = collection(db, "users", userId, "trips")
    const q = query(tripsRef, orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        startDate: data.startDate?.toDate() || new Date(),
        endDate: data.endDate?.toDate() || new Date(),
      } as Trip
    })
  },
}

export const getTrip = async (userId: string, tripId: string) => {
  try {
    const tripRef = doc(db, "users", userId, "trips", tripId)
    const tripSnap = await getDoc(tripRef)

    if (tripSnap.exists()) {
      const data = tripSnap.data()
      return {
        success: true,
        data: {
          id: tripSnap.id,
          tripName: data.tripName,
          destination: data.destination,
          startDate: data.startDate?.toDate(),
          endDate: data.endDate?.toDate(),
          tripType: data.tripType,
          numberOfPeople: data.numberOfPeople,
          homeCurrency: data.homeCurrency,
          tripCurrency: data.tripCurrency,
          exchangeRate: data.exchangeRate,
          budget: data.budget,
          safetyFunds: data.safetyFunds,
          status: data.status,
          createdAt: data.createdAt?.toDate(),
        } as Trip,
      }
    } else {
      return { success: false, error: "Trip not found" }
    }
  } catch (error) {
    console.error("Error getting trip:", error)
    return { success: false, error }
  }
}

export const updateTrip = async (userId: string, tripId: string, tripData: Partial<Trip>) => {
  try {
    const tripRef = doc(db, "users", userId, "trips", tripId)
    await updateDoc(tripRef, tripData)
    return { success: true }
  } catch (error) {
    console.error("Error updating trip:", error)
    return { success: false, error }
  }
}

export const deleteTrip = async (userId: string, tripId: string) => {
  try {
    const tripRef = doc(db, "users", userId, "trips", tripId)
    await deleteDoc(tripRef)
    return { success: true }
  } catch (error) {
    console.error("Error deleting trip:", error)
    return { success: false, error }
  }
}

// Task operations
export const createTask = async (userId: string, tripId: string, taskData: Partial<Task>) => {
  try {
    const tasksRef = collection(db, "users", userId, "trips", tripId, "tasks")
    const docRef = await addDoc(tasksRef, {
      ...taskData,
      completed: false,
      createdAt: serverTimestamp(),
    })
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error creating task:", error)
    return { success: false, error }
  }
}

export const getTasks = async (userId: string, tripId: string) => {
  try {
    const tasksRef = collection(db, "users", userId, "trips", tripId, "tasks")
    const q = query(tasksRef, orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    const tasks: Task[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      tasks.push({
        id: doc.id,
        taskName: data.taskName,
        description: data.description,
        dueDate: data.dueDate?.toDate(),
        completed: data.completed,
        createdAt: data.createdAt?.toDate(),
      } as Task)
    })

    return { success: true, data: tasks }
  } catch (error) {
    console.error("Error getting tasks:", error)
    return { success: false, error }
  }
}

export const updateTask = async (userId: string, tripId: string, taskId: string, taskData: Partial<Task>) => {
  try {
    const taskRef = doc(db, "users", userId, "trips", tripId, "tasks", taskId)
    await updateDoc(taskRef, taskData)
    return { success: true }
  } catch (error) {
    console.error("Error updating task:", error)
    return { success: false, error }
  }
}

export const deleteTask = async (userId: string, tripId: string, taskId: string) => {
  try {
    const taskRef = doc(db, "users", userId, "trips", tripId, "tasks", taskId)
    await deleteDoc(taskRef)
    return { success: true }
  } catch (error) {
    console.error("Error deleting task:", error)
    return { success: false, error }
  }
}

// Expense operations
export const expenseService = {
  async create(userId: string, tripId: string, expense: Omit<Expense, "id" | "createdAt">): Promise<string> {
    const expenseRef = collection(db, "users", userId, "trips", tripId, "expenses")
    const docRef = await addDoc(expenseRef, {
      ...expense,
      createdAt: Timestamp.now(),
    })
    return docRef.id
  },

  async update(userId: string, tripId: string, expenseId: string, updates: Partial<Expense>): Promise<void> {
    const expenseRef = doc(db, "users", userId, "trips", tripId, "expenses", expenseId)
    await updateDoc(expenseRef, updates)
  },

  async delete(userId: string, tripId: string, expenseId: string): Promise<void> {
    const expenseRef = doc(db, "users", userId, "trips", tripId, "expenses", expenseId)
    await deleteDoc(expenseRef)
  },
}

export const createExpense = async (userId: string, tripId: string, expenseData: Partial<Expense>) => {
  try {
    const expensesRef = collection(db, "users", userId, "trips", tripId, "expenses")
    const docRef = await addDoc(expensesRef, {
      ...expenseData,
      createdAt: serverTimestamp(),
    })
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error creating expense:", error)
    return { success: false, error }
  }
}

export const getExpenses = async (userId: string, tripId: string) => {
  try {
    const expensesRef = collection(db, "users", userId, "trips", tripId, "expenses")
    const q = query(expensesRef, orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    const expenses: Expense[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      expenses.push({
        id: doc.id,
        amount: data.amount,
        currency: data.currency,
        category: data.category,
        description: data.description,
        date: data.date?.toDate(),
        fundType: data.fundType,
        createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
      } as Expense)
    })

    return { success: true, data: expenses }
  } catch (error) {
    console.error("Error getting expenses:", error)
    return { success: false, error }
  }
}

export const updateExpense = async (
  userId: string,
  tripId: string,
  expenseId: string,
  expenseData: Partial<Expense>,
) => {
  try {
    const expenseRef = doc(db, "users", userId, "trips", tripId, "expenses", expenseId)
    await updateDoc(expenseRef, expenseData)
    return { success: true }
  } catch (error) {
    console.error("Error updating expense:", error)
    return { success: false, error }
  }
}

export const deleteExpense = async (userId: string, tripId: string, expenseId: string) => {
  try {
    const expenseRef = doc(db, "users", userId, "trips", tripId, "expenses", expenseId)
    await deleteDoc(expenseRef)
    return { success: true }
  } catch (error) {
    console.error("Error deleting expense:", error)
    return { success: false, error }
  }
}

// Journal operations - Restored Firestore integration
export const journalService = {
  async create(
    userId: string,
    entry: Omit<JournalEntry, "id" | "createdAt" | "updatedAt" | "userId">,
  ): Promise<string> {
    const journalRef = collection(db, "users", userId, "journal")
    const now = Timestamp.now()
    const docRef = await addDoc(journalRef, {
      ...entry,
      userId,
      createdAt: now,
      updatedAt: now,
    })
    return docRef.id
  },

  async update(
    userId: string,
    entryId: string,
    updates: Partial<Omit<JournalEntry, "id" | "createdAt" | "userId">>,
  ): Promise<void> {
    const entryRef = doc(db, "users", userId, "journal", entryId)
    await updateDoc(entryRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
  },

  async delete(userId: string, entryId: string): Promise<void> {
    const entryRef = doc(db, "users", userId, "journal", entryId)
    await deleteDoc(entryRef)
  },

  async get(userId: string, entryId: string): Promise<JournalEntry | null> {
    const entryRef = doc(db, "users", userId, "journal", entryId)
    const entrySnap = await getDoc(entryRef)

    if (entrySnap.exists()) {
      const data = entrySnap.data()
      return {
        id: entrySnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as JournalEntry
    }

    return null
  },

  async getAll(userId: string): Promise<JournalEntry[]> {
    const journalRef = collection(db, "users", userId, "journal")
    const q = query(journalRef, orderBy("date", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as JournalEntry
    })
  },

  async getByTrip(userId: string, tripId: string): Promise<JournalEntry[]> {
    const journalRef = collection(db, "users", userId, "journal")
    const q = query(journalRef, where("tripId", "==", tripId), orderBy("date", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as JournalEntry
    })
  },
}

export const createJournalEntry = async (userId: string, entryData: CreateJournalEntryData) => {
  try {
    console.log("=== FIRESTORE SERVICE: Creating journal entry ===")
    console.log("User ID:", userId)
    console.log("Entry data:", entryData)

    if (!userId) {
      console.error("No userId provided")
      return { success: false, error: "User ID is required" }
    }

    if (!db) {
      console.error("Firestore database not initialized")
      return { success: false, error: "Database not initialized" }
    }

    const journalRef = collection(db, "users", userId, "journal")
    console.log("Journal collection reference created")

    // Validate required fields
    if (!entryData.title || !entryData.content) {
      console.error("Missing required fields:", { title: entryData.title, content: entryData.content })
      return { success: false, error: "Title and content are required" }
    }

    // Format the data for Firestore - ensure all fields are properly formatted
    const firestoreData = {
      tripId: entryData.tripId || null,
      title: String(entryData.title).trim(),
      content: String(entryData.content).trim(),
      date: String(entryData.date), // This should be the selected date in YYYY-MM-DD format
      mood: entryData.mood || "neutral", // Ensure mood has a default
      weather: entryData.weather || null,
      location: entryData.location ? String(entryData.location).trim() : null,
      tags: Array.isArray(entryData.tags) ? entryData.tags.filter((tag) => tag && tag.trim()) : [],
      photos: Array.isArray(entryData.photos) ? entryData.photos.filter((photo) => photo && photo.trim()) : [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    console.log("Formatted Firestore data:", firestoreData)

    const docRef = await addDoc(journalRef, firestoreData)
    console.log("Document added successfully with ID:", docRef.id)

    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("=== FIRESTORE ERROR: Creating journal entry ===")
    console.error("Error details:", error)
    console.error("Error message:", error instanceof Error ? error.message : String(error))
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save journal entry",
    }
  }
}

export const getJournalEntries = async (userId: string, tripId?: string) => {
  try {
    console.log("=== FIRESTORE SERVICE: Fetching journal entries ===")
    console.log("User ID:", userId)
    console.log("Trip ID filter:", tripId)

    const journalRef = collection(db, "users", userId, "journal")
    let q

    // If tripId is provided, filter by tripId
    if (tripId) {
      q = query(journalRef, where("tripId", "==", tripId), orderBy("date", "desc"))
    } else {
      q = query(journalRef, orderBy("date", "desc"))
    }

    const snapshot = await getDocs(q)
    console.log("Firestore query executed, docs found:", snapshot.docs.length)

    const entries: JournalEntry[] = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      console.log("Processing document:", doc.id, data)

      // Convert Firestore timestamps to ISO strings
      const createdAt =
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : typeof data.createdAt === "string"
            ? data.createdAt
            : new Date().toISOString()

      const updatedAt =
        data.updatedAt instanceof Timestamp
          ? data.updatedAt.toDate().toISOString()
          : typeof data.updatedAt === "string"
            ? data.updatedAt
            : new Date().toISOString()

      const entry: JournalEntry = {
        id: doc.id,
        tripId: data.tripId || null,
        title: data.title || "",
        content: data.content || "",
        // Ensure date is a valid YYYY-MM-DD string, fallback to today if invalid
        date:
          typeof data.date === "string" && data.date.match(/^\d{4}-\d{2}-\d{2}$/)
            ? data.date
            : format(new Date(), "yyyy-MM-dd"),
        mood: (data.mood as JournalEntry["mood"]) || "neutral", // Ensure mood is a valid type or defaults
        weather: data.weather || null,
        location: data.location || null,
        tags: Array.isArray(data.tags) ? data.tags : [],
        photos: Array.isArray(data.photos) ? data.photos : [],
        createdAt,
        updatedAt,
      }

      console.log("Processed entry:", entry)
      entries.push(entry)
    })

    console.log("Total entries processed:", entries.length)
    return { success: true, data: entries }
  } catch (error) {
    console.error("=== FIRESTORE ERROR: Fetching journal entries ===")
    console.error("Error details:", error)
    return { success: false, error, data: [] }
  }
}

export const getJournalEntry = async (userId: string, entryId: string) => {
  try {
    const entryRef = doc(db, "users", userId, "journal", entryId)
    const snapshot = await getDoc(entryRef)

    if (!snapshot.exists()) {
      return { success: false, error: "Entry not found", data: null }
    }

    const data = snapshot.data()

    // Convert Firestore timestamps to ISO strings
    const createdAt =
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : typeof data.createdAt === "string"
          ? data.createdAt
          : new Date().toISOString()

    const updatedAt =
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : typeof data.updatedAt === "string"
          ? data.updatedAt
          : new Date().toISOString()

    const entry: JournalEntry = {
      id: snapshot.id,
      tripId: data.tripId || null,
      title: data.title || "",
      content: data.content || "",
      date:
        typeof data.date === "string" && data.date.match(/^\d{4}-\d{2}-\d{2}$/)
          ? data.date
          : format(new Date(), "yyyy-MM-dd"),
      mood: (data.mood as JournalEntry["mood"]) || "neutral",
      weather: data.weather || null,
      location: data.location || null,
      tags: Array.isArray(data.tags) ? data.tags : [],
      photos: Array.isArray(data.photos) ? data.photos : [],
      createdAt,
      updatedAt,
    }

    return { success: true, data: entry }
  } catch (error) {
    console.error("Error fetching journal entry:", error)
    return { success: false, error, data: null }
  }
}

export const updateJournalEntry = async (userId: string, entryId: string, entryData: UpdateJournalEntryData) => {
  try {
    console.log("=== FIRESTORE SERVICE: Updating journal entry ===")
    console.log("User ID:", userId)
    console.log("Entry ID:", entryId)
    console.log("Update data:", entryData)

    const entryRef = doc(db, "users", userId, "journal", entryId)

    // Add updatedAt timestamp
    const updateData = {
      ...entryData,
      updatedAt: serverTimestamp(),
    }

    await updateDoc(entryRef, updateData)

    console.log("Journal entry updated successfully")
    return { success: true }
  } catch (error) {
    console.error("=== FIRESTORE ERROR: Updating journal entry ===")
    console.error("Error details:", error)
    return { success: false, error }
  }
}

export const deleteJournalEntry = async (userId: string, entryId: string) => {
  try {
    console.log("=== FIRESTORE SERVICE: Deleting journal entry ===")
    console.log("User ID:", userId)
    console.log("Entry ID:", entryId)

    const entryRef = doc(db, "users", userId, "journal", entryId)
    await deleteDoc(entryRef)

    console.log("Journal entry deleted successfully")
    return { success: true }
  } catch (error) {
    console.error("=== FIRESTORE ERROR: Deleting journal entry ===")
    console.error("Error details:", error)
    return { success: false, error }
  }
}

export const subscribeToJournalEntries = (
  userId: string,
  callback: (entries: JournalEntry[]) => void,
  tripId?: string,
) => {
  console.log("=== FIRESTORE SERVICE: Setting up journal subscription ===")
  console.log("User ID:", userId)
  console.log("Trip ID filter:", tripId)

  const journalRef = collection(db, "users", userId, "journal")
  let q

  // If tripId is provided, filter by tripId
  if (tripId) {
    q = query(journalRef, where("tripId", "==", tripId), orderBy("date", "desc"))
  } else {
    q = query(journalRef, orderBy("date", "desc"))
  }

  return onSnapshot(
    q,
    (snapshot) => {
      console.log("=== FIRESTORE SERVICE: Snapshot received ===")
      console.log("Documents count:", snapshot.docs.length)

      const entries: JournalEntry[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        console.log("Processing snapshot document:", doc.id, {
          title: data.title,
          date: data.date,
          tripId: data.tripId,
        })

        // Convert Firestore timestamps to ISO strings
        const createdAt =
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate().toISOString()
            : typeof data.createdAt === "string"
              ? data.createdAt
              : new Date().toISOString()

        const updatedAt =
          data.updatedAt instanceof Timestamp
            ? data.updatedAt.toDate().toISOString()
            : typeof data.updatedAt === "string"
              ? data.updatedAt
              : new Date().toISOString()

        const entry: JournalEntry = {
          id: doc.id,
          tripId: data.tripId || null,
          title: data.title || "",
          content: data.content || "",
          date:
            typeof data.date === "string" && data.date.match(/^\d{4}-\d{2}-\d{2}$/)
              ? data.date
              : format(new Date(), "yyyy-MM-dd"), // Ensure date is valid YYYY-MM-DD
          mood: (data.mood as JournalEntry["mood"]) || "neutral", // Ensure mood is a valid type or defaults
          weather: data.weather || null,
          location: data.location || null,
          tags: Array.isArray(data.tags) ? data.tags : [],
          photos: Array.isArray(data.photos) ? data.photos : [],
          createdAt,
          updatedAt,
        }

        entries.push(entry)
      })

      console.log("Processed entries from snapshot:", entries.length)
      callback(entries)
    },
    (error) => {
      console.error("=== FIRESTORE ERROR: Subscription error ===")
      console.error("Error details:", error)
      callback([]) // Return empty array on error
    },
  )
}

// Notification operations
export const createNotification = async (userId: string, notificationData: Partial<Notification>) => {
  try {
    const notificationsRef = collection(db, "users", userId, "notifications")
    const docRef = await addDoc(notificationsRef, {
      ...notificationData,
      read: false,
      createdAt: serverTimestamp(),
    })
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error creating notification:", error)
    return { success: false, error }
  }
}

export const getNotifications = async (userId: string) => {
  try {
    const notificationsRef = collection(db, "users", userId, "notifications")
    const q = query(notificationsRef, orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    const notifications: Notification[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      notifications.push({
        id: doc.id,
        title: data.title,
        message: data.message,
        type: data.type,
        category: data.category,
        read: data.read,
        actionable: data.actionable,
        actionText: data.actionText,
        actionLink: data.actionLink,
        createdAt: data.createdAt?.toDate(),
      } as Notification)
    })

    return { success: true, data: notifications }
  } catch (error) {
    console.error("Error getting notifications:", error)
    return { success: false, error }
  }
}

export const updateNotification = async (
  userId: string,
  notificationId: string,
  notificationData: Partial<Notification>,
) => {
  try {
    const notificationRef = doc(db, "users", userId, "notifications", notificationId)
    await updateDoc(notificationRef, notificationData)
    return { success: true }
  } catch (error) {
    console.error("Error updating notification:", error)
    return { success: false, error }
  }
}

export const deleteNotification = async (userId: string, notificationId: string) => {
  try {
    const notificationRef = doc(db, "users", userId, "notifications", notificationId)
    await deleteDoc(notificationRef)
    return { success: true }
  } catch (error) {
    console.error("Error deleting notification:", error)
    return { success: false, error }
  }
}

export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const notificationsRef = collection(db, "users", userId, "notifications")
    const q = query(notificationsRef, where("read", "==", false))
    const querySnapshot = await getDocs(q)

    const batch = []
    querySnapshot.forEach((doc) => {
      const notificationRef = doc.ref
      batch.push(updateDoc(notificationRef, { read: true }))
    })

    await Promise.all(batch)
    return { success: true }
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return { success: false, error }
  }
}

// Todo operations
export const todoService = {
  async create(userId: string, todo: Omit<TodoItem, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const todoRef = collection(db, "users", userId, "todos")
    const now = Timestamp.now()
    const docRef = await addDoc(todoRef, {
      ...todo,
      createdAt: now,
      updatedAt: now,
    })
    return docRef.id
  },

  async update(userId: string, todoId: string, updates: Partial<TodoItem>): Promise<void> {
    const todoRef = doc(db, "users", userId, "todos", todoId)
    await updateDoc(todoRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
  },

  async delete(userId: string, todoId: string): Promise<void> {
    const todoRef = doc(db, "users", userId, "todos", todoId)
    await deleteDoc(todoRef)
  },
}

export const createTodo = async (userId: string, todoData: Partial<TodoTask>) => {
  if (!userId) {
    console.error("Error creating todo: userId is required")
    return { success: false, error: "userId is required" }
  }

  try {
    const todosRef = collection(db, "users", userId, "todos")

    // Ensure we have all required fields with proper formatting
    const formattedData = {
      title: todoData.title,
      description: todoData.description || "",
      dueDate: todoData.dueDate,
      category: todoData.category || "Personal",
      priority: todoData.priority || "None",
      status: todoData.status || "Pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    console.log(`Adding todo to users/${userId}/todos with data:`, formattedData)
    const docRef = await addDoc(todosRef, formattedData)
    console.log("Todo added with ID:", docRef.id)
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error creating todo:", error)
    return { success: false, error }
  }
}

export const getTodos = async (userId: string) => {
  if (!userId) {
    console.error("Error getting todos: userId is required")
    return { success: false, error: "userId is required", data: [] }
  }

  try {
    console.log(`Fetching todos from users/${userId}/todos`)
    const todosRef = collection(db, "users", userId, "todos")
    const q = query(todosRef, orderBy("dueDate", "asc"))
    const querySnapshot = await getDocs(q)

    const todos: TodoTask[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      todos.push({
        id: doc.id,
        title: data.title,
        description: data.description || "",
        dueDate: data.dueDate,
        category: data.category || "Personal",
        priority: data.priority || "None",
        status: data.status || "Pending",
        createdAt: data.createdAt?.toDate?.()
          ? data.createdAt.toDate().toISOString()
          : data.createdAt || new Date().toISOString(),
      } as TodoTask)
    })

    console.log(`Found ${todos.length} todos for user ${userId}`)
    return { success: true, data: todos }
  } catch (error) {
    console.error("Error getting todos:", error)
    return { success: false, error, data: [] }
  }
}

export const updateTodo = async (userId: string, todoId: string, todoData: Partial<TodoTask>) => {
  if (!userId || !todoId) {
    console.error("Error updating todo: userId and todoId are required")
    return { success: false, error: "userId and todoId are required" }
  }

  try {
    const todoRef = doc(db, "users", userId, "todos", todoId)

    // Remove any undefined values to prevent Firestore errors
    const cleanedData = Object.entries(todoData).reduce(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value
        }
        return acc
      },
      {} as Record<string, any>,
    )

    console.log(`Updating todo at users/${userId}/todos/${todoId} with data:`, cleanedData)
    await updateDoc(todoRef, {
      ...cleanedData,
      updatedAt: serverTimestamp(),
    })
    return { success: true }
  } catch (error) {
    console.error("Error updating todo:", error)
    return { success: false, error }
  }
}

export const deleteTodo = async (userId: string, todoId: string) => {
  try {
    const todoRef = doc(db, "users", userId, "todos", todoId)
    await deleteDoc(todoRef)
    return { success: true }
  } catch (error) {
    console.error("Error deleting todo:", error)
    return { success: false, error }
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

// Splitly Group operations
export const splitlyService = {
  async createGroup(userId: string, group: Omit<SplitlyGroup, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const groupRef = collection(db, "users", userId, "splitlyGroups")
    const now = Timestamp.now()
    const docRef = await addDoc(groupRef, {
      ...group,
      createdAt: now,
      updatedAt: now,
    })
    return docRef.id
  },

  async updateGroup(userId: string, groupId: string, updates: Partial<SplitlyGroup>): Promise<void> {
    const groupRef = doc(db, "users", userId, "splitlyGroups", groupId)
    await updateDoc(groupRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
  },

  async deleteGroup(userId: string, groupId: string): Promise<void> {
    const groupRef = doc(db, "users", userId, "splitlyGroups", groupId)
    await deleteDoc(groupRef)
  },

  async addExpense(
    userId: string,
    groupId: string,
    expense: Omit<SplitlyExpense, "id" | "createdAt">,
  ): Promise<string> {
    const expenseRef = collection(db, "users", userId, "splitlyGroups", groupId, "expenses")
    const docRef = await addDoc(expenseRef, {
      ...expense,
      createdAt: Timestamp.now(),
    })
    return docRef.id
  },

  async addSettlement(
    userId: string,
    groupId: string,
    settlement: Omit<SplitlySettlement, "id" | "createdAt">,
  ): Promise<string> {
    const settlementRef = collection(db, "users", userId, "splitlyGroups", groupId, "settlements")
    const docRef = await addDoc(settlementRef, {
      ...settlement,
      createdAt: Timestamp.now(),
    })
    return docRef.id
  },
}

export const createSplitlyGroup = async (
  userId: string,
  groupData: Omit<SplitlyGroup, "id" | "createdAt" | "updatedAt">,
) => {
  try {
    const groupsRef = collection(db, "users", userId, "splitlyGroups")

    // Clean the data to remove any undefined values
    const cleanedData = removeUndefinedValues(groupData)

    const docRef = await addDoc(groupsRef, {
      ...cleanedData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error creating Splitly group:", error)
    return { success: false, error }
  }
}

export const getSplitlyGroups = async (userId: string) => {
  try {
    const groupsRef = collection(db, "users", userId, "splitlyGroups")
    const q = query(groupsRef, orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    const groups: SplitlyGroup[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      groups.push({
        id: doc.id,
        name: data.name,
        baseCurrency: data.baseCurrency,
        members: data.members || [],
        expenses: data.expenses || [],
        settlements: data.settlements || [],
        createdAt: data.createdAt?.toDate?.()
          ? data.createdAt.toDate().toISOString()
          : data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()
          ? data.updatedAt.toDate().toISOString()
          : data.updatedAt || new Date().toISOString(),
      } as SplitlyGroup)
    })

    return { success: true, data: groups }
  } catch (error) {
    console.error("Error getting Splitly groups:", error)
    return { success: false, error, data: [] }
  }
}

export const getSplitlyGroup = async (userId: string, groupId: string) => {
  try {
    const groupRef = doc(db, "users", userId, "splitlyGroups", groupId)
    const groupSnap = await getDoc(groupRef)

    if (groupSnap.exists()) {
      const data = groupSnap.data()
      return {
        success: true,
        data: {
          id: groupSnap.id,
          name: data.name,
          baseCurrency: data.baseCurrency,
          members: data.members || [],
          expenses: data.expenses || [],
          settlements: data.settlements || [],
          createdAt: data.createdAt?.toDate?.()
            ? data.createdAt.toDate().toISOString()
            : data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()
            ? data.updatedAt.toDate().toISOString()
            : data.updatedAt || new Date().toISOString(),
        } as SplitlyGroup,
      }
    } else {
      return { success: false, error: "Splitly group not found" }
    }
  } catch (error) {
    console.error("Error getting Splitly group:", error)
    return { success: false, error }
  }
}

export const updateSplitlyGroup = async (
  userId: string,
  groupId: string,
  groupData: Partial<Omit<SplitlyGroup, "id" | "createdAt">>,
) => {
  try {
    const groupRef = doc(db, "users", userId, "splitlyGroups", groupId)

    // Clean the data to remove any undefined values
    const cleanedData = removeUndefinedValues(groupData)

    await updateDoc(groupRef, {
      ...cleanedData,
      updatedAt: serverTimestamp(),
    })
    return { success: true }
  } catch (error) {
    console.error("Error updating Splitly group:", error)
    return { success: false, error }
  }
}

export const deleteSplitlyGroup = async (userId: string, groupId: string) => {
  try {
    const groupRef = doc(db, "users", userId, "splitlyGroups", groupId)
    await deleteDoc(groupRef)
    return { success: true }
  } catch (error) {
    console.error("Error deleting Splitly group:", error)
    return { success: false, error }
  }
}

// Splitly Member operations
export const addSplitlyMember = async (userId: string, groupId: string, memberData: Omit<SplitlyMember, "id">) => {
  try {
    const groupRef = doc(db, "users", userId, "splitlyGroups", groupId)
    const groupSnap = await getDoc(groupRef)

    if (!groupSnap.exists()) {
      return { success: false, error: "Group not found" }
    }

    const groupData = groupSnap.data()
    const members = groupData.members || []

    // Clean the data to remove any undefined values
    const cleanedMemberData = removeUndefinedValues(memberData)

    const newMember: SplitlyMember = {
      id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...cleanedMemberData,
    }

    await updateDoc(groupRef, {
      members: [...members, newMember],
      updatedAt: serverTimestamp(),
    })

    return { success: true, id: newMember.id }
  } catch (error) {
    console.error("Error adding Splitly member:", error)
    return { success: false, error }
  }
}

export const updateSplitlyMember = async (
  userId: string,
  groupId: string,
  memberId: string,
  memberData: Partial<Omit<SplitlyMember, "id">>,
) => {
  try {
    const groupRef = doc(db, "users", userId, "splitlyGroups", groupId)
    const groupSnap = await getDoc(groupRef)

    if (!groupSnap.exists()) {
      return { success: false, error: "Group not found" }
    }

    const groupData = groupSnap.data()
    const members = groupData.members || []

    // Clean the data to remove any undefined values
    const cleanedMemberData = removeUndefinedValues(memberData)

    const updatedMembers = members.map((member: SplitlyMember) => {
      if (member.id === memberId) {
        return { ...member, ...cleanedMemberData }
      }
      return member
    })

    await updateDoc(groupRef, {
      members: updatedMembers,
      updatedAt: serverTimestamp(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating Splitly member:", error)
    return { success: false, error }
  }
}

export const removeSplitlyMember = async (userId: string, groupId: string, memberId: string) => {
  try {
    const groupRef = doc(db, "users", userId, "splitlyGroups", groupId)
    const groupSnap = await getDoc(groupRef)

    if (!groupSnap.exists()) {
      return { success: false, error: "Group not found" }
    }

    const groupData = groupSnap.data()
    const members = groupData.members || []
    const expenses = groupData.expenses || []
    const settlements = groupData.settlements || []

    // Check if member has expenses or settlements
    const hasExpenses = expenses.some(
      (expense: SplitlyExpense) =>
        expense.paidBy === memberId || expense.participants.some((p) => p.memberId === memberId),
    )

    const hasSettlements = settlements.some(
      (settlement: SplitlySettlement) => settlement.paidBy === memberId || settlement.paidTo === memberId,
    )

    if (hasExpenses || hasSettlements) {
      return {
        success: false,
        error: "Cannot remove member with existing expenses or settlements",
      }
    }

    const updatedMembers = members.filter((member: SplitlyMember) => member.id !== memberId)

    await updateDoc(groupRef, {
      members: updatedMembers,
      updatedAt: serverTimestamp(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error removing Splitly member:", error)
    return { success: false, error }
  }
}

// Splitly Expense operations
export const addSplitlyExpense = async (
  userId: string,
  groupId: string,
  expenseData: Omit<SplitlyExpense, "id" | "createdAt">,
) => {
  try {
    const groupRef = doc(db, "users", userId, "splitlyGroups", groupId)
    const groupSnap = await getDoc(groupRef)

    if (!groupSnap.exists()) {
      return { success: false, error: "Group not found" }
    }

    const groupData = groupSnap.data()
    const expenses = groupData.expenses || []

    // Clean the data to remove any undefined values
    const cleanedExpenseData = removeUndefinedValues(expenseData)

    // Generate a unique ID for the expense
    const expenseId = `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create the new expense object with the cleaned data
    const newExpense = {
      id: expenseId,
      ...cleanedExpenseData,
      createdAt: new Date().toISOString(),
    }

    // Update the document with the new expense
    await updateDoc(groupRef, {
      expenses: [...expenses, newExpense],
      updatedAt: serverTimestamp(),
    })

    return { success: true, id: expenseId }
  } catch (error) {
    console.error("Error adding Splitly expense:", error)
    return { success: false, error }
  }
}

export const updateSplitlyExpense = async (
  userId: string,
  groupId: string,
  expenseId: string,
  expenseData: Partial<Omit<SplitlyExpense, "id" | "createdAt">>,
) => {
  try {
    const groupRef = doc(db, "users", userId, "splitlyGroups", groupId)
    const groupSnap = await getDoc(groupRef)

    if (!groupSnap.exists()) {
      return { success: false, error: "Group not found" }
    }

    const groupData = groupSnap.data()
    const expenses = groupData.expenses || []

    // Clean the data to remove any undefined values
    const cleanedExpenseData = removeUndefinedValues(expenseData)

    const updatedExpenses = expenses.map((expense: SplitlyExpense) => {
      if (expense.id === expenseId) {
        return { ...expense, ...cleanedExpenseData }
      }
      return expense
    })

    await updateDoc(groupRef, {
      expenses: updatedExpenses,
      updatedAt: serverTimestamp(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating Splitly expense:", error)
    return { success: false, error }
  }
}

export const deleteSplitlyExpense = async (userId: string, groupId: string, expenseId: string) => {
  try {
    const groupRef = doc(db, "users", userId, "splitlyGroups", groupId)
    const groupSnap = await getDoc(groupRef)

    if (!groupSnap.exists()) {
      return { success: false, error: "Group not found" }
    }

    const groupData = groupSnap.data()
    const expenses = groupData.expenses || []

    const updatedExpenses = expenses.filter((expense: SplitlyExpense) => expense.id !== expenseId)

    await updateDoc(groupRef, {
      expenses: updatedExpenses,
      updatedAt: serverTimestamp(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error deleting Splitly expense:", error)
    return { success: false, error }
  }
}

// Splitly Settlement operations
export const addSplitlySettlement = async (
  userId: string,
  groupId: string,
  settlementData: Omit<SplitlySettlement, "id" | "createdAt">,
) => {
  try {
    const groupRef = doc(db, "users", userId, "splitlyGroups", groupId)
    const groupSnap = await getDoc(groupRef)

    if (!groupSnap.exists()) {
      return { success: false, error: "Group not found" }
    }

    const groupData = groupSnap.data()
    const settlements = groupData.settlements || []

    // Clean the data to remove any undefined values
    const cleanedSettlementData = removeUndefinedValues(settlementData)

    const newSettlement: SplitlySettlement = {
      id: `settlement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...cleanedSettlementData,
      createdAt: new Date().toISOString(),
    }

    await updateDoc(groupRef, {
      settlements: [...settlements, newSettlement],
      updatedAt: serverTimestamp(),
    })

    return { success: true, id: newSettlement.id }
  } catch (error) {
    console.error("Error adding Splitly settlement:", error)
    return { success: false, error }
  }
}

export const updateSplitlySettlement = async (
  userId: string,
  groupId: string,
  settlementId: string,
  settlementData: Partial<Omit<SplitlySettlement, "id" | "createdAt">>,
) => {
  try {
    const groupRef = doc(db, "users", userId, "splitlyGroups", groupId)
    const groupSnap = await getDoc(groupRef)

    if (!groupSnap.exists()) {
      return { success: false, error: "Group not found" }
    }

    const groupData = groupSnap.data()
    const settlements = groupData.settlements || []

    // Clean the data to remove any undefined values
    const cleanedSettlementData = removeUndefinedValues(settlementData)

    const updatedSettlements = settlements.map((settlement: SplitlySettlement) => {
      if (settlement.id === settlementId) {
        return { ...settlement, ...cleanedSettlementData }
      }
      return settlement
    })

    await updateDoc(groupRef, {
      settlements: updatedSettlements,
      updatedAt: serverTimestamp(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating Splitly settlement:", error)
    return { success: false, error }
  }
}

export const deleteSplitlySettlement = async (userId: string, groupId: string, settlementId: string) => {
  try {
    const groupRef = doc(db, "users", userId, "splitlyGroups", groupId)
    const groupSnap = await getDoc(groupRef)

    if (!groupSnap.exists()) {
      return { success: false, error: "Group not found" }
    }

    const groupData = groupSnap.data()
    const settlements = groupData.settlements || []

    const updatedSettlements = settlements.filter((settlement: SplitlySettlement) => settlement.id !== settlementId)

    await updateDoc(groupRef, {
      settlements: updatedSettlements,
      updatedAt: serverTimestamp(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error deleting Splitly settlement:", error)
    return { success: false, error }
  }
}

// Blog operations
export const blogService = {
  async create(userId: string, blog: Omit<BlogPost, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const blogRef = collection(db, "users", userId, "blogs")
    const now = Timestamp.now()
    const docRef = await addDoc(blogRef, {
      ...blog,
      createdAt: now,
      updatedAt: now,
    })
    return docRef.id
  },

  async update(userId: string, blogId: string, updates: Partial<BlogPost>): Promise<void> {
    const blogRef = doc(db, "users", userId, "blogs", blogId)
    await updateDoc(blogRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
  },

  async delete(userId: string, blogId: string): Promise<void> {
    const blogRef = doc(db, "users", userId, "blogs", blogId)
    await deleteDoc(blogRef)
  },
}

// Clear all user data
export const clearAllUserData = async (userId: string): Promise<void> => {
  const batch = writeBatch(db)

  // Collections to clear
  const collections = ["trips", "todos", "splitlyGroups", "blogs", "journal"]

  for (const collectionName of collections) {
    const collectionRef = collection(db, "users", userId, collectionName)
    const snapshot = await getDocs(collectionRef)

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })
  }

  await batch.commit()
}
