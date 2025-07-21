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
  Timestamp,
  onSnapshot,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Trip, Task, Expense } from "@/types"

// User operations
export const createUserDocument = async (userId: string, userData: { name?: string; email?: string }) => {
  try {
    const userRef = doc(db, "users", userId)
    await setDoc(
      userRef,
      {
        name: userData.name || "",
        email: userData.email || "",
        createdAt: serverTimestamp(),
      },
      { merge: true },
    )
    return userRef
  } catch (error) {
    console.error("Error creating user document:", error)
    throw error
  }
}

export const getUserDocument = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() }
    }
    return null
  } catch (error) {
    console.error("Error getting user document:", error)
    throw error
  }
}

// Trip operations
// Add validation in the createTrip function
export const createTrip = async (userId: string, tripData: Omit<Trip, "id" | "tasks" | "expenses">) => {
  try {
    // Check if there's already an ongoing trip
    if (tripData.status === "ongoing") {
      const tripsRef = collection(db, "users", userId, "trips")
      const q = query(tripsRef, where("status", "==", "ongoing"))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        throw new Error("You already have an ongoing trip. Please complete it before starting a new one.")
      }
    }

    // Check if there are already 3 planned trips
    if (tripData.status === "planned") {
      const tripsRef = collection(db, "users", userId, "trips")
      const q = query(tripsRef, where("status", "==", "planned"))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.size >= 3) {
        throw new Error("You've reached the limit of 3 planned trips. Complete or delete a trip to add a new one.")
      }
    }

    const tripsRef = collection(db, "users", userId, "trips")
    const newTripData = {
      ...tripData,
      createdAt: serverTimestamp(),
    }
    const tripDoc = await addDoc(tripsRef, newTripData)
    return { id: tripDoc.id, ...newTripData }
  } catch (error) {
    console.error("Error creating trip:", error)
    throw error
  }
}

export const getTrips = async (userId: string) => {
  try {
    const tripsRef = collection(db, "users", userId, "trips")
    const q = query(tripsRef, orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    const trips: Trip[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      trips.push({
        id: doc.id,
        name: data.name,
        destination: data.destination,
        startDate: data.startDate,
        endDate: data.endDate,
        tripType: data.tripType,
        people: data.people,
        budget: data.budget,
        miscellaneousFunds: data.miscellaneousFunds || 0,
        safetyFunds: data.safetyFunds,
        status: data.status,
        homeCurrency: data.homeCurrency,
        tripCurrency: data.tripCurrency,
        exchangeRate: data.exchangeRate,
        tasks: {},
        expenses: [],
      })
    })

    return trips
  } catch (error) {
    console.error("Error getting trips:", error)
    throw error
  }
}

// Update the subscribeToTrips function to handle errors properly

export const subscribeToTrips = (
  userId: string,
  callback: (trips: Trip[]) => void,
  errorCallback?: (error: Error) => void,
) => {
  try {
    console.log(`Subscribing to trips for user: ${userId}`)
    const tripsRef = collection(db, "users", userId, "trips")
    const q = query(tripsRef, orderBy("createdAt", "desc"))

    return onSnapshot(
      q,
      (querySnapshot) => {
        console.log(`Received snapshot with ${querySnapshot.docs.length} trips`)
        const trips: Trip[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          trips.push({
            id: doc.id,
            name: data.name,
            destination: data.destination,
            startDate: data.startDate,
            endDate: data.endDate,
            tripType: data.tripType,
            people: data.people,
            budget: data.budget,
            miscellaneousFunds: data.miscellaneousFunds || 0,
            safetyFunds: data.safetyFunds,
            status: data.status,
            homeCurrency: data.homeCurrency,
            tripCurrency: data.tripCurrency,
            exchangeRate: data.exchangeRate,
            tasks: {},
            expenses: [],
          })
        })

        callback(trips)
      },
      (error) => {
        console.error("Error in trips subscription:", error)
        if (errorCallback) {
          errorCallback(error)
        }
      },
    )
  } catch (error) {
    console.error("Error subscribing to trips:", error)
    if (errorCallback && error instanceof Error) {
      errorCallback(error)
    }
    // Return a no-op unsubscribe function
    return () => {
      console.log("No-op unsubscribe called due to error")
    }
  }
}

