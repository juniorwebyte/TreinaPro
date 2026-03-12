"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Github, 
  User, 
  Bell, 
  Shield, 
  ExternalLink,
  Check,
  AlertCircle,
  Upload,
  FolderGit2,
  Settings2,
  Trash2,
  RefreshCw
} from "lucide-react"
import Link from "next/link"
import { NotificationSettingsPanel } from "@/components/pwa/notification-settings"

interface GitHubConnection {
  connected: boolean
  username: string | null
  avatarUrl: string | null
  repoName: string | null
  repoUrl: string | null
  lastSync: string | null
}

interface UserSettings {
  displayName: string
  email: string
  autoSaveExercises: boolean
  syncOnComplete: boolean
  privateRepo: boolean
  commitMessage: string
}

const DEFAULT_SETTINGS: UserSettings = {
  displayName: "",
  email: "",
  autoSaveExercises: true,
  syncOnComplete: true,
  privateRepo: true,
  commitMessage: "feat: complete exercise {exerciseName}",
}

export default function SettingsPage() {
  const [githubConnection, setGithubConnection] = useState<GitHubConnection>({
    connected: false,
    username: null,
    avatarUrl: null,
    repoName: null,
    repoUrl: null,
    lastSync: null,
  })
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [isSaving, setIsSaving] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectError, setConnectError] = useState("")

  // Form state for GitHub credentials
  const [githubToken, setGithubToken] = useState("")
  const [githubRepoName, setGithubRepoName] = useState("")
  const [showTokenInput, setShowTokenInput] = useState(false)

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("treino-pro-settings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
    
    const savedGithub = localStorage.getItem("treino-pro-github")
    if (savedGithub) {
      setGithubConnection(JSON.parse(savedGithub))
    }
  }, [])

  // Save settings
  const saveSettings = () => {
    setIsSaving(true)
    localStorage.setItem("treino-pro-settings", JSON.stringify(settings))
    setTimeout(() => setIsSaving(false), 1000)
  }

  // Connect GitHub using real Personal Access Token
  const connectGitHub = async () => {
    setConnectError("")
    const token = githubToken.trim()
    const repo = githubRepoName.trim()

    if (!token) {
      setConnectError("Insira seu Token de Acesso Pessoal do GitHub.")
      return
    }
    if (!repo) {
      setConnectError("Insira o nome do repositorio.")
      return
    }

    setIsConnecting(true)
    try {
      // Valida o token consultando a API real do GitHub
      const userRes = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github+json",
        },
      })

      if (!userRes.ok) {
        throw new Error("Token invalido ou sem permissao.")
      }

      const userData = await userRes.json()

      // Verifica ou cria o repositorio
      const repoRes = await fetch(
        `https://api.github.com/repos/${userData.login}/${repo}`,
        {
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github+json",
          },
        }
      )

      let repoUrl = `https://github.com/${userData.login}/${repo}`

      if (!repoRes.ok) {
        // Repositorio nao existe — cria automaticamente
        const createRes = await fetch("https://api.github.com/user/repos", {
          method: "POST",
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: repo,
            private: settings.privateRepo,
            auto_init: true,
            description: "Exercicios da Piscine 42 — gerado por Guia Piscine",
          }),
        })
        if (!createRes.ok) {
          throw new Error("Nao foi possivel criar o repositorio.")
        }
        const createData = await createRes.json()
        repoUrl = createData.html_url
      }

      const connection: GitHubConnection = {
        connected: true,
        username: userData.login,
        avatarUrl: userData.avatar_url,
        repoName: repo,
        repoUrl,
        lastSync: new Date().toISOString(),
      }

      // Armazena o token de forma separada (nao exibido na UI)
      localStorage.setItem("treino-pro-github-token", token)
      setGithubConnection(connection)
      localStorage.setItem("treino-pro-github", JSON.stringify(connection))
      setGithubToken("")
      setShowTokenInput(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao conectar."
      setConnectError(msg)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectGitHub = () => {
    setGithubConnection({
      connected: false,
      username: null,
      avatarUrl: null,
      repoName: null,
      repoUrl: null,
      lastSync: null,
    })
    localStorage.removeItem("treino-pro-github")
    localStorage.removeItem("treino-pro-github-token")
    setShowTokenInput(false)
    setGithubToken("")
    setGithubRepoName("")
    setConnectError("")
  }

  const syncExercises = () => {
    // In a real app, this would sync completed exercises to GitHub
    const updated = { ...githubConnection, lastSync: new Date().toISOString() }
    setGithubConnection(updated)
    localStorage.setItem("treino-pro-github", JSON.stringify(updated))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto flex h-16 max-w-4xl items-center gap-4 px-4">
          <Link
            href="/"
            className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="flex items-center gap-3">
            <Settings2 className="size-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">Configuracoes</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl p-4 md:p-6">
        <Tabs defaultValue="github" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="github" className="gap-2">
              <Github className="size-4" />
              <span className="hidden sm:inline">GitHub</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="size-4" />
              <span className="hidden sm:inline">Notificacoes</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User className="size-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
          </TabsList>

          {/* GitHub Tab */}
          <TabsContent value="github" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="size-5" />
                  Conexao com GitHub
                </CardTitle>
                <CardDescription>
                  Conecte sua conta do GitHub para salvar automaticamente seus exercicios resolvidos em um repositorio.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {githubConnection.connected ? (
                  <>
                    {/* Connected State */}
                    <div className="flex items-center gap-4 rounded-lg border border-success/30 bg-success/10 p-4">
                      <img
                        src={githubConnection.avatarUrl || ""}
                        alt={githubConnection.username || ""}
                        className="size-12 rounded-full border-2 border-success"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {githubConnection.username}
                          </span>
                          <Badge variant="outline" className="border-success text-success">
                            <Check className="mr-1 size-3" />
                            Conectado
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Repositorio: {githubConnection.repoName}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(githubConnection.repoUrl || "", "_blank")}
                      >
                        <ExternalLink className="size-4" />
                      </Button>
                    </div>

                    {/* Sync Info */}
                    <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                      <div className="flex items-center gap-3">
                        <FolderGit2 className="size-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Ultimo sync</p>
                          <p className="text-xs text-muted-foreground">
                            {githubConnection.lastSync
                              ? new Date(githubConnection.lastSync).toLocaleString("pt-BR")
                              : "Nunca"}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={syncExercises}>
                        <RefreshCw className="mr-2 size-4" />
                        Sincronizar
                      </Button>
                    </div>

                    <Separator />

                    {/* GitHub Settings */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold">Configuracoes de Sincronizacao</h4>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Salvar automaticamente</Label>
                          <p className="text-xs text-muted-foreground">
                            Salvar exercicios quando marcados como concluidos
                          </p>
                        </div>
                        <Switch
                          checked={settings.autoSaveExercises}
                          onCheckedChange={(checked) =>
                            setSettings((prev) => ({ ...prev, autoSaveExercises: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Sync ao completar</Label>
                          <p className="text-xs text-muted-foreground">
                            Fazer push automatico ao completar exercicio
                          </p>
                        </div>
                        <Switch
                          checked={settings.syncOnComplete}
                          onCheckedChange={(checked) =>
                            setSettings((prev) => ({ ...prev, syncOnComplete: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Repositorio privado</Label>
                          <p className="text-xs text-muted-foreground">
                            Manter o repositorio de exercicios privado
                          </p>
                        </div>
                        <Switch
                          checked={settings.privateRepo}
                          onCheckedChange={(checked) =>
                            setSettings((prev) => ({ ...prev, privateRepo: checked }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Mensagem de commit</Label>
                        <Input
                          value={settings.commitMessage}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, commitMessage: e.target.value }))
                          }
                          placeholder="feat: complete exercise {exerciseName}"
                        />
                        <p className="text-xs text-muted-foreground">
                          Use {"{exerciseName}"} para incluir o nome do exercicio
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Danger Zone */}
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="size-5 text-destructive" />
                          <div>
                            <p className="text-sm font-medium text-destructive">Desconectar GitHub</p>
                            <p className="text-xs text-muted-foreground">
                              Isso nao apagara seus exercicios no repositorio
                            </p>
                          </div>
                        </div>
                        <Button variant="destructive" size="sm" onClick={disconnectGitHub}>
                          <Trash2 className="mr-2 size-4" />
                          Desconectar
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Not Connected State */}
                    {!showTokenInput ? (
                      <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-border p-8 text-center">
                        <div className="flex size-16 items-center justify-center rounded-full bg-secondary">
                          <Github className="size-8 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">Conecte seu GitHub</h4>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Salve automaticamente seus exercicios resolvidos em um repositorio do GitHub
                          </p>
                        </div>
                        <Button onClick={() => setShowTokenInput(true)}>
                          <Github className="mr-2 size-4" />
                          Conectar com GitHub
                        </Button>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-border p-6 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Github className="size-5 text-foreground" />
                          <h4 className="font-semibold text-foreground">Credenciais do GitHub</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Gere um{" "}
                          <a
                            href="https://github.com/settings/tokens/new?scopes=repo&description=Guia+Piscine"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            Token de Acesso Pessoal
                          </a>{" "}
                          no GitHub com permissao de <code className="rounded bg-secondary px-1 py-0.5 text-xs">repo</code> e cole abaixo.
                        </p>
                        <div className="space-y-2">
                          <Label htmlFor="ghToken">Token de Acesso Pessoal (PAT)</Label>
                          <Input
                            id="ghToken"
                            type="password"
                            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                            value={githubToken}
                            onChange={(e) => setGithubToken(e.target.value)}
                            autoComplete="off"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ghRepo">Nome do Repositorio</Label>
                          <Input
                            id="ghRepo"
                            type="text"
                            placeholder="42-piscine-exercises"
                            value={githubRepoName}
                            onChange={(e) => setGithubRepoName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && connectGitHub()}
                          />
                          <p className="text-xs text-muted-foreground">
                            Se o repositorio nao existir, ele sera criado automaticamente.
                          </p>
                        </div>

                        {connectError && (
                          <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            <AlertCircle className="size-4 shrink-0" />
                            {connectError}
                          </div>
                        )}

                        <div className="flex gap-3 pt-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              setShowTokenInput(false)
                              setGithubToken("")
                              setGithubRepoName("")
                              setConnectError("")
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={connectGitHub}
                            disabled={isConnecting}
                          >
                            {isConnecting ? (
                              <>
                                <RefreshCw className="mr-2 size-4 animate-spin" />
                                Conectando...
                              </>
                            ) : (
                              "Conectar"
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Benefits */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-start gap-3 rounded-lg bg-secondary/50 p-4">
                        <Upload className="mt-0.5 size-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Backup automatico</p>
                          <p className="text-xs text-muted-foreground">
                            Seus exercicios ficam salvos em nuvem
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-lg bg-secondary/50 p-4">
                        <FolderGit2 className="mt-0.5 size-5 text-accent" />
                        <div>
                          <p className="text-sm font-medium">Portfolio pronto</p>
                          <p className="text-xs text-muted-foreground">
                            Mostre seu progresso para recrutadores
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-lg bg-secondary/50 p-4">
                        <Shield className="mt-0.5 size-5 text-success" />
                        <div>
                          <p className="text-sm font-medium">Controle de versao</p>
                          <p className="text-xs text-muted-foreground">
                            Historico completo de suas solucoes
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-lg bg-secondary/50 p-4">
                        <RefreshCw className="mt-0.5 size-5 text-warning" />
                        <div>
                          <p className="text-sm font-medium">Sincronizacao</p>
                          <p className="text-xs text-muted-foreground">
                            Acesse de qualquer dispositivo
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <NotificationSettingsPanel />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="size-5" />
                  Informacoes do Perfil
                </CardTitle>
                <CardDescription>
                  Configure suas informacoes pessoais para personalizar sua experiencia.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Nome de exibicao</Label>
                  <Input
                    id="displayName"
                    value={settings.displayName}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, displayName: e.target.value }))
                    }
                    placeholder="Seu nome"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="seu@email.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Usado para notificacoes e recuperacao de conta
                  </p>
                </div>

                <Separator />

                <Button onClick={saveSettings} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Check className="mr-2 size-4" />
                      Salvo!
                    </>
                  ) : (
                    "Salvar alteracoes"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="size-5" />
                  Gerenciamento de Dados
                </CardTitle>
                <CardDescription>
                  Exporte ou limpe seus dados armazenados localmente.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Exportar dados</p>
                    <p className="text-xs text-muted-foreground">
                      Baixe todos os seus dados em formato JSON
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Exportar
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-destructive">Limpar dados locais</p>
                    <p className="text-xs text-muted-foreground">
                      Remove todos os dados armazenados no navegador
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Limpar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
