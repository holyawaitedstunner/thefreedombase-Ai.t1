#!/bin/bash
# ============================================================================
# ANTI-GRAVITY CO-CEO — Sovereign Launch Script
# ============================================================================
# One-click launcher: starts both the Python backend and Next.js dashboard.
# Usage: ./start.sh
# ============================================================================

set -e

# --- Configuration ---
SSD_BASE="/Volumes/PortableSSD/Project_Nexus"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/nexus-dashboard"
PYTHON_BIN="$PROJECT_DIR/miniconda3/bin/python3"
LOG_DIR="$PROJECT_DIR/logs"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║          ANTI-GRAVITY CO-CEO — SOVEREIGN AI             ║"
echo "║          100% Local • 100% Airgapped • Metal GPU        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# --- Pre-flight Checks ---
echo -e "${BOLD}[PREFLIGHT]${NC} Running system checks..."

# Check SSD
if [ -d "$SSD_BASE" ]; then
    echo -e "  ${GREEN}✓${NC} SSD connected at $SSD_BASE"
else
    echo -e "  ${RED}✗${NC} SSD NOT FOUND at $SSD_BASE"
    echo -e "  ${YELLOW}→ Please connect your Portable SSD and try again.${NC}"
    exit 1
fi

# Check model file
MODEL_PATH="$SSD_BASE/models/dolphin-2.9-llama3-8b-q4_K_M.gguf"
if [ -f "$MODEL_PATH" ]; then
    MODEL_SIZE=$(du -h "$MODEL_PATH" | cut -f1)
    echo -e "  ${GREEN}✓${NC} Model found ($MODEL_SIZE)"
else
    echo -e "  ${RED}✗${NC} Model NOT FOUND: $MODEL_PATH"
    exit 1
fi

# Check Python
if [ -f "$PYTHON_BIN" ]; then
    PY_VERSION=$($PYTHON_BIN --version 2>&1)
    echo -e "  ${GREEN}✓${NC} Python: $PY_VERSION"
else
    echo -e "  ${YELLOW}!${NC} Local Python not found, falling back to system python3"
    PYTHON_BIN="python3"
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "  ${GREEN}✓${NC} Node.js: $NODE_VERSION"
else
    echo -e "  ${RED}✗${NC} Node.js not found. Please install Node.js."
    exit 1
fi

# Check libs
if [ -d "$SSD_BASE/libs" ]; then
    LIB_COUNT=$(ls "$SSD_BASE/libs" | wc -l | tr -d ' ')
    echo -e "  ${GREEN}✓${NC} SSD Libraries: $LIB_COUNT packages"
else
    echo -e "  ${RED}✗${NC} SSD Libraries not found at $SSD_BASE/libs"
    exit 1
fi

echo ""

# --- Create log directory ---
mkdir -p "$LOG_DIR"

# --- Export environment ---
export SSD_BASE="$SSD_BASE"
export PYTHONPATH="$SSD_BASE/libs:$PYTHONPATH"
export MODEL_PATH="$MODEL_PATH"

# --- Start Backend ---
echo -e "${BOLD}[LAUNCH]${NC} Starting Co-CEO Backend (FastAPI)..."
cd "$BACKEND_DIR"
$PYTHON_BIN main.py > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo -e "  ${GREEN}→${NC} Backend PID: $BACKEND_PID (port 8080)"

# Wait for backend to be ready
echo -ne "  ${YELLOW}Waiting for backend..."
for i in $(seq 1 30); do
    if curl -s http://127.0.0.1:8080/api/status > /dev/null 2>&1; then
        echo -e " ${GREEN}ONLINE${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# --- Start Frontend ---
echo -e "${BOLD}[LAUNCH]${NC} Starting Dashboard (Next.js)..."
cd "$FRONTEND_DIR"
npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo -e "  ${GREEN}→${NC} Frontend PID: $FRONTEND_PID (port 3000)"

# Wait for frontend
echo -ne "  ${YELLOW}Waiting for dashboard..."
for i in $(seq 1 20); do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e " ${GREEN}ONLINE${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗"
echo -e "║  ${GREEN}SYSTEM ONLINE${CYAN}                                         ║"
echo -e "║                                                          ║"
echo -e "║  Dashboard:  ${BOLD}http://localhost:3000${NC}${CYAN}                     ║"
echo -e "║  API:        ${BOLD}http://127.0.0.1:8080${NC}${CYAN}                     ║"
echo -e "║  API Docs:   ${BOLD}http://127.0.0.1:8080/docs${NC}${CYAN}                ║"
echo -e "║                                                          ║"
echo -e "║  Press ${BOLD}Ctrl+C${NC}${CYAN} to shutdown all services                 ║"
echo -e "╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# --- Graceful Shutdown ---
cleanup() {
    echo ""
    echo -e "${YELLOW}[SHUTDOWN]${NC} Stopping all services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}[SHUTDOWN]${NC} All services stopped. Sovereign session ended."
    exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script running
wait
