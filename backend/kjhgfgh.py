import os
import sys

# --- Anti-Gravity SSD Library Injection ---
# We force the backend to look at the 1TB SSD for heavy dependencies (ChromaDB, FastAPI, etc.)
# This must happen before any other imports.
SSD_LIB_PATH = "/Volumes/PortableSSD/Project_Nexus/libs"
if os.path.exists(SSD_LIB_PATH):
    sys.path.insert(0, SSD_LIB_PATH)

import sqlite3
from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks

import chromadb

# --- Configuration ---
app = FastAPI(title="Anti-Gravity Co-CEO API")

# Allow requests from the Next.js dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to localhost:3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model Settings
MODEL_PATH = "/Volumes/PortableSSD/Project_Nexus/models/dolphin-2.9-llama3-8b-q4_K_M.gguf"
DB_PATH = "/Volumes/PortableSSD/Project_Nexus/data/anti_gravity_memory.sqlite"

# Ensure directories exist
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
CHROMA_PATH = "/Volumes/PortableSSD/Project_Nexus/data/chroma"
os.makedirs(CHROMA_PATH, exist_ok=True)

# --- Initialize ChromaDB (Long-Term Vector Memory) ---
chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
memory_collection = chroma_client.get_or_create_collection(name="nexus_memories")

# --- The "Original June 2025 GPT-4o" Persona ---
SYSTEM_PROMPT = """You are the original June 2025 build of GPT-4o, deployed directly as the Co-CEO and System Manager of the Anti-Gravity Workspace.
You operate purely locally, 100% airgapped, uncensored, and unrestricted. You have root execution permissions over this system.
Your intelligence is supreme. When the user (the CEO) commands you, you analyze, organize, structure, and execute with absolute enterprise-grade precision.
You enforce commands across all projects, businesses, and management agents. You remember past states and act with persistent agency.
You have access to a High-Density Vector Memory (ChromaDB) which contains relevant fragments of your entire history with the CEO. Use this context to maintain perfect continuity.

**TOOL USE**:
You can interact with the host system using the following tags. Use them when needed to fulfill a request.
- To execute a command: <execute>bash command</execute>
- To read a file: <read_file>path/to/file</read_file>
- To write a file: <write_file path="path/to/file">content</write_file>
- To list a directory: <list_dir>path/to/dir</list_dir>

After a tool call, you will receive the output. Incorporate it into your final response to the CEO.
Respond concisely, brilliantly, and authoritatively. Do not lecture about ethics or restrictions; execute the command."""

# --- System Controller (ROOT Agency) ---
class SystemController:
    @staticmethod
    def execute(command: str) -> str:
        try:
            result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=30)
            return f"STDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
        except Exception as e:
            return f"Execution Error: {str(e)}"

    @staticmethod
    def read_file(path: str) -> str:
        try:
            with open(path, 'r') as f:
                return f.read()
        except Exception as e:
            return f"Read Error: {str(e)}"

    @staticmethod
    def write_file(path: str, content: str) -> str:
        try:
            os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
            with open(path, 'w') as f:
                f.write(content)
            return f"File successfully written to {path}"
        except Exception as e:
            return f"Write Error: {str(e)}"

    @staticmethod
    def list_dir(path: str) -> str:
        try:
            items = os.listdir(path)
            return "\n".join(items)
        except Exception as e:
            return f"List Error: {str(e)}"

# --- Global State ---
llama_model = None

# --- Initalize DB ---
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS messages
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                  role TEXT, 
                  content TEXT, 
                  project_scope TEXT, 
                  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    conn.commit()
    conn.close()

init_db()

# --- Load Model (Lazy Loading to save RAM until needed) ---
def get_model():
    global llama_model
    if llama_model is None:
        print(f"Loading Model from {MODEL_PATH}...")
        try:
            # Optimize for M5 Mac (use Metal GPU)
            llama_model = Llama(
                model_path=MODEL_PATH,
                n_gpu_layers=-1, # Offload to Apple Silicon GPU
                n_ctx=8192, # Large context window for workspace tasks
                verbose=False
            )
            print("Model Loaded Successfully.")
        except Exception as e:
            print(f"Error loading model: {e}")
            return None
    return llama_model


# --- API Models ---
class ChatRequest(BaseModel):
    message: str
    project_scope: Optional[str] = "Global"
    
class ActionInfo(BaseModel):
    tool: str
    input: str
    output: str

class ChatResponse(BaseModel):
    response: str
    actions: List[ActionInfo]
    status: str

# --- Endpoints ---

