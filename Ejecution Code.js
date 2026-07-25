cat > instalar.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash

RESET='\033[0m'
BOLD='\033[1m'
CYAN='\033[36m'
GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'
MAGENTA='\033[35m'

URL_BOT="https://raw.githubusercontent.com/incognitoh39-eng/WhatsApp-Bot-backend/refs/heads/main/bot.js"
URL_INDEX="https://raw.githubusercontent.com/incognitoh39-eng/WhatsApp-Bot-backend/refs/heads/main/public/index.html"

spinner() {
  local pid=$1
  local mensaje=$2
  local delay=0.08
  local spinstr='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
  local i=0
  while kill -0 "$pid" 2>/dev/null; do
    i=$(( (i + 1) % 10 ))
    printf "\r${CYAN}%s${RESET} %s" "${spinstr:$i:1}" "$mensaje"
    sleep $delay
  done
  wait "$pid"
  return $?
}

paso_ok() { printf "\r${GREEN}✔${RESET} %s\n" "$1"; }
paso_error() { printf "\r${RED}✘${RESET} %s\n" "$1"; }

clear
echo -e "${MAGENTA}${BOLD}"
cat << "BANNER"
 __        __         _   _                          ____        _
 \ \      / /_ _  ___ | |_(_)_ __ ___   ___  __ _  __| __ )  ___ | |_
  \ \ /\ / / _` |/ _ \| __| | '_ ` _ \ / _ \/ _` |/ _|  _ \ / _ \| __|
   \ V  V / (_| | (_) | |_| | | | | | |  __/ (_| | (_| |_) | (_) | |_
    \_/\_/ \__,_|\___/ \__|_|_| |_| |_|\___|\__,_|\__|____/ \___/ \__|
BANNER
echo -e "${RESET}"
echo -e "${CYAN}Instalador del bot de WhatsApp + Groq${RESET}\n"

if [[ "$URL_BOT" == "PON_AQUI_TU_LINK_RAW_DE_bot.js" ]]; then
  echo -e "${RED}✘ Todavía no configuraste las URLs de descarga.${RESET}"
  echo -e "  Edita este script y reemplaza URL_BOT y URL_INDEX con tus links raw de GitHub."
  exit 1
fi

echo -e "${YELLOW}➤ Verificando Node.js...${RESET}"
if ! command -v node &> /dev/null; then
  paso_error "Node.js no está instalado"
  echo -e "  Instálalo con: ${BOLD}pkg install nodejs${RESET}"
  exit 1
fi
paso_ok "Node.js encontrado: $(node -v)"

echo -e "${YELLOW}➤ Verificando curl...${RESET}"
if ! command -v curl &> /dev/null; then
  paso_error "curl no está instalado"
  echo -e "  Instálalo con: ${BOLD}pkg install curl${RESET}"
  exit 1
fi
paso_ok "curl encontrado"
echo ""

mkdir -p public

( curl -sL "$URL_BOT" -o bot.js.tmp ) &
spinner $! "Descargando bot.js"
if [ ! -s bot.js.tmp ] || grep -q "404: Not Found" bot.js.tmp 2>/dev/null; then
  paso_error "No se pudo descargar bot.js (revisa la URL)"
  rm -f bot.js.tmp
  exit 1
fi
mv bot.js.tmp bot.js
paso_ok "bot.js descargado"

( curl -sL "$URL_INDEX" -o public/index.html.tmp ) &
spinner $! "Descargando public/index.html"
if [ ! -s public/index.html.tmp ] || grep -q "404: Not Found" public/index.html.tmp 2>/dev/null; then
  paso_error "No se pudo descargar index.html (revisa la URL)"
  rm -f public/index.html.tmp
  exit 1
fi
mv public/index.html.tmp public/index.html
paso_ok "public/index.html descargado"
echo ""

if [ ! -f package.json ]; then
  ( npm init -y > /dev/null 2>&1 ) &
  spinner $! "Inicializando proyecto npm"
  paso_ok "Proyecto npm inicializado"
fi

( npm install @whiskeysockets/baileys pino express > /dev/null 2>&1 ) &
spinner $! "Instalando dependencias (baileys, pino, express)"
paso_ok "Dependencias instaladas"

echo ""
echo -e "${GREEN}${BOLD}✅ ¡Instalación completa!${RESET}"
echo -e "${CYAN}Ejecuta el bot con:${RESET} ${BOLD}node bot.js${RESET}\n"
EOF
chmod +x instalar.sh
./instalar.sh
