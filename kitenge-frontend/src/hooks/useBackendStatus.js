import { useSyncExternalStore } from 'react'
import { getBackendStatusSnapshot, subscribeToBackendStatus } from '../services/api'

export const useBackendStatus = () =>
  useSyncExternalStore(
    subscribeToBackendStatus,
    getBackendStatusSnapshot,
    getBackendStatusSnapshot
  )

export default useBackendStatus