export const getTrip = async (userId: string, tripId: string) => {
  try {
    const tripRef = doc(db, "users", userId, "trips", tripId)
    const tripSnap = await getDoc(tripRef)

    if (tripSnap.exists()) {
      const data = tripSnap.data()
      return {
        id: tripSnap.id,
        name: data.name,
        destination: data.destination,
        startDate: data.startDate,
        endDate: data.endDate,
        tripType: data.tripType,
        people: data.people,
        budget: data.budget,
        miscellaneousFunds: data.miscellaneousFunds || 0,
        safetyFunds: data.safetyFunds,
        status: data.status,
        homeCurrency: data.homeCurrency,
        tripCurrency: data.tripCurrency,
        exchangeRate: data.exchangeRate,
        tasks: {},
        expenses: [],
      } as Trip
    }

    return null
  } catch (error) {
    console.error("Error getting trip:", error)
    throw error
  }
}

// Add validation in the updateTrip function for status changes
export const updateTrip = async (userId: string, tripId: string, tripData: Partial<Trip>) => {
  try {
    // If we're updating the status to "ongoing", check if there's already an ongoing trip
    if (tripData.status === "ongoing") {
      const tripsRef = collection(db, "users", userId, "trips")
      const q = query(tripsRef, where("status", "==", "ongoing"))
      const querySnapshot = await getDocs(q)

      // If there's an ongoing trip that's not the one we're updating
      if (!querySnapshot.empty && !querySnapshot.docs.some((doc) => doc.id === tripId)) {
        throw new Error("You already have an ongoing trip. Please complete it before starting a new one.")
      }
    }

    const tripRef = doc(db, "users", userId, "trips", tripId)
    await updateDoc(tripRef, {
      ...tripData,
      updatedAt: serverTimestamp(),
    })
    return { id: tripId, ...tripData }
  } catch (error) {
    console.error("Error updating trip:", error)
    throw error
  }
}

export const deleteTrip = async (userId: string, tripId: string) => {
  try {
    const tripRef = doc(db, "users", userId, "trips", tripId)
    await deleteDoc(tripRef)
    return tripId
  } catch (error) {
    console.error("Error deleting trip:", error)
    throw error
  }
}

// Task operations
export const createTask = async (userId: string, tripId: string, taskData: Omit<Task, "id" | "completed">) => {
  try {
    const tasksRef = collection(db, "users", userId, "trips", tripId, "tasks")
    const newTaskData = {
      name: taskData.name,
      notes: taskData.notes || "",
      location: taskData.location || "",
      time: taskData.time,
      budgetCost: taskData.budgetCost || 0,
      completed: false,
      date: taskData.date || new Date().toISOString().split("T")[0],
      createdAt: serverTimestamp(),
    }
    const taskDoc = await addDoc(tasksRef, newTaskData)
    return { id: taskDoc.id, ...newTaskData, completed: false }
  } catch (error) {
    console.error("Error creating task:", error)
    throw error
  }
}

export const getTasks = async (userId: string, tripId: string) => {
  try {
    const tasksRef = collection(db, "users", userId, "trips", tripId, "tasks")
    const querySnapshot = await getDocs(tasksRef)

    const tasks: Record<string, Task[]> = {}

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      const date = data.date || new Date().toISOString().split("T")[0]

      if (!tasks[date]) {
        tasks[date] = []
      }

      tasks[date].push({
        id: doc.id,
        name: data.name,
        notes: data.notes || "",
        location: data.location || "",
        time: data.time,
        budgetCost: data.budgetCost || 0,
        completed: data.completed || false,
        date: date,
      })
    })

    return tasks
  } catch (error) {
    console.error("Error getting tasks:", error)
    throw error
  }
}

export const subscribeToTasks = (userId: string, tripId: string, callback: (tasks: Record<string, Task[]>) => void) => {
  try {
    const tasksRef = collection(db, "users", userId, "trips", tripId, "tasks")

    return onSnapshot(tasksRef, (querySnapshot) => {
      const tasks: Record<string, Task[]> = {}

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        const date = data.date || new Date().toISOString().split("T")[0]

        if (!tasks[date]) {
          tasks[date] = []
        }

        tasks[date].push({
          id: doc.id,
          name: data.name,
          notes: data.notes || "",
          location: data.location || "",
          time: data.time,
          budgetCost: data.budgetCost || 0,
          completed: data.completed || false,
          date: date,
        })
      })

      callback(tasks)
    })
  } catch (error) {
    console.error("Error subscribing to tasks:", error)
    throw error
  }
}

export const updateTask = async (userId: string, tripId: string, taskId: string, taskData: Partial<Task>) => {
  try {
    const taskRef = doc(db, "users", userId, "trips", tripId, "tasks", taskId)
    await updateDoc(taskRef, {
      ...taskData,
      updatedAt: serverTimestamp(),
    })
    return { id: taskId, ...taskData }
  } catch (error) {
    console.error("Error updating task:", error)
    throw error
  }
}