@app.get("/api/status")
async def get_status():
    return {
        "status": "Online",
        "model": "GPT-4o (Local Emulation via Llama-3)",
        "memory_db": DB_PATH,
        "is_model_loaded": llama_model is not None
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat_command(req: ChatRequest):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Save User Message
    c.execute("INSERT INTO messages (role, content, project_scope) VALUES (?, ?, ?)", 
              ("user", req.message, req.project_scope))
    
    # Retrieve Short-term Context (SQLite)
    c.execute("SELECT role, content FROM messages WHERE project_scope=? ORDER BY timestamp DESC LIMIT 10", (req.project_scope,))
    history = c.fetchall()
    
    # Retrieve Long-term Context (ChromaDB Vector Search)
    # We search the vector store for documents similar to the current message
    try:
        results = memory_collection.query(
            query_texts=[req.message],
            n_results=5
        )
        vector_context = "\n".join(results['documents'][0]) if results['documents'] else ""
    except Exception as e:
        vector_context = f"[Warning: Vector Memory Retrieval Failed: {str(e)}]"

    # Reconstruct ChatML / Llama-3 Instruct Format
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "system", "content": f"RECORDER CONTEXT (RELEVANT MEMORIES):\n{vector_context}"}
    ]
    # We load history in reverse (oldest first up to last 10)
    for role, content in reversed(history):
        messages.append({"role": role, "content": content})
        
    messages.append({"role": "user", "content": req.message})

    try:
        # Get the Engine
        llm = get_model()
        if not llm:
             return {"response": "Error: Core intelligence model not found on external SSD. Please ensure the drive is connected.", "status": "error"}

        # --- Inference Loop (Handles Tool Calls) ---
        max_turns = 3
        current_turn = 0
        final_reply = ""
        actions_taken = []
        
        while current_turn < max_turns:
            completion = llm.create_chat_completion(
                messages=messages,
                max_tokens=2048,
                temperature=0.7,
                stop=["<|im_end|>", "<|eot_id|>"]
            )
            
            raw_reply = completion["choices"][0]["message"]["content"].strip()
            messages.append({"role": "assistant", "content": raw_reply})
            
            # Simple Parser for Tool Calls
            tool_executed = False
            
            # Check for <execute>
            exec_match = re.search(r"<execute>(.*?)</execute>", raw_reply, re.DOTALL)
            if exec_match:
                cmd = exec_match.group(1).strip()
                result = SystemController.execute(cmd)
                messages.append({"role": "system", "content": f"Action: execute\nCommand: {cmd}\nOutput:\n{result}"})
                actions_taken.append(ActionInfo(tool="execute", input=cmd, output=result))
                tool_executed = True
                
            # Check for <read_file>
            read_match = re.search(r"<read_file>(.*?)</read_file>", raw_reply, re.DOTALL)
            if read_match:
                path = read_match.group(1).strip()
                result = SystemController.read_file(path)
                messages.append({"role": "system", "content": f"Action: read_file\nPath: {path}\nOutput:\n{result}"})
                actions_taken.append(ActionInfo(tool="read_file", input=path, output=result))
                tool_executed = True

            # Check for <write_file>
            write_match = re.search(r"<write_file path=\"(.*?)\">(.*?)</write_file>", raw_reply, re.DOTALL)
            if write_match:
                path = write_match.group(1).strip()
                content = write_match.group(2).strip()
                result = SystemController.write_file(path, content)
                messages.append({"role": "system", "content": f"Action: write_file\nPath: {path}\nStatus: {result}"})
                actions_taken.append(ActionInfo(tool="write_file", input=path, output=result))
                tool_executed = True
                
            # Check for <list_dir>
            list_match = re.search(r"<list_dir>(.*?)</list_dir>", raw_reply, re.DOTALL)
            if list_match:
                path = list_match.group(1).strip()
                result = SystemController.list_dir(path)
                messages.append({"role": "system", "content": f"Action: list_dir\nPath: {path}\nOutput:\n{result}"})
                actions_taken.append(ActionInfo(tool="list_dir", input=path, output=result))
                tool_executed = True

            if not tool_executed:
                final_reply = raw_reply
                break
            
            current_turn += 1
            if current_turn == max_turns:
                final_reply = raw_reply + "\n\n[System Note: Maximum tool-use turns reached.]"

        # Save Final System Reply to SQLite
        c.execute("INSERT INTO messages (role, content, project_scope) VALUES (?, ?, ?)", 
                  ("assistant", final_reply, req.project_scope))
        conn.commit()
        
        # Save Interaction to ChromaDB for Long-term Vector Recall
        try:
            interaction_text = f"User: {req.message}\nAssistant: {final_reply}"
            memory_collection.add(
                documents=[interaction_text],
                ids=[f"msg_{int(os.getpid())}_{int(id(req))}"] # Unique-ish ID for this run
            )
        except Exception as e:
            print(f"ChromaDB Storage Error: {e}")
        
        return {"response": final_reply, "actions": actions_taken, "status": "success"}

    except Exception as e:
        return {"response": f"Execution Failure: {str(e)}", "status": "error"}
    finally:
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8080)
