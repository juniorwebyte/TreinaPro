"use client"

import { useState, useEffect, useMemo } from "react"
import {
  type ProgressStats,
  type HeatmapData,
  loadProgressStats,
  getHeatmapData,
  getWeeklyChartData,
  getTopicChartData,
  formatMinutesToReadable,
  getDaysUntilReady,
} from "@/lib/progress"
import { loadUserProfile, type UserProfile, getLevelTitle, getXPForNextLevel, getXPForCurrentLevel } from "@/lib/gamification"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Cell,
  PieChart,
  Pie,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Flame,
  Home,
  Target,
  TrendingUp,
  Trophy,
  Zap,
  BookOpen,
  CheckCircle2,
  BarChart3,
  Activity,
} from "lucide-react"
import Link from "next/link"

// ============================================================================
// Componente HeatmapCalendar - Heatmap estilo GitHub
// ============================================================================

interface HeatmapCalendarProps {
  data: HeatmapData[]
}

function HeatmapCalendar({ data }: HeatmapCalendarProps) {
  const weeks = useMemo(() => {
    const result: HeatmapData[][] = []
    let currentWeek: HeatmapData[] = []
    
    // Preencher dias iniciais da primeira semana
    const firstDay = new Date(data[0]?.date || new Date())
    const dayOfWeek = firstDay.getDay()
    
    for (let i = 0; i < dayOfWeek; i++) {
      currentWeek.push({ date: "", count: 0, level: 0 })
    }
    
    data.forEach((day, index) => {
      currentWeek.push(day)
      
      if (currentWeek.length === 7) {
        result.push(currentWeek)
        currentWeek = []
      }
    })
    
    // Preencher dias finais
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: "", count: 0, level: 0 })
      }
      result.push(currentWeek)
    }
    
    return result
  }, [data])
  
  const months = useMemo(() => {
    const result: { name: string; weeks: number }[] = []
    let currentMonth = ""
    let weekCount = 0
    
    weeks.forEach(week => {
      const firstValidDay = week.find(d => d.date)
      if (firstValidDay) {
        const date = new Date(firstValidDay.date)
        const month = date.toLocaleDateString("pt-BR", { month: "short" })
        
        if (month !== currentMonth) {
          if (currentMonth) {
            result.push({ name: currentMonth, weeks: weekCount })
          }
          currentMonth = month
          weekCount = 1
        } else {
          weekCount++
        }
      }
    })
    
    if (currentMonth) {
      result.push({ name: currentMonth, weeks: weekCount })
    }
    
    return result
  }, [weeks])
  
  const LEVEL_COLORS = [
    "bg-secondary",
    "bg-primary/25",
    "bg-primary/50",
    "bg-primary/75",
    "bg-primary",
  ]
  
  const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"]
  
  return (
    <div className="overflow-x-auto">
      {/* Meses */}
      <div className="mb-1 flex gap-0.5 pl-8">
        {months.map((month, i) => (
          <div
            key={i}
            className="text-xs text-muted-foreground"
            style={{ width: month.weeks * 13 }}
          >
            {month.name}
          </div>
        ))}
      </div>
      
      <div className="flex gap-1">
        {/* Dias da semana */}
        <div className="flex flex-col gap-0.5 pr-1">
          {DAYS.map((day, i) => (
            <div
              key={day}
              className={cn(
                "flex h-3 w-6 items-center text-[10px] text-muted-foreground",
                i % 2 === 1 && "invisible"
              )}
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Grid */}
        <div className="flex gap-0.5">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-0.5">
              {week.map((day, dayIndex) => (
                <TooltipProvider key={`${weekIndex}-${dayIndex}`} delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "size-3 rounded-sm transition-colors",
                          day.date ? LEVEL_COLORS[day.level] : "bg-transparent",
                          day.date && "hover:ring-1 hover:ring-foreground/50"
                        )}
                      />
                    </TooltipTrigger>
                    {day.date && (
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-medium">
                          {day.count} exercicio{day.count !== 1 ? "s" : ""}
                        </p>
                        <p className="text-muted-foreground">
                          {new Date(day.date).toLocaleDateString("pt-BR", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legenda */}
      <div className="mt-3 flex items-center justify-end gap-1 text-xs text-muted-foreground">
        <span>Menos</span>
        {LEVEL_COLORS.map((color, i) => (
          <div key={i} className={cn("size-3 rounded-sm", color)} />
        ))}
        <span>Mais</span>
      </div>
    </div>
  )
}

// ============================================================================
// Componente StatsCard - Card de estatística
// ============================================================================

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  trend?: number
  color?: string
}

function StatsCard({ title, value, subtitle, icon: Icon, trend, color = "primary" }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div 
          className={cn(
            "flex size-12 items-center justify-center rounded-xl",
            color === "primary" && "bg-primary/10",
            color === "success" && "bg-emerald-500/10",
            color === "warning" && "bg-amber-500/10",
            color === "info" && "bg-blue-500/10",
          )}
        >
          <Icon 
            className={cn(
              "size-6",
              color === "primary" && "text-primary",
              color === "success" && "text-emerald-500",
              color === "warning" && "text-amber-500",
              color === "info" && "text-blue-500",
            )} 
          />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
            trend >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
          )}>
            <TrendingUp className={cn("size-3", trend < 0 && "rotate-180")} />
            {Math.abs(trend)}%
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Componente TopicProgressCard - Progresso por tópico
// ============================================================================

interface TopicProgressCardProps {
  topic: {
    id: string
    name: string
    color: string
    totalExercises: number
    completedExercises: number
    correctAnswers: number
    incorrectAnswers: number
    averageTime: number
    lastStudied?: number
  }
}

function TopicProgressCard({ topic }: TopicProgressCardProps) {
  const progress = topic.totalExercises > 0 
    ? Math.round((topic.completedExercises / topic.totalExercises) * 100) 
    : 0
  const accuracy = (topic.correctAnswers + topic.incorrectAnswers) > 0
    ? Math.round((topic.correctAnswers / (topic.correctAnswers + topic.incorrectAnswers)) * 100)
    : 0
    
  const lastStudiedText = topic.lastStudied
    ? new Date(topic.lastStudied).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })
    : "Nunca"
  
  return (
    <Card className="overflow-hidden">
      <div 
        className="h-1"
        style={{ 
          background: `linear-gradient(to right, ${topic.color} ${progress}%, transparent ${progress}%)` 
        }}
      />
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="size-3 rounded-full"
              style={{ backgroundColor: topic.color }}
            />
            <span className="font-medium">{topic.name}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {topic.completedExercises}/{topic.totalExercises}
          </Badge>
        </div>
        
        <Progress value={progress} className="mb-3 h-2" />
        
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <p className="font-semibold text-foreground">{progress}%</p>
            <p className="text-muted-foreground">Progresso</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">{accuracy}%</p>
            <p className="text-muted-foreground">Precisao</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">{lastStudiedText}</p>
            <p className="text-muted-foreground">Ultimo</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Componente ReadinessGauge - Medidor de prontidao
// ============================================================================

interface ReadinessGaugeProps {
  progress: number
  daysUntilReady: number
}

function ReadinessGauge({ progress, daysUntilReady }: ReadinessGaugeProps) {
  const data = [
    { name: "progress", value: progress, fill: "var(--color-primary)" },
    { name: "remaining", value: 100 - progress, fill: "var(--color-secondary)" },
  ]
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="size-5 text-primary" />
          Prontidao para o Exame
        </CardTitle>
        <CardDescription>
          Baseado no seu progresso e ritmo de estudo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <div className="relative size-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold">{progress}%</span>
              <span className="text-sm text-muted-foreground">Pronto</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 rounded-lg bg-secondary/50 p-4 text-center">
          {daysUntilReady > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">Previsao de conclusao em</p>
              <p className="text-2xl font-bold text-primary">{daysUntilReady} dias</p>
              <p className="text-xs text-muted-foreground">
                Continue no ritmo atual
              </p>
            </>
          ) : daysUntilReady === 0 ? (
            <>
              <p className="text-sm text-muted-foreground">Voce esta</p>
              <p className="text-2xl font-bold text-primary">Pronto!</p>
              <p className="text-xs text-muted-foreground">
                Boa sorte no exame
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Continue estudando para</p>
              <p className="text-lg font-bold">ver a previsao</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Componente Principal - Dashboard de Progresso
// ============================================================================

export default function DashboardPage() {
  const [stats, setStats] = useState<ProgressStats | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  
  useEffect(() => {
    setStats(loadProgressStats())
    setProfile(loadUserProfile())
  }, [])
  
  const heatmapData = useMemo(() => {
    if (!stats) return []
    return getHeatmapData(stats.studyHistory)
  }, [stats])
  
  const weeklyChartData = useMemo(() => {
    if (!stats) return []
    return getWeeklyChartData(stats.weeklyStats)
  }, [stats])
  
  const topicChartData = useMemo(() => {
    if (!stats) return []
    return getTopicChartData(stats.topicProgress)
  }, [stats])
  
  const daysUntilReady = useMemo(() => {
    if (!stats?.estimatedReadyDate) return -1
    return getDaysUntilReady(stats.estimatedReadyDate)
  }, [stats])
  
  if (!stats || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    )
  }
  
  const xpForCurrent = getXPForCurrentLevel(profile.level)
  const xpForNext = getXPForNextLevel(profile.level)
  const xpProgress = ((profile.xp - xpForCurrent) / (xpForNext - xpForCurrent)) * 100
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="size-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold">Dashboard de Progresso</h1>
              <p className="text-xs text-muted-foreground">
                Acompanhe sua evolucao
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="mr-2 size-4" />
                Inicio
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container py-6">
        {/* Profile Summary */}
        <Card className="mb-6">
          <CardContent className="flex flex-col items-center gap-6 p-6 md:flex-row">
            <div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-3xl font-bold text-primary-foreground">
              {profile.level}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold">{profile.username}</h2>
              <p className="text-muted-foreground">
                {getLevelTitle(profile.level)} - Nivel {profile.level}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Progress value={xpProgress} className="h-2 flex-1" />
                <span className="text-xs text-muted-foreground">
                  {profile.xp}/{xpForNext} XP
                </span>
              </div>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <div className="flex items-center justify-center gap-1">
                  <Flame className="size-5 text-orange-500" />
                  <span className="text-2xl font-bold">{stats.currentStreak}</span>
                </div>
                <p className="text-xs text-muted-foreground">Streak Atual</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1">
                  <Trophy className="size-5 text-amber-500" />
                  <span className="text-2xl font-bold">{stats.bestStreak}</span>
                </div>
                <p className="text-xs text-muted-foreground">Melhor Streak</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1">
                  <Zap className="size-5 text-primary" />
                  <span className="text-2xl font-bold">{profile.xp}</span>
                </div>
                <p className="text-xs text-muted-foreground">XP Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="size-4" />
              <span className="hidden sm:inline">Visao Geral</span>
            </TabsTrigger>
            <TabsTrigger value="topics" className="gap-2">
              <BookOpen className="size-4" />
              <span className="hidden sm:inline">Topicos</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="size-4" />
              <span className="hidden sm:inline">Atividade</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Tempo de Estudo"
                value={formatMinutesToReadable(stats.totalStudyTime)}
                subtitle="Total acumulado"
                icon={Clock}
                color="info"
              />
              <StatsCard
                title="Exercicios"
                value={stats.totalExercises}
                subtitle="Completados"
                icon={CheckCircle2}
                color="success"
              />
              <StatsCard
                title="Precisao"
                value={`${stats.averageAccuracy}%`}
                subtitle="Media geral"
                icon={Target}
                color="warning"
              />
              <StatsCard
                title="Progresso"
                value={`${stats.overallProgress}%`}
                subtitle="Conclusao"
                icon={TrendingUp}
                color="primary"
              />
            </div>
            
            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Weekly Activity Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Atividade Semanal</CardTitle>
                  <CardDescription>Exercicios por semana</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: {
                        label: "Exercicios",
                        color: "hsl(var(--primary))",
                      },
                    }}
                    className="h-[200px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyChartData}>
                        <defs>
                          <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis className="text-xs" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="var(--color-primary)"
                          fill="url(#fillValue)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
              
              {/* Readiness Gauge */}
              <ReadinessGauge 
                progress={stats.overallProgress} 
                daysUntilReady={daysUntilReady}
              />
            </div>
            
            {/* Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="size-5 text-primary" />
                  Calendario de Atividade
                </CardTitle>
                <CardDescription>Seu historico de estudo nos ultimos 365 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <HeatmapCalendar data={heatmapData} />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Topics Tab */}
          <TabsContent value="topics" className="space-y-6">
            {/* Topic Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Progresso por Topico</CardTitle>
                <CardDescription>Porcentagem de conclusao em cada area</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: {
                      label: "Progresso",
                      color: "hsl(var(--primary))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topicChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} className="text-xs" />
                      <YAxis type="category" dataKey="name" className="text-xs" width={80} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="value" 
                        fill="var(--color-primary)" 
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            
            {/* Topic Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.topicProgress.map(topic => (
                <TopicProgressCard key={topic.id} topic={topic} />
              ))}
            </div>
          </TabsContent>
          
          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Atividade Recente</CardTitle>
                <CardDescription>Seus ultimos dias de estudo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.studyHistory
                    .slice(-10)
                    .reverse()
                    .map((day, index) => (
                      <div 
                        key={day.date}
                        className="flex items-center gap-4 rounded-lg border p-3"
                      >
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                          <Calendar className="size-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {new Date(day.date).toLocaleDateString("pt-BR", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {day.exercisesCompleted} exercicio{day.exercisesCompleted !== 1 ? "s" : ""} em {day.topicsStudied.length} topico{day.topicsStudied.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary">+{day.xpEarned} XP</p>
                          <p className="text-xs text-muted-foreground">
                            {formatMinutesToReadable(day.minutesStudied)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Heatmap Duplicate for Activity Tab */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="size-5 text-primary" />
                  Historico Completo
                </CardTitle>
                <CardDescription>365 dias de atividade</CardDescription>
              </CardHeader>
              <CardContent>
                <HeatmapCalendar data={heatmapData} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
