"use client"

import { useState } from "react"
import { usePWA } from "./pwa-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Bell,
  BellOff,
  Download,
  Smartphone,
  Wifi,
  WifiOff,
  Clock,
  Flame,
  Trophy,
  BarChart3,
  Settings,
  Check,
  X,
} from "lucide-react"

export function NotificationSettings() {
  const {
    isOnline,
    isInstalled,
    canInstall,
    notificationPermission,
    settings,
    updateSettings,
    requestPermission,
    installApp,
  } = usePWA()
  
  const [showDialog, setShowDialog] = useState(false)
  
  const handleEnableNotifications = async () => {
    if (notificationPermission === "granted") {
      updateSettings({ enabled: !settings.enabled })
    } else {
      const granted = await requestPermission()
      if (granted) {
        updateSettings({ enabled: true })
      }
    }
  }
  
  const getPermissionStatus = () => {
    if (notificationPermission === "unsupported") {
      return { text: "Nao suportado", color: "text-muted-foreground" }
    }
    if (notificationPermission === "granted") {
      return { text: "Permitido", color: "text-emerald-500" }
    }
    if (notificationPermission === "denied") {
      return { text: "Bloqueado", color: "text-red-500" }
    }
    return { text: "Pendente", color: "text-amber-500" }
  }
  
  const permissionStatus = getPermissionStatus()
  
  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="size-4" />
          <span className="hidden sm:inline">Configuracoes</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="size-5 text-primary" />
            Configuracoes do App
          </DialogTitle>
          <DialogDescription>
            Gerencie notificacoes e instalacao do app
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Status */}
          <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <Wifi className="size-5 text-emerald-500" />
              ) : (
                <WifiOff className="size-5 text-red-500" />
              )}
              <span className="text-sm">Status</span>
            </div>
            <Badge variant={isOnline ? "default" : "destructive"}>
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </div>
          
          {/* Instalação PWA */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Smartphone className="size-4 text-primary" />
                Instalar App
              </CardTitle>
              <CardDescription className="text-xs">
                Instale o app para acesso rapido
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isInstalled ? (
                <div className="flex items-center gap-2 text-sm text-emerald-500">
                  <Check className="size-4" />
                  App instalado
                </div>
              ) : canInstall ? (
                <Button onClick={installApp} className="w-full gap-2">
                  <Download className="size-4" />
                  Instalar App
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Acesse pelo navegador do celular para instalar
                </p>
              )}
            </CardContent>
          </Card>
          
          {/* Notificações */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  {settings.enabled ? (
                    <Bell className="size-4 text-primary" />
                  ) : (
                    <BellOff className="size-4 text-muted-foreground" />
                  )}
                  Notificacoes
                </span>
                <Badge variant="outline" className={cn("text-xs", permissionStatus.color)}>
                  {permissionStatus.text}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notificationPermission === "denied" ? (
                <p className="text-xs text-red-500">
                  Notificacoes bloqueadas. Habilite nas configuracoes do navegador.
                </p>
              ) : (
                <>
                  {/* Toggle principal */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Ativar notificacoes</span>
                    <Switch
                      checked={settings.enabled}
                      onCheckedChange={handleEnableNotifications}
                    />
                  </div>
                  
                  {settings.enabled && (
                    <div className="space-y-3 border-t pt-3">
                      {/* Lembrete diário */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="size-4 text-muted-foreground" />
                          <span className="text-sm">Lembrete diario</span>
                        </div>
                        <Switch
                          checked={settings.dailyReminder}
                          onCheckedChange={(checked) => 
                            updateSettings({ dailyReminder: checked })
                          }
                        />
                      </div>
                      
                      {settings.dailyReminder && (
                        <div className="flex items-center gap-2 pl-6">
                          <span className="text-xs text-muted-foreground">Horario:</span>
                          <Input
                            type="time"
                            value={settings.dailyReminderTime}
                            onChange={(e) => 
                              updateSettings({ dailyReminderTime: e.target.value })
                            }
                            className="h-8 w-24 text-xs"
                          />
                        </div>
                      )}
                      
                      {/* Streak reminder */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Flame className="size-4 text-orange-500" />
                          <span className="text-sm">Alerta de streak</span>
                        </div>
                        <Switch
                          checked={settings.streakReminder}
                          onCheckedChange={(checked) => 
                            updateSettings({ streakReminder: checked })
                          }
                        />
                      </div>
                      
                      {/* Achievement notifications */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Trophy className="size-4 text-amber-500" />
                          <span className="text-sm">Conquistas</span>
                        </div>
                        <Switch
                          checked={settings.achievementNotifications}
                          onCheckedChange={(checked) => 
                            updateSettings({ achievementNotifications: checked })
                          }
                        />
                      </div>
                      
                      {/* Weekly report */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="size-4 text-blue-500" />
                          <span className="text-sm">Relatorio semanal</span>
                        </div>
                        <Switch
                          checked={settings.weeklyReport}
                          onCheckedChange={(checked) => 
                            updateSettings({ weeklyReport: checked })
                          }
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Componente de banner de instalação
export function InstallBanner() {
  const { canInstall, installApp, isInstalled } = usePWA()
  const [dismissed, setDismissed] = useState(false)
  
  if (isInstalled || !canInstall || dismissed) {
    return null
  }
  
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:w-96">
      <Card className="border-primary/20 bg-card/95 shadow-xl backdrop-blur">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <Download className="size-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Instalar Treino PRO</p>
            <p className="text-xs text-muted-foreground">
              Acesso rapido e modo offline
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setDismissed(true)}
            >
              <X className="size-4" />
            </Button>
            <Button size="sm" onClick={installApp}>
              Instalar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente de status offline
export function OfflineIndicator() {
  const { isOnline } = usePWA()
  
  if (isOnline) {
    return null
  }
  
  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <Badge variant="destructive" className="gap-2 px-4 py-2">
        <WifiOff className="size-4" />
        Voce esta offline
      </Badge>
    </div>
  )
}

// Panel completo de configurações de notificações para a página de settings
export function NotificationSettingsPanel() {
  const {
    isOnline,
    isInstalled,
    canInstall,
    notificationPermission,
    settings,
    updateSettings,
    requestPermission,
    installApp,
  } = usePWA()
  
  const handleEnableNotifications = async () => {
    if (notificationPermission === "granted") {
      updateSettings({ enabled: !settings.enabled })
    } else {
      const granted = await requestPermission()
      if (granted) {
        updateSettings({ enabled: true })
      }
    }
  }
  
  const getPermissionStatus = () => {
    if (notificationPermission === "unsupported") {
      return { text: "Nao suportado", color: "text-muted-foreground", icon: X }
    }
    if (notificationPermission === "granted") {
      return { text: "Permitido", color: "text-emerald-500", icon: Check }
    }
    if (notificationPermission === "denied") {
      return { text: "Bloqueado", color: "text-red-500", icon: X }
    }
    return { text: "Pendente", color: "text-amber-500", icon: Clock }
  }
  
  const permissionStatus = getPermissionStatus()
  
  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="size-5 text-emerald-500" />
            ) : (
              <WifiOff className="size-5 text-red-500" />
            )}
            Status do Sistema
          </CardTitle>
          <CardDescription>
            Informacoes sobre conectividade e instalacao
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
              <div className="flex items-center gap-3">
                <Wifi className="size-5 text-muted-foreground" />
                <span className="text-sm">Conexao</span>
              </div>
              <Badge variant={isOnline ? "default" : "destructive"}>
                {isOnline ? "Online" : "Offline"}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
              <div className="flex items-center gap-3">
                <Smartphone className="size-5 text-muted-foreground" />
                <span className="text-sm">App</span>
              </div>
              <Badge variant={isInstalled ? "default" : "outline"}>
                {isInstalled ? "Instalado" : "Navegador"}
              </Badge>
            </div>
          </div>
          
          {!isInstalled && canInstall && (
            <Button onClick={installApp} className="w-full gap-2">
              <Download className="size-4" />
              Instalar App
            </Button>
          )}
        </CardContent>
      </Card>
      
      {/* Notifications Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {settings.enabled ? (
              <Bell className="size-5 text-primary" />
            ) : (
              <BellOff className="size-5 text-muted-foreground" />
            )}
            Notificacoes
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            Permissao: 
            <Badge variant="outline" className={cn("text-xs", permissionStatus.color)}>
              <permissionStatus.icon className="mr-1 size-3" />
              {permissionStatus.text}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationPermission === "denied" ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm text-destructive">
                Notificacoes bloqueadas pelo navegador. Para habilitar, acesse as configuracoes do seu navegador e permita notificacoes para este site.
              </p>
            </div>
          ) : (
            <>
              {/* Toggle principal */}
              <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                <div className="flex items-center gap-3">
                  <Bell className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Ativar notificacoes</p>
                    <p className="text-xs text-muted-foreground">
                      Receba lembretes e alertas
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={handleEnableNotifications}
                />
              </div>
              
              {settings.enabled && (
                <div className="space-y-4 rounded-lg border p-4">
                  {/* Lembrete diário */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="size-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">Lembrete diario</p>
                        <p className="text-xs text-muted-foreground">
                          Receba um lembrete para estudar
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.dailyReminder}
                      onCheckedChange={(checked) => 
                        updateSettings({ dailyReminder: checked })
                      }
                    />
                  </div>
                  
                  {settings.dailyReminder && (
                    <div className="ml-8 flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Horario:</span>
                      <input
                        type="time"
                        value={settings.dailyReminderTime}
                        onChange={(e) => 
                          updateSettings({ dailyReminderTime: e.target.value })
                        }
                        className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
                      />
                    </div>
                  )}
                  
                  {/* Streak reminder */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Flame className="size-5 text-orange-500" />
                      <div>
                        <p className="text-sm font-medium">Alerta de streak</p>
                        <p className="text-xs text-muted-foreground">
                          Aviso quando estiver perdendo o streak
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.streakReminder}
                      onCheckedChange={(checked) => 
                        updateSettings({ streakReminder: checked })
                      }
                    />
                  </div>
                  
                  {/* Achievement notifications */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Trophy className="size-5 text-amber-500" />
                      <div>
                        <p className="text-sm font-medium">Conquistas</p>
                        <p className="text-xs text-muted-foreground">
                          Notificar ao desbloquear conquistas
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.achievementNotifications}
                      onCheckedChange={(checked) => 
                        updateSettings({ achievementNotifications: checked })
                      }
                    />
                  </div>
                  
                  {/* Weekly report */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="size-5 text-emerald-500" />
                      <div>
                        <p className="text-sm font-medium">Relatorio semanal</p>
                        <p className="text-xs text-muted-foreground">
                          Resumo do seu progresso toda segunda
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.weeklyReport}
                      onCheckedChange={(checked) => 
                        updateSettings({ weeklyReport: checked })
                      }
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
