// Header 42 para arquivos C
export const HEADER_42 = `/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   file.c                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: webyte-hub <webyte@42.fr>                    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/27 04:58:11 by webyte-hub          #+#    #+#             */
/*   Updated: 2025/04/27 04:58:14 by webyte-hub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */`

// Gera header 42 com nome do arquivo personalizado
export function generateHeader42(filename: string = "file.c"): string {
  const paddedFilename = filename.padEnd(43, " ")
  return `/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ${paddedFilename}:+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: webyte-hub <webyte@42.fr>                    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/27 04:58:11 by webyte-hub          #+#    #+#             */
/*   Updated: 2025/04/27 04:58:14 by webyte-hub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */`
}

// Interface para erros de norminette
export interface NorminetteError {
  line: number
  rule: string
  message: string
  severity: "error" | "warning"
}

// Valida codigo C conforme regras da norminette/moulinette
export function validateNorminette(code: string): NorminetteError[] {
  const errors: NorminetteError[] = []
  const lines = code.split("\n")
  
  // Verificar se tem header 42
  const hasHeader = code.includes("/* ****") && code.includes(":::      ::::::::   */")
  if (!hasHeader) {
    errors.push({
      line: 1,
      rule: "HEADER",
      message: "Header 42 ausente. Arquivos C precisam do header oficial.",
      severity: "error"
    })
  }

  let inFunction = false
  let functionLineCount = 0
  let braceCount = 0
  let lastNonEmptyLine = ""
  
  lines.forEach((line, index) => {
    const lineNum = index + 1
    const trimmedLine = line.trimEnd()
    
    // Pular linhas do header (primeiras 11 linhas)
    if (lineNum <= 11 && hasHeader) return
    
    // Regra: Linha maior que 80 caracteres
    if (trimmedLine.length > 80) {
      errors.push({
        line: lineNum,
        rule: "LINE_LENGTH",
        message: `Linha com ${trimmedLine.length} caracteres (max: 80).`,
        severity: "error"
      })
    }
    
    // Regra: Trailing whitespace (espacos no final)
    if (line !== trimmedLine && trimmedLine.length > 0) {
      errors.push({
        line: lineNum,
        rule: "TRAILING_SPACE",
        message: "Espacos em branco no final da linha.",
        severity: "warning"
      })
    }
    
    // Regra: Espacos em vez de tabs para indentacao
    if (/^[ ]+[^\s]/.test(line) && !line.startsWith("/*") && !line.startsWith(" *")) {
      errors.push({
        line: lineNum,
        rule: "SPACE_INDENT",
        message: "Use tabs para indentacao, nao espacos.",
        severity: "error"
      })
    }
    
    // Regra: Mais de uma declaracao por linha
    if ((trimmedLine.match(/;/g) || []).length > 1 && !trimmedLine.includes("for")) {
      errors.push({
        line: lineNum,
        rule: "MULTIPLE_STMTS",
        message: "Apenas uma instrucao por linha.",
        severity: "error"
      })
    }
    
    // Regra: Declaracao de variavel com inicializacao
    const varDeclWithInit = /^\t*(int|char|float|double|long|short|unsigned|size_t)\s+\**\w+\s*=\s*.+;/
    if (varDeclWithInit.test(trimmedLine) && !trimmedLine.includes("const")) {
      errors.push({
        line: lineNum,
        rule: "VAR_DECL_INIT",
        message: "Declare variaveis sem inicializar. Atribua valor depois.",
        severity: "error"
      })
    }
    
    // Regra: Mais de 5 variaveis por funcao (simplificado)
    const isVarDecl = /^\t+(int|char|float|double|long|short|unsigned|size_t)\s+\**\w+(\s*,\s*\**\w+)*;/.test(trimmedLine)
    
    // Detectar inicio de funcao
    if (/^\w.*\(.*\)\s*$/.test(trimmedLine) && !trimmedLine.includes(";")) {
      inFunction = true
      functionLineCount = 0
    }
    
    // Contar chaves
    if (trimmedLine.includes("{")) braceCount++
    if (trimmedLine.includes("}")) {
      braceCount--
      if (braceCount === 0) {
        // Regra: Funcao com mais de 25 linhas
        if (functionLineCount > 25) {
          errors.push({
            line: lineNum,
            rule: "FUNC_LENGTH",
            message: `Funcao com ${functionLineCount} linhas (max: 25).`,
            severity: "error"
          })
        }
        inFunction = false
        functionLineCount = 0
      }
    }
    
    if (inFunction && trimmedLine.length > 0) {
      functionLineCount++
    }
    
    // Regra: Espaco apos virgula
    if (/,[^\s]/.test(trimmedLine) && !trimmedLine.includes("','")) {
      errors.push({
        line: lineNum,
        rule: "SPACE_AFTER_COMMA",
        message: "Adicione espaco apos a virgula.",
        severity: "warning"
      })
    }
    
    // Regra: Espaco antes de parenteses em funcao
    if (/\w\s+\(/.test(trimmedLine) && !/^(if|while|for|return|switch)\s/.test(trimmedLine.trim())) {
      errors.push({
        line: lineNum,
        rule: "SPACE_BEFORE_PAREN",
        message: "Nao use espaco antes do parentese em chamada de funcao.",
        severity: "warning"
      })
    }
    
    // Regra: return sem parenteses
    if (/return\s+[^(]/.test(trimmedLine) && !trimmedLine.includes("return ;")) {
      errors.push({
        line: lineNum,
        rule: "RETURN_PAREN",
        message: "Use parenteses no return: return (valor);",
        severity: "error"
      })
    }
    
    // Regra: Chave na mesma linha que if/while/for
    if (/(if|while|for)\s*\(.*\)\s*\{/.test(trimmedLine)) {
      errors.push({
        line: lineNum,
        rule: "BRACE_NEWLINE",
        message: "A chave { deve estar na linha seguinte.",
        severity: "error"
      })
    }
    
    // Regra: Funcoes proibidas
    const forbiddenFuncs = ["printf", "puts", "scanf", "gets", "atoi", "strlen", "strcpy", "strcat", "strcmp"]
    forbiddenFuncs.forEach(func => {
      const regex = new RegExp(`\\b${func}\\s*\\(`)
      if (regex.test(trimmedLine) && !trimmedLine.includes(`ft_${func}`)) {
        // Ignorar se estiver em comentario
        if (!trimmedLine.trim().startsWith("//") && !trimmedLine.trim().startsWith("*")) {
          errors.push({
            line: lineNum,
            rule: "FORBIDDEN_FUNC",
            message: `Funcao proibida: ${func}. Use ft_${func} ou write.`,
            severity: "warning"
          })
        }
      }
    })
    
    lastNonEmptyLine = trimmedLine || lastNonEmptyLine
  })
  
  // Regra: Arquivo deve terminar com nova linha
  if (code.length > 0 && !code.endsWith("\n")) {
    errors.push({
      line: lines.length,
      rule: "NEWLINE_EOF",
      message: "Arquivo deve terminar com uma nova linha.",
      severity: "warning"
    })
  }
  
  return errors
}

// Formata erros para exibicao no terminal
export function formatNorminetteOutput(errors: NorminetteError[]): string[] {
  if (errors.length === 0) {
    return ["OK!"]
  }
  
  return errors.map(err => 
    `${err.severity === "error" ? "Error" : "Warning"}: ${err.rule} (line ${err.line}): ${err.message}`
  )
}

// Verifica se codigo passa nas regras basicas
export function passesNorminette(code: string): boolean {
  const errors = validateNorminette(code)
  return errors.filter(e => e.severity === "error").length === 0
}
