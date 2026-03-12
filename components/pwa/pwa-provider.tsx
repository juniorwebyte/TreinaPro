"use client"

import { useEffect, useState, createContext, useContext, useCallback } from "react"
import {
  type NotificationSettings,
  registerServiceWorker,
  loadNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  getNotificationPermission,
  scheduleNextDailyReminder,
  cancelScheduledReminders,
  setupInstallPrompt,
  isOnline,
  setupOnlineStatusListener,
  isPWAInstalled,
  isInstallPromptAvailable,
  promptInstall,
} from "@/lib/notifications"

interface PWAContextType {
  isOnline: boolean
  isInstalled: boolean
  canInstall: boolean
  notificationPermission: NotificationPermission | "unsupported"
  settings: NotificationSettings
  updateSettings: (settings: Partial<NotificationSettings>) => void
  requestPermission: () => Promise<boolean>
  installApp: () => Promise<boolean>
  swRegistration: ServiceWorkerRegistration | null
}

const PWAContext = createContext<PWAContextType | null>(null)

export function usePWA() {
  const context = useContext(PWAContext)
  if (!context) {
    throw new Error("usePWA must be used within PWAProvider")
  }
  return context
}

interface PWAProviderProps {
  children: React.ReactNode
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [online, setOnline] = useState(true)
  const [installed, setInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default")
  const [settings, setSettings] = useState<NotificationSettings>(loadNotificationSettings())
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null)
  
  // Inicialização
  useEffect(() => {
    // Verificar status online
    setOnline(isOnline())
    
    // Verificar se está instalado
    setInstalled(isPWAInstalled())
    
    // Verificar permissão de notificação
    setPermission(getNotificationPermission())
    
    // Setup do prompt de instalação
    setupInstallPrompt()
    
    // Verificar se pode instalar (com delay para o evento ser capturado)
    const checkInstall = setTimeout(() => {
      setCanInstall(isInstallPromptAvailable())
    }, 1000)
    
    // Registrar Service Worker
    registerServiceWorker().then((registration) => {
      setSwRegistration(registration)
    })
    
    // Listener de status online/offline
    const cleanup = setupOnlineStatusListener(
      () => setOnline(true),
      () => setOnline(false)
    )
    
    return () => {
      cleanup()
      clearTimeout(checkInstall)
    }
  }, [])
  
  // Gerenciar lembretes baseado nas configurações
  useEffect(() => {
    if (settings.enabled && settings.dailyReminder && permission === "granted") {
      scheduleNextDailyReminder(settings.dailyReminderTime)
    } else {
      cancelScheduledReminders()
    }
    
    return () => cancelScheduledReminders()
  }, [settings.enabled, settings.dailyReminder, settings.dailyReminderTime, permission])
  
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings }
      saveNotificationSettings(updated)
      return updated
    })
  }, [])
  
  const requestPermission = useCallback(async () => {
    const result = await requestNotificationPermission()
    setPermission(result)
    
    if (result === "granted") {
      updateSettings({ enabled: true })
      return true
    }
    return false
  }, [updateSettings])
  
  const installApp = useCallback(async () => {
    const success = await promptInstall()
    if (success) {
      setInstalled(true)
      setCanInstall(false)
    }
    return success
  }, [])
  
  const value: PWAContextType = {
    isOnline: online,
    isInstalled: installed,
    canInstall,
    notificationPermission: permission,
    settings,
    updateSettings,
    requestPermission,
    installApp,
    swRegistration,
  }
  
  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  )
}
