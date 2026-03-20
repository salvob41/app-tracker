const BACKUP_KEY = 'app-tracker:last-backup'
const FIRST_VISIT_KEY = 'app-tracker:first-visit-acknowledged'
const CHANGES_KEY = 'app-tracker:changes-since-backup'

// Backup reminder thresholds
const DAYS_THRESHOLD = 7
const CHANGES_THRESHOLD = 10

export function useBackup() {
  const lastBackupDate = ref<Date | null>(null)
  const changesSinceBackup = ref(0)
  const firstVisitAcknowledged = ref(true)

  const loadBackupState = () => {
    if (import.meta.server) return

    const stored = localStorage.getItem(BACKUP_KEY)
    lastBackupDate.value = stored ? new Date(stored) : null

    const changes = localStorage.getItem(CHANGES_KEY)
    changesSinceBackup.value = changes ? parseInt(changes, 10) : 0

    firstVisitAcknowledged.value = localStorage.getItem(FIRST_VISIT_KEY) === 'true'
  }

  const recordBackup = () => {
    if (import.meta.server) return

    const now = new Date()
    localStorage.setItem(BACKUP_KEY, now.toISOString())
    localStorage.setItem(CHANGES_KEY, '0')
    lastBackupDate.value = now
    changesSinceBackup.value = 0
  }

  const recordChange = () => {
    if (import.meta.server) return

    const newCount = changesSinceBackup.value + 1
    localStorage.setItem(CHANGES_KEY, newCount.toString())
    changesSinceBackup.value = newCount
  }

  const acknowledgeFirstVisit = () => {
    if (import.meta.server) return

    localStorage.setItem(FIRST_VISIT_KEY, 'true')
    firstVisitAcknowledged.value = true
  }

  const daysSinceBackup = computed(() => {
    if (!lastBackupDate.value) return null
    const now = new Date()
    const diff = now.getTime() - lastBackupDate.value.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  })

  const shouldShowReminder = computed(() => {
    // Never backed up and has been using the app
    if (!lastBackupDate.value && changesSinceBackup.value > 0) return true

    // Too many days since backup
    if (daysSinceBackup.value !== null && daysSinceBackup.value >= DAYS_THRESHOLD) return true

    // Too many changes since backup
    if (changesSinceBackup.value >= CHANGES_THRESHOLD) return true

    return false
  })

  const shouldShowFirstVisitNotice = computed(() => {
    return !firstVisitAcknowledged.value
  })

  const lastBackupFormatted = computed(() => {
    if (!lastBackupDate.value) return 'Never'

    const days = daysSinceBackup.value
    if (days === null) return 'Never'
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`
    return lastBackupDate.value.toLocaleDateString()
  })

  // Initialize on client
  onMounted(() => {
    loadBackupState()
  })

  return {
    lastBackupDate,
    lastBackupFormatted,
    daysSinceBackup,
    changesSinceBackup,
    shouldShowReminder,
    shouldShowFirstVisitNotice,
    firstVisitAcknowledged,
    recordBackup,
    recordChange,
    acknowledgeFirstVisit,
    loadBackupState,
  }
}
