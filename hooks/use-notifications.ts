// This is a placeholder file to satisfy import requirements
// The notification system has been removed from the application

export const useNotifications = () => {
  return {
    notifications: [],
    loading: false,
    error: null,
    markAsRead: () => {},
    markAllAsRead: () => {},
    removeNotification: () => {},
    clearAll: () => {},
    archiveOne: () => {},
    archiveAll: () => {},
    unarchiveOne: () => {},
    addNotification: () => Promise.resolve(),
  }
}
