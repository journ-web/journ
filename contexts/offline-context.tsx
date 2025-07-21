// This is a placeholder file to satisfy import requirements
// The offline functionality has been removed from the application

export const useOffline = () => {
  return {
    isOffline: false,
    setManualOffline: () => {},
    pendingActions: [],
    addOfflineAction: async () => "",
    syncOfflineData: async () => false,
    hasOfflineData: false,
  }
}
