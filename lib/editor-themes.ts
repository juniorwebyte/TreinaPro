// ==================== TEMAS DO EDITOR DE CÓDIGO ====================
// Sistema de temas para o editor de código

export interface EditorTheme {
  id: string
  name: string
  bg: string
  text: string
  lineNumbers: string
  lineNumbersBg: string
  selection: string
  cursor: string
  comment: string
  keyword: string
  string: string
  number: string
  function: string
  variable: string
  operator: string
}

export const EDITOR_THEMES: EditorTheme[] = [
  {
    id: "dark",
    name: "Dark (Padrao)",
    bg: "hsl(240 10% 3.9%)",
    text: "hsl(0 0% 98%)",
    lineNumbers: "hsl(240 5% 64.9%)",
    lineNumbersBg: "hsl(240 10% 6%)",
    selection: "hsla(217.2 91.2% 59.8% / 0.3)",
    cursor: "hsl(0 0% 98%)",
    comment: "hsl(240 5% 50%)",
    keyword: "hsl(339.2 82% 60%)",
    string: "hsl(142.1 70.6% 45.3%)",
    number: "hsl(47.9 95.8% 53.1%)",
    function: "hsl(217.2 91.2% 59.8%)",
    variable: "hsl(0 0% 98%)",
    operator: "hsl(0 0% 80%)",
  },
  {
    id: "light",
    name: "Light",
    bg: "hsl(0 0% 100%)",
    text: "hsl(240 10% 3.9%)",
    lineNumbers: "hsl(240 5% 50%)",
    lineNumbersBg: "hsl(0 0% 96%)",
    selection: "hsla(217.2 91.2% 59.8% / 0.2)",
    cursor: "hsl(240 10% 3.9%)",
    comment: "hsl(240 5% 50%)",
    keyword: "hsl(339.2 82% 40%)",
    string: "hsl(142.1 70.6% 35%)",
    number: "hsl(47.9 95.8% 40%)",
    function: "hsl(217.2 91.2% 50%)",
    variable: "hsl(240 10% 3.9%)",
    operator: "hsl(240 5% 30%)",
  },
  {
    id: "dracula",
    name: "Dracula",
    bg: "#282a36",
    text: "#f8f8f2",
    lineNumbers: "#6272a4",
    lineNumbersBg: "#21222c",
    selection: "rgba(68, 71, 90, 0.5)",
    cursor: "#f8f8f2",
    comment: "#6272a4",
    keyword: "#ff79c6",
    string: "#f1fa8c",
    number: "#bd93f9",
    function: "#50fa7b",
    variable: "#f8f8f2",
    operator: "#ff79c6",
  },
  {
    id: "one-dark",
    name: "One Dark",
    bg: "#282c34",
    text: "#abb2bf",
    lineNumbers: "#4b5263",
    lineNumbersBg: "#21252b",
    selection: "rgba(62, 68, 81, 0.5)",
    cursor: "#528bff",
    comment: "#5c6370",
    keyword: "#c678dd",
    string: "#98c379",
    number: "#d19a66",
    function: "#61afef",
    variable: "#e06c75",
    operator: "#56b6c2",
  },
  {
    id: "monokai",
    name: "Monokai",
    bg: "#272822",
    text: "#f8f8f2",
    lineNumbers: "#75715e",
    lineNumbersBg: "#1e1f1c",
    selection: "rgba(73, 72, 62, 0.5)",
    cursor: "#f8f8f0",
    comment: "#75715e",
    keyword: "#f92672",
    string: "#e6db74",
    number: "#ae81ff",
    function: "#a6e22e",
    variable: "#f8f8f2",
    operator: "#f92672",
  },
  {
    id: "cristal-glass",
    name: "Cristal Glass",
    // Fundo totalmente transparente para efeito de vidro
    bg: "transparent",
    text: "rgba(248, 250, 252, 0.92)",
    lineNumbers: "rgba(148, 163, 184, 0.9)",
    lineNumbersBg: "transparent",
    selection: "rgba(59, 130, 246, 0.28)",
    cursor: "rgba(248, 250, 252, 0.95)",
    comment: "rgba(148, 163, 184, 0.8)",
    keyword: "rgba(244, 114, 182, 0.9)",
    string: "rgba(52, 211, 153, 0.9)",
    number: "rgba(250, 204, 21, 0.9)",
    function: "rgba(56, 189, 248, 0.9)",
    variable: "rgba(248, 250, 252, 0.92)",
    operator: "rgba(248, 250, 252, 0.8)",
  },
]

// Storage key
const THEME_STORAGE_KEY = "treino_pro_editor_theme"

export function loadEditorTheme(): string {
  if (typeof window === "undefined") return "dark"
  
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored && EDITOR_THEMES.some((t) => t.id === stored)) {
      return stored
    }
  } catch (e) {
    console.error("Erro ao carregar tema:", e)
  }
  
  return "dark"
}

export function saveEditorTheme(themeId: string): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId)
  } catch (e) {
    console.error("Erro ao salvar tema:", e)
  }
}

export function getThemeById(themeId: string): EditorTheme {
  return EDITOR_THEMES.find((t) => t.id === themeId) || EDITOR_THEMES[0]
}
