// ============================================================================
// Sistema de Notificações e PWA
// ============================================================================
// Gerenciamento de notificações push, lembretes de estudo e PWA
// ============================================================================

export interface NotificationSettings {
  enabled: boolean
  dailyReminder: boolean
  dailyReminderTime: string // HH:MM format
  streakReminder: boolean
  achievementNotifications: boolean
  weeklyReport: boolean
}

export interface ScheduledNotification {
  id: string
  title: string
  body: string
  scheduledFor: number // timestamp
  type: "reminder" | "streak" | "achievement" | "report"
  sent: boolean
}

// ============================================================================
// Storage Keys
// ============================================================================

const SETTINGS_KEY = "ft_exam_notification_settings"
const SCHEDULED_KEY = "ft_exam_scheduled_notifications"

// ============================================================================
// Default Settings
// ============================================================================

function getDefaultSettings(): NotificationSettings {
  return {
    enabled: false,
    dailyReminder: true,
    dailyReminderTime: "19:00",
    streakReminder: true,
    achievementNotifications: true,
    weeklyReport: true,
  }
}

// ============================================================================
// Carregar e Salvar Configurações
// ============================================================================

export function loadNotificationSettings(): NotificationSettings {
  if (typeof window === "undefined") {
    return getDefaultSettings()
  }
  
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (stored) {
      return { ...getDefaultSettings(), ...JSON.parse(stored) }
    }
  } catch (e) {
    console.error("Erro ao carregar configurações de notificação:", e)
  }
  
  return getDefaultSettings()
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (e) {
    console.error("Erro ao salvar configurações de notificação:", e)
  }
}

// ============================================================================
// Service Worker e PWA
// ============================================================================

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    console.log("Service Worker não suportado")
    return null
  }
  
  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    })
    
    console.log("Service Worker registrado:", registration.scope)
    
    // Verificar atualizações
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            // Nova versão disponível
            console.log("Nova versão do app disponível")
          }
        })
      }
    })
    
    return registration
  } catch (error) {
    console.error("Erro ao registrar Service Worker:", error)
    return null
  }
}

export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false
  }
  
  try {
    const registration = await navigator.serviceWorker.ready
    const success = await registration.unregister()
    console.log("Service Worker desregistrado:", success)
    return success
  } catch (error) {
    console.error("Erro ao desregistrar Service Worker:", error)
    return false
  }
}

// ============================================================================
// Permissões de Notificação
// ============================================================================

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported"
  }
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported"
  }
  
  try {
    const permission = await Notification.requestPermission()
    console.log("Permissão de notificação:", permission)
    return permission
  } catch (error) {
    console.error("Erro ao solicitar permissão:", error)
    return "denied"
  }
}

// ============================================================================
// Enviar Notificações
// ============================================================================

export async function sendNotification(
  title: string,
  options?: NotificationOptions
): Promise<Notification | null> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return null
  }
  
  if (Notification.permission !== "granted") {
    console.log("Notificações não permitidas")
    return null
  }
  
  try {
    const notification = new Notification(title, {
      icon: "/icon.svg",
      badge: "/icon.svg",
      ...options,
    })
    
    notification.onclick = () => {
      window.focus()
      notification.close()
    }
    
    return notification
  } catch (error) {
    console.error("Erro ao enviar notificação:", error)
    return null
  }
}

export async function sendPushNotification(
  title: string,
  body: string,
  url?: string
): Promise<void> {
  const registration = await navigator.serviceWorker.ready
  
  await registration.showNotification(title, {
    body,
    icon: "/icon.svg",
    badge: "/icon.svg",
    tag: "treino-pro",
    data: { url: url || "/" },
    vibrate: [100, 50, 100],
    requireInteraction: false,
  })
}

// ============================================================================
// Notificações Predefinidas
// ============================================================================

export async function sendStudyReminder(): Promise<void> {
  await sendNotification("Hora de Estudar!", {
    body: "Mantenha seu streak! Que tal revisar alguns exercícios?",
    tag: "study-reminder",
    data: { url: "/treinar" },
  })
}

export async function sendStreakWarning(currentStreak: number): Promise<void> {
  await sendNotification("Seu Streak Está em Risco!", {
    body: `Você tem um streak de ${currentStreak} dias. Não deixe ele acabar!`,
    tag: "streak-warning",
    data: { url: "/treinar" },
  })
}

export async function sendAchievementUnlocked(
  achievementTitle: string
): Promise<void> {
  await sendNotification("Conquista Desbloqueada!", {
    body: `Você ganhou: ${achievementTitle}`,
    tag: "achievement",
    data: { url: "/dashboard" },
  })
}

export async function sendWeeklyReport(
  exercisesCompleted: number,
  minutesStudied: number
): Promise<void> {
  await sendNotification("Relatório Semanal", {
    body: `Esta semana: ${exercisesCompleted} exercícios em ${Math.round(minutesStudied / 60)}h de estudo!`,
    tag: "weekly-report",
    data: { url: "/dashboard" },
  })
}

// ============================================================================
// Agendamento de Notificações (via setTimeout - demo)
// ============================================================================

let reminderTimeout: NodeJS.Timeout | null = null

export function scheduleNextDailyReminder(time: string): void {
  if (reminderTimeout) {
    clearTimeout(reminderTimeout)
  }
  
  const [hours, minutes] = time.split(":").map(Number)
  const now = new Date()
  const scheduledTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0
  )
  
  // Se o horário já passou hoje, agenda para amanhã
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1)
  }
  
  const msUntilReminder = scheduledTime.getTime() - now.getTime()
  
  console.log(`Lembrete agendado para ${scheduledTime.toLocaleString("pt-BR")}`)
  
  reminderTimeout = setTimeout(() => {
    sendStudyReminder()
    // Reagendar para o próximo dia
    scheduleNextDailyReminder(time)
  }, msUntilReminder)
}

export function cancelScheduledReminders(): void {
  if (reminderTimeout) {
    clearTimeout(reminderTimeout)
    reminderTimeout = null
    console.log("Lembretes cancelados")
  }
}

// ============================================================================
// PWA Install Prompt
// ============================================================================

let deferredPrompt: BeforeInstallPromptEvent | null = null

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function setupInstallPrompt(): void {
  if (typeof window === "undefined") return
  
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault()
    deferredPrompt = e as BeforeInstallPromptEvent
    console.log("Prompt de instalação disponível")
  })
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    console.log("Prompt de instalação não disponível")
    return false
  }
  
  deferredPrompt.prompt()
  
  const { outcome } = await deferredPrompt.userChoice
  console.log("Resultado da instalação:", outcome)
  
  deferredPrompt = null
  
  return outcome === "accepted"
}

export function isInstallPromptAvailable(): boolean {
  return deferredPrompt !== null
}

export function isPWAInstalled(): boolean {
  if (typeof window === "undefined") return false
  
  // Verifica se está rodando como PWA
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

// ============================================================================
// Check Online Status
// ============================================================================

export function isOnline(): boolean {
  if (typeof window === "undefined") return true
  return navigator.onLine
}

export function setupOnlineStatusListener(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  if (typeof window === "undefined") {
    return () => {}
  }
  
  window.addEventListener("online", onOnline)
  window.addEventListener("offline", onOffline)
  
  return () => {
    window.removeEventListener("online", onOnline)
    window.removeEventListener("offline", onOffline)
  }
}
