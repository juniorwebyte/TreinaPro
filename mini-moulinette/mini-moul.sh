#!/bin/bash

# ============================================================================
# MINI-MOULINETTE - Script de Inicializacao Robusto
# ============================================================================

# 1. Detectar o caminho real do script (independente de onde e chamado)
# Usamos readlink -f para resolver symlinks e obter o path absoluto
if [ -n "$BASH_SOURCE" ]; then
    SCRIPT_PATH="${BASH_SOURCE[0]}"
else
    SCRIPT_PATH="$0"
fi
MINI_MOUL_ROOT=$(cd "$(dirname "$SCRIPT_PATH")" && pwd)

# 2. Verificar se o ambiente esta correto
if [ ! -f "$MINI_MOUL_ROOT/mini-moul/config.sh" ]; then
    echo -e "\033[31mErro: Arquivo de configuracao nao encontrado em: $MINI_MOUL_ROOT/mini-moul/config.sh\033[0m"
    exit 1
fi

# 3. Carregar configuracoes e cores
source "$MINI_MOUL_ROOT/mini-moul/config.sh"

# 4. Variaveis globais de controle
assignment=NULL
ARG_PASSED=false

function handle_sigint {
  echo -e "\n${RED}Script interrompido pelo usuário. Limpando...${DEFAULT}"
  rm -rf ./mini-moul_tmp
  exit 1
}

# Funcao para detectar o modulo (C00, C01, etc)
detect_assignment() {
  # Se passou argumento (ex: mini C00)
  if [[ "$1" =~ ^C(0[0-9]|1[0-3])$ ]]; then
    assignment="$1"
    return 0
  fi
  
  # Se nao, tenta detectar pelo nome da pasta atual
  local current_dir=$(basename "$(pwd)")
  if [[ "$current_dir" =~ ^C(0[0-9]|1[0-3])$ ]]; then
    assignment="$current_dir"
    return 0
  fi
  
  return 1
}

run_norminette() {
  if command -v norminette &> /dev/null; then
    echo -e "${BLUE}Executando Norminette...${DEFAULT}"
    norminette
  else
    echo -e "${RED}Aviso: norminette nao encontrada. Pulando verificacao de estilo.${DEFAULT}"
  fi
}

# 5. Logica Principal
# Verifica se o primeiro argumento e um modulo (ex: C01) e se a pasta existe
if [[ "$1" =~ ^C(0[0-9]|1[0-3])$ ]] && [ -d "$1" ]; then
    echo -e "${BLUE}Entrando no diretorio $1...${DEFAULT}"
    cd "$1"
    ARG_PASSED=true
fi

if detect_assignment "$1"; then
  echo -e "${GREEN}Modulo detectado: ${assignment}${DEFAULT}"
  run_norminette
  
  # Criar ambiente de teste temporario
  # Copiamos a pasta de testes para o diretorio atual para que os paths relativos funcionem
  rm -rf ./mini-moul_tmp
  cp -rf "$MINI_MOUL_ROOT/mini-moul" ./mini-moul_tmp
  trap handle_sigint SIGINT
  
  # Executar o core da moulinette
  cd mini-moul_tmp
  if [ -f "./test.sh" ]; then
      bash "./test.sh" "$assignment"
  else
      echo -e "${RED}Erro: test.sh nao encontrado no core da moulinette.${DEFAULT}"
  fi
  
  # Limpeza
  cd ..
  rm -rf ./mini-moul_tmp
else
  echo -e "${RED}Erro: Diretorio atual ($(basename "$(pwd)")) ou argumento ($1) nao e um modulo valido (C00 a C13).${DEFAULT}"
  echo -e "${RED}Uso: 'mini [C00-C13]' ou execute 'mini' dentro da pasta do modulo.${DEFAULT}"
fi

# Retornar ao diretorio original se necessário
if [ "$ARG_PASSED" = true ]; then
    cd ..
fi