export const deleteTask = async (userId: string, tripId: string, taskId: string) => {
  try {
    const taskRef = doc(db, "users", userId, "trips", tripId, "tasks", taskId)
    await deleteDoc(taskRef)
    return taskId
  } catch (error) {
    console.error("Error deleting task:", error)
    throw error
  }
}

// Expense operations
export const createExpense = async (
  userId: string,
  tripId: string,
  expenseData: Omit<Expense, "id" | "tripId" | "createdAt">,
) => {
  try {
    const expensesRef = collection(db, "users", userId, "trips", tripId, "expenses")
    const newExpenseData = {
      name: expenseData.name,
      category: expenseData.category,
      date: expenseData.date,
      amount: expenseData.amount, // Original amount in trip currency
      amountInHomeCurrency: expenseData.amountInHomeCurrency, // Converted amount in home currency
      fundType: expenseData.fundType,
      notes: expenseData.notes || "",
      createdAt: serverTimestamp(),
    }
    const expenseDoc = await addDoc(expensesRef, newExpenseData)
    return {
      id: expenseDoc.id,
      ...newExpenseData,
      tripId,
      createdAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error creating expense:", error)
    throw error
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
        name: data.name,
        category: data.category,
        date: data.date,
        amount: data.amount,
        amountInHomeCurrency: data.amountInHomeCurrency,
        fundType: data.fundType,
        notes: data.notes || "",
        tripId,
        createdAt:
          data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
      })
    })

    return expenses
  } catch (error) {
    console.error("Error getting expenses:", error)
    throw error
  }
}

export const subscribeToExpenses = (userId: string, tripId: string, callback: (expenses: Expense[]) => void) => {
  try {
    const expensesRef = collection(db, "users", userId, "trips", tripId, "expenses")
    const q = query(expensesRef, orderBy("createdAt", "desc"))

    return onSnapshot(q, (querySnapshot) => {
      const expenses: Expense[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        expenses.push({
          id: doc.id,
          name: data.name,
          category: data.category,
          date: data.date,
          amount: data.amount,
          amountInHomeCurrency: data.amountInHomeCurrency,
          fundType: data.fundType,
          notes: data.notes || "",
          tripId,
          createdAt:
            data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        })
      })

      callback(expenses)
    })
  } catch (error) {
    console.error("Error subscribing to expenses:", error)
    throw error
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
    await updateDoc(expenseRef, {
      ...expenseData,
      updatedAt: serverTimestamp(),
    })
    return { id: expenseId, ...expenseData }
  } catch (error) {
    console.error("Error updating expense:", error)
    throw error
  }
}

export const deleteExpense = async (userId: string, tripId: string, expenseId: string) => {
  try {
    const expenseRef = doc(db, "users", userId, "trips", tripId, "expenses", expenseId)
    await deleteDoc(expenseRef)
    return expenseId
  } catch (error) {
    console.error("Error deleting expense:", error)
    throw error
  }
}

// Load full trip data (including tasks and expenses)
export const loadFullTripData = async (userId: string, tripId: string) => {
  try {
    const tripData = await getTrip(userId, tripId)

    if (!tripData) {
      return null
    }

    const tasks = await getTasks(userId, tripId)
    const expenses = await getExpenses(userId, tripId)

    return {
      ...tripData,
      tasks,
      expenses,
    } as Trip
  } catch (error) {
    console.error("Error loading full trip data:", error)
    throw error
  }
}

export const subscribeToFullTripData = (userId: string, tripId: string, callback: (trip: Trip | null) => void) => {
  try {
    const tripRef = doc(db, "users", userId, "trips", tripId)

    // Subscribe to trip document
    const unsubscribeTrip = onSnapshot(tripRef, async (tripSnap) => {
      if (!tripSnap.exists()) {
        callback(null)
        return
      }

      const data = tripSnap.data()
      const tripData = {
        id: tripSnap.id,
        name: data.name,
        destination: data.destination,
        startDate: data.startDate,
        endDate: data.endDate,
        tripType: data.tripType,
        people: data.people,
        budget: data.budget,
        miscellaneousFunds: data.miscellaneousFunds || 0,
        safetyFunds: data.safetyFunds,
        status: data.status,
        homeCurrency: data.homeCurrency,
        tripCurrency: data.tripCurrency,
        exchangeRate: data.exchangeRate,
        tasks: {},
        expenses: [],
      } as Trip

      // Get tasks and expenses
      const tasks = await getTasks(userId, tripId)
      const expenses = await getExpenses(userId, tripId)

      callback({
        ...tripData,
        tasks,
        expenses,
      })
    })

    // Return unsubscribe function
    return unsubscribeTrip
  } catch (error) {
    console.error("Error subscribing to full trip data:", error)
    throw error
  }
}
