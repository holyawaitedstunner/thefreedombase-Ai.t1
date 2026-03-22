a dashboa# Anti-Gravity Project Nexus

## Sovereign AI Co-CEO System

100% local. 100% airgapped. 100% sovereign.

### Quick Start

```bash
./start.sh
```

### Build & Set Up
```bash
chmod +x start.sh build.sh
./build.sh
```

### Manual Start

**Backend** (Terminal 1):
```bash
export SSD_BASE="/Volumes/PortableSSD/Project_Nexus"
export PYTHONPATH="$SSD_BASE/libs:$PYTHONPATH"
cd backend
python3 main.py
```

**Frontend** (Terminal 2):
```bash
cd nexus-dashboard
npm run dev
```

### Architecture

- **Frontend**: Next.js 16 + React 19 + TailwindCSS v4
- **Backend**: FastAPI (Python 3.12)
- **LLM**: Dolphin-2.9-Llama3-8B (4-bit quantized, Metal GPU)
- **Short-term Memory**: SQLite
- **Long-term Memory**: ChromaDB (Vector Store)
- **Multi-Agent OS**: Manager → Executor / Researcher / Coder / Hierarchy Manager
- **Natural Interface**: Web Speech API integration for 100% local voice commanding.

### Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/status` | GET | System health check |
| `/api/agents` | GET | List available agents |
| `/api/chat` | POST | Main chat interface |
| `/api/memory/search` | GET | Search vector memory |
| `/api/memory/history` | GET | Retrieve chat history |
