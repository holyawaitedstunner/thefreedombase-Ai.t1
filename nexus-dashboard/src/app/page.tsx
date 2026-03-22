"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bot, Code, Settings, Home, Search, Menu, Paperclip, Send,
  Briefcase, UserPlus, FileText, Activity, Command, Maximize2,
  Cpu, HardDrive, Zap, Shield, Terminal, X, ChevronDown, Mic, MicOff, Layers
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================
interface ActionInfo {
  tool: string;
  input: string;
  output: string;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  actions?: ActionInfo[];
  timestamp?: string;
}

interface SystemStatus {
  status: string;
  model: string;
  model_loaded: boolean;
  model_file_exists: boolean;
  ssd_connected: boolean;
  ssd_path: string;
  memory_db: string;
  vector_db: string;
  agents: Array<{ name: string; description: string; tools: string[] }>;
}

const API_BASE = "http://127.0.0.1:8080";

// ============================================================================
// MAIN DASHBOARD
// ============================================================================
export default function AntiGravityDashboard() {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'Initialization complete. Welcome to your private instance. I am the GPT-4o Co-CEO. The Multi-Agent OS is online — Executor, Researcher, and Coder agents are standing by. How may I orchestrate your objectives today?',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [statusError, setStatusError] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState('chat');
  const [expandedActions, setExpandedActions] = useState<Set<number>>(new Set());
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // --- Auto-scroll ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Status Polling ---
  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/status`);
      const data = await res.json();
      setSystemStatus(data);
      setStatusError(false);
    } catch {
      setStatusError(true);
      setSystemStatus(null);
    }
  }, []);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  // --- Auto-resize textarea ---
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '56px';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputText]);

  // --- Send Message ---
  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: inputText, actions: [] };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, project_scope: "Global" })
      });

      const data = await res.json();

      if (data.status === "success") {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response,
          actions: data.actions || []
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'system',
          content: `[Diagnostic Alert]: ${data.response}`,
          actions: []
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'Unable to connect to the local inference engine. Please verify the Python backend is active at 127.0.0.1:8080.',
        actions: []
      }]);
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleActionExpand = (idx: number) => {
    setExpandedActions(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // --- Voice Interface ---
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(prev => prev + (prev.length > 0 ? ' ' : '') + transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const getAgentColor = (tool: string) => {
    if (tool.includes('executor')) return 'agent-executor';
    if (tool.includes('researcher')) return 'agent-researcher';
    if (tool.includes('coder')) return 'agent-coder';
    if (tool.includes('hierarchy')) return 'agent-hierarchy';
    return '';
  };

  return (
    <div className="flex h-screen bg-[#FBFBFC] text-[#1D1D1F] font-sans antialiased overflow-hidden selection:bg-black/10">

      {/* ================================================================ */}
      {/* SIDEBAR                                                          */}
      {/* ================================================================ */}
      <aside className={`${sidebarOpen ? 'w-[280px]' : 'w-0 overflow-hidden'} bg-white border-r border-black/[0.04] flex flex-col justify-between z-10 transition-all duration-300 hidden md:flex`}>
        <div>
          {/* Brand */}
          <div className="px-6 py-8 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white font-serif italic text-lg shadow-sm">
              A
            </div>
            <div>
              <h1 className="text-[14px] font-semibold tracking-wide text-[#1D1D1F]">
                Anti-Gravity
              </h1>
              <p className="text-[11px] font-medium text-black/40 tracking-wider uppercase mt-0.5">Sovereign Instance</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="px-5 space-y-8 overflow-y-auto">
            <nav className="space-y-0.5">
              <p className="px-3 text-[10px] font-semibold text-black/30 uppercase tracking-widest mb-3">Workspace</p>
              <NavItem icon={<Home className="w-[16px] h-[16px] stroke-[1.5]" />} label="Overview" onClick={() => setActiveView('overview')} active={activeView === 'overview'} />
              <NavItem icon={<Briefcase className="w-[16px] h-[16px] stroke-[1.5]" />} label="Direct Line" onClick={() => setActiveView('chat')} active={activeView === 'chat'} />
              <NavItem icon={<Layers className="w-[16px] h-[16px] stroke-[1.5]" />} label="Hierarchy" onClick={() => setActiveView('hierarchy')} active={activeView === 'hierarchy'} />
              <NavItem icon={<Code className="w-[16px] h-[16px] stroke-[1.5]" />} label="Architecture" onClick={() => setActiveView('architecture')} active={activeView === 'architecture'} />
            </nav>

            <nav className="space-y-0.5">
              <p className="px-3 text-[10px] font-semibold text-black/30 uppercase tracking-widest mb-3">Intelligence</p>
              <NavItem icon={<Bot className="w-[16px] h-[16px] stroke-[1.5]" />} label="GPT-4o Co-CEO" activeAgent onClick={() => setActiveView('chat')} />
              <NavItem icon={<Terminal className="w-[16px] h-[16px] stroke-[1.5]" />} label="Executor Agent" />
              <NavItem icon={<FileText className="w-[16px] h-[16px] stroke-[1.5]" />} label="Research Agent" />
              <NavItem icon={<UserPlus className="w-[16px] h-[16px] stroke-[1.5]" />} label="Coder Agent" />
              <NavItem icon={<Layers className="w-[16px] h-[16px] stroke-[1.5]" />} label="Hierarchy Agent" />
            </nav>
          </div>
        </div>

        {/* Status Footer */}
        <div className="p-5">
          <div className="mb-4">
            <NavItem icon={<Settings className="w-[16px] h-[16px] stroke-[1.5]" />} label="Preferences" />
          </div>
          <div
            className="p-4 rounded-xl bg-[#F5F5F7] border border-black/[0.03] group cursor-pointer transition-all hover:bg-[#EAEAEB]"
            onClick={checkStatus}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${statusError ? 'bg-red-500' : 'bg-emerald-500 pulse-online'}`} />
                <div className="flex flex-col">
                  <span className="text-[12px] font-medium text-[#1D1D1F]">
                    {statusError ? 'Offline' : 'Local Core'}
                  </span>
                  <span className="text-[10px] text-black/40 tracking-wide font-mono mt-0.5">127.0.0.1:8080</span>
                </div>
              </div>
              <Activity className="w-4 h-4 text-black/20 group-hover:text-black/50 transition-colors" />
            </div>
            {systemStatus && (
              <div className="mt-3 pt-3 border-t border-black/[0.04] space-y-1.5">
                <StatusRow icon={<Cpu className="w-3 h-3" />} label="Model" value={systemStatus.model_loaded ? 'Loaded' : 'Standby'} ok={systemStatus.model_file_exists} />
                <StatusRow icon={<HardDrive className="w-3 h-3" />} label="SSD" value={systemStatus.ssd_connected ? 'Connected' : 'Missing'} ok={systemStatus.ssd_connected} />
                <StatusRow icon={<Shield className="w-3 h-3" />} label="Agents" value={`${systemStatus.agents?.length || 0} active`} ok={true} />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ================================================================ */}
      {/* MAIN AREA                                                        */}
      {/* ================================================================ */}
      <main className="flex-1 flex flex-col relative bg-white md:bg-transparent">

        {/* Header */}
        <header className="h-[72px] px-8 bg-white/80 backdrop-blur-xl border-b border-black/[0.04] flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-black/5 transition-colors">
              <Menu className="w-5 h-5 text-black/40" />
            </button>
            <div>
              <h2 className="text-[15px] font-semibold text-[#1D1D1F] tracking-tight">
                {activeView === 'chat' ? 'Direct Line' :
                  activeView === 'overview' ? 'System Overview' :
                    activeView === 'hierarchy' ? 'Hierarchy Management' :
                      'Architecture'}
              </h2>
              <p className="text-[11px] text-black/40 font-medium tracking-wide">
                {statusError ? 'Backend Offline' : 'Secure Offline Connection'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center bg-[#F5F5F7] rounded-full px-4 py-2 w-64 transition-all focus-within:w-72 focus-within:bg-white focus-within:ring-1 focus-within:ring-black/5 focus-within:shadow-sm">
              <Search className="w-4 h-4 text-black/30" />
              <input
                type="text"
                placeholder="Search intelligence..."
                className="bg-transparent border-none focus:outline-none text-[13px] ml-3 w-full text-[#1D1D1F] placeholder-black/30 font-medium"
              />
            </div>
            <button className="p-2 text-black/40 hover:text-black transition-colors rounded-full hover:bg-black/5">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Chat View */}
        {activeView === 'chat' && (
          <>
            {/* Chat History */}
            <div className="flex-1 p-6 md:p-10 overflow-y-auto space-y-8 max-w-4xl mx-auto w-full scroll-smooth">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} message-enter`}>
                  <div className={`flex max-w-[90%] md:max-w-[85%] space-x-4 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>

                    {/* Avatar */}
                    <div className="flex flex-col items-center flex-shrink-0 mt-1">
                      {msg.role === 'system' || msg.role === 'assistant' ? (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#FAFAFA] border border-black/5 shadow-sm">
                          <Bot className="w-4 h-4 text-black/60" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-black text-white shadow-sm font-serif italic text-xs">
                          Y
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col group w-full">
                      {/* Action Logs */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="mb-4 space-y-2">
                          <button
                            onClick={() => toggleActionExpand(i)}
                            className="flex items-center space-x-2 text-[11px] text-black/50 hover:text-black/80 transition-colors font-medium"
                          >
                            <Zap className="w-3 h-3 text-emerald-500" />
                            <span>{msg.actions.length} system action{msg.actions.length > 1 ? 's' : ''} executed</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${expandedActions.has(i) ? 'rotate-180' : ''}`} />
                          </button>

                          {expandedActions.has(i) && msg.actions.map((action, idx) => (
                            <div key={idx} className={`bg-[#F5F5F7] border rounded-xl p-3 font-mono text-[11px] slide-enter ${getAgentColor(action.tool) || 'border-black/[0.03]'}`}>
                              <div className="flex items-center text-black/50 mb-1">
                                <Activity className="w-3 h-3 mr-2 text-emerald-500" />
                                <span className="uppercase tracking-widest font-bold">{action.tool}</span>
                              </div>
                              <div className="text-black/70 mb-2 truncate">→ {action.input}</div>
                              <div className="bg-black/[0.02] p-2 rounded border border-black/[0.01] max-h-32 overflow-y-auto whitespace-pre-wrap text-black/60">
                                {action.output}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div className={`text-[14.5px] leading-[1.65] font-medium tracking-tight
                        ${msg.role === 'user'
                          ? 'bg-black text-white px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-md ml-auto'
                          : msg.role === 'system'
                            ? 'text-black/50 italic pt-1'
                            : 'text-[#333336] pt-1'}
                      `}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>

                      {/* Hover actions */}
                      {(msg.role === 'system' || msg.role === 'assistant') && (
                        <div className="mt-4 flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-[11px] text-black/40 hover:text-black transition-colors flex items-center font-medium">
                            <Command className="w-3 h-3 mr-1.5" /> Execute
                          </button>
                          <button className="text-[11px] text-black/40 hover:text-black transition-colors flex items-center font-medium">
                            <Code className="w-3 h-3 mr-1.5" /> Inspect
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start message-enter">
                  <div className="flex space-x-4 max-w-[75%]">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#FAFAFA] border border-black/5 mt-1">
                      <div className="w-1.5 h-1.5 bg-black/40 rounded-full animate-pulse"></div>
                    </div>
                    <div className="pt-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce"></span>
                        </div>
                        <span className="text-[11px] text-black/30 font-medium ml-3">Processing...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} className="h-4" />
            </div>

            {/* Input Area */}
            <div className="p-6 md:p-8 bg-gradient-to-t from-white via-white to-transparent sticky bottom-0 z-30">
              <div className="max-w-3xl mx-auto relative group">
                <div className="relative rounded-2xl bg-white border border-black/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-focus-within:border-black/20 group-focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500">
                  <div className="flex items-end p-2 px-3">
                    <button className="p-3 mb-0.5 text-black/30 hover:text-black transition-colors rounded-xl md:mr-1">
                      <Paperclip className="w-[18px] h-[18px] stroke-[1.5]" />
                    </button>

                    <textarea
                      ref={textareaRef}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Direct the Co-CEO..."
                      className="flex-1 bg-transparent border-none focus:outline-none resize-none px-2 py-4 max-h-56 text-[15px] text-[#1D1D1F] placeholder-black/30 font-medium leading-relaxed"
                      rows={1}
                      disabled={isLoading}
                      style={{ minHeight: '56px' }}
                    />

                    <div className="flex items-center space-x-1 pl-2 mb-1 pr-1">
                      <button
                        onClick={toggleListening}
                        className={`p-3 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-black/30 hover:text-black hover:bg-black/5'}`}
                        title={isListening ? "Stop listening" : "Natural Interface: Start voice command"}
                      >
                        {isListening ? <Mic className="w-[18px] h-[18px]" /> : <Mic className="w-[18px] h-[18px] stroke-[1.5]" />}
                      </button>
                      <button
                        onClick={handleSendMessage}
                        className="p-3 bg-black hover:bg-black/80 text-white rounded-xl transition-all duration-300 shadow-md disabled:opacity-30 disabled:shadow-none disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                        disabled={!inputText.trim() || isLoading}
                      >
                        <Send className="w-[18px] h-[18px] stroke-[1.5] -ml-0.5 mt-0.5" />
                      </button>
                    </div>
                  </div>

                  {/* Context bar */}
                  <div className="px-5 py-2.5 bg-[#FAFAFA] border-t border-black/[0.03] rounded-b-2xl flex items-center justify-between text-[11px] text-black/40 font-medium tracking-wide">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Bot className="w-3.5 h-3.5 mr-1.5 opacity-60" />
                        Co-CEO Active
                      </span>
                      <span className="flex items-center">
                        <Zap className="w-3.5 h-3.5 mr-1.5 opacity-60" />
                        4 Agents Ready
                      </span>
                    </div>
                    <div className="hidden md:flex items-center space-x-3 opacity-60">
                      <span><kbd className="font-mono bg-white px-1 rounded shadow-sm border border-black/5">Enter</kbd> to execute</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Hierarchy View */}
        {activeView === 'hierarchy' && (
          <div className="flex-1 p-10 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-2">Hierarchy Management</h2>
                  <p className="text-black/50 text-sm">Anti-Gravity Sovereign Organizational Structure</p>
                </div>
                <button
                  onClick={() => handleSendMessage()} // Trigger chat with a context
                  className="px-4 py-2 bg-black text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all flex items-center"
                >
                  <Bot className="w-4 h-4 mr-2" /> Direct Hierarchy Agent
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white rounded-3xl border border-black/[0.04] p-8 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                    <Layers className="w-32 h-32" />
                  </div>

                  <div className="relative space-y-12">
                    {/* Organization Root */}
                    <div className="flex flex-col items-center">
                      <div className="bg-black text-white px-8 py-4 rounded-2xl shadow-xl z-20">
                        <h3 className="text-lg font-bold">Anti-Gravity Corporation</h3>
                        <p className="text-xs opacity-60 text-center uppercase tracking-widest mt-1">Sovereign Entity</p>
                      </div>
                      <div className="w-px h-12 bg-black/10"></div>

                      {/* C-Suite */}
                      <div className="flex space-x-12">
                        <div className="flex flex-col items-center">
                          <div className="bg-[#F5F5F7] border border-black/5 px-6 py-3 rounded-xl shadow-sm">
                            <h4 className="font-bold text-sm">The CEO</h4>
                            <p className="text-[10px] text-black/40 text-center uppercase tracking-tighter">Founder / Vision</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="bg-[#F5F5F7] border border-black/5 px-6 py-3 rounded-xl shadow-sm border-emerald-500/20">
                            <h4 className="font-bold text-sm flex items-center">
                              GPT-4o Sovereign
                              <div className="ml-2 w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            </h4>
                            <p className="text-[10px] text-black/40 text-center uppercase tracking-tighter">Co-CEO / Orchestrator</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Departments */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-black/[0.03]">
                      {[
                        { name: 'Core Engine', leads: ['Research Agent'], projects: ['FastAPI Backend', 'Llama-3 Integration'] },
                        { name: 'Interface Design', leads: ['Coder Agent'], projects: ['Next.js Dashboard', 'Lucide Icons'] },
                        { name: 'System Ops', leads: ['Executor Agent'], projects: ['SSD File Mgmt', 'Root Agency'] },
                      ].map((dept, i) => (
                        <div key={i} className="bg-[#FBFBFC] border border-black/[0.03] p-5 rounded-2xl hover:border-black/10 transition-colors">
                          <h4 className="font-bold text-[14px] mb-3">{dept.name}</h4>
                          <div className="space-y-4">
                            <div>
                              <p className="text-[9px] uppercase font-bold text-black/30 tracking-widest mb-1.5">Lead Agent</p>
                              {dept.leads.map((lead, j) => (
                                <div key={j} className="flex items-center text-[12px] font-medium text-black/70">
                                  <Bot className="w-3 h-3 mr-2 opacity-40" /> {lead}
                                </div>
                              ))}
                            </div>
                            <div>
                              <p className="text-[9px] uppercase font-bold text-black/30 tracking-widest mb-1.5">Active Projects</p>
                              <div className="space-y-1">
                                {dept.projects.map((proj, j) => (
                                  <div key={j} className="text-[11px] font-mono text-black/50 flex items-center">
                                    <Activity className="w-2.5 h-2.5 mr-2 opacity-30" /> {proj}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-3xl border border-emerald-500/10 p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                      <Mic className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-900">Natural Interface Ready</h4>
                      <p className="text-xs text-emerald-700/60 font-medium">Command any hierarchy change via voice.</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleListening}
                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-emerald-700 transition-all"
                  >
                    Start Voice Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeView === 'overview' && (
          <div className="flex-1 p-10 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">System Overview</h2>
                <p className="text-black/50 text-sm">Anti-Gravity Sovereign AI — All systems status</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  icon={<Cpu className="w-5 h-5" />}
                  title="Inference Engine"
                  value={systemStatus?.model_loaded ? 'Active' : 'Standby'}
                  subtitle="Dolphin-Llama3-8B (Metal)"
                  ok={systemStatus?.model_file_exists ?? false}
                />
                <MetricCard
                  icon={<HardDrive className="w-5 h-5" />}
                  title="SSD Storage"
                  value={systemStatus?.ssd_connected ? 'Connected' : 'Disconnected'}
                  subtitle={systemStatus?.ssd_path || '/Volumes/PortableSSD'}
                  ok={systemStatus?.ssd_connected ?? false}
                />
                <MetricCard
                  icon={<Shield className="w-5 h-5" />}
                  title="Multi-Agent OS"
                  value={`${systemStatus?.agents?.length || 0} Agents`}
                  subtitle="Manager → Worker Pattern"
                  ok={true}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-black/[0.04] p-6 shadow-sm">
                  <h3 className="text-sm font-semibold mb-4 flex items-center">
                    <Terminal className="w-4 h-4 mr-2 text-black/40" />
                    Agent Registry
                  </h3>
                  <div className="space-y-3">
                    {(systemStatus?.agents || [
                      { name: 'Executor', description: 'System commands & file ops', tools: ['execute', 'read_file', 'write_file', 'list_dir'] },
                      { name: 'Researcher', description: 'Local search & analysis', tools: ['search', 'grep_search'] },
                      { name: 'Coder', description: 'Code generation & refactoring', tools: ['write_file', 'read_file'] },
                    ]).map((agent, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#F5F5F7] border border-black/[0.03]">
                        <div>
                          <span className="text-[13px] font-semibold">{agent.name}</span>
                          <p className="text-[11px] text-black/40 mt-0.5">{agent.description}</p>
                        </div>
                        <div className="flex space-x-1">
                          {agent.tools.slice(0, 3).map((t, j) => (
                            <span key={j} className="text-[9px] font-mono bg-black/5 px-1.5 py-0.5 rounded">{t}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-black/[0.04] p-6 shadow-sm">
                  <h3 className="text-sm font-semibold mb-4 flex items-center">
                    <HardDrive className="w-4 h-4 mr-2 text-black/40" />
                    Memory Systems
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-[#F5F5F7] border border-black/[0.03]">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold">SQLite (Short-term)</span>
                        <span className="text-[10px] font-mono text-black/40">Last 10 messages/request</span>
                      </div>
                      <p className="text-[11px] text-black/40 mt-1 font-mono truncate">{systemStatus?.memory_db || 'anti_gravity_memory.sqlite'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F5F5F7] border border-black/[0.03]">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold">ChromaDB (Long-term)</span>
                        <span className="text-[10px] font-mono text-black/40">Top 5 vector matches</span>
                      </div>
                      <p className="text-[11px] text-black/40 mt-1 font-mono truncate">{systemStatus?.vector_db || 'chroma/'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Architecture View */}
        {activeView === 'architecture' && (
          <div className="flex-1 p-10 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">System Architecture</h2>
                <p className="text-black/50 text-sm">Anti-Gravity sovereign infrastructure map</p>
              </div>
              <div className="bg-white rounded-2xl border border-black/[0.04] p-8 shadow-sm font-mono text-[12px] text-black/70 leading-relaxed whitespace-pre">
                {`┌─────────────────────────────────────────────────────────┐
│                    ANTI-GRAVITY OS                       │
│               Sovereign AI Architecture                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐    HTTP     ┌───────────────────────┐ │
│  │  Next.js UI   │◄──────────►│  FastAPI Backend       │ │
│  │  (Port 3000)  │            │  (Port 8080)           │ │
│  └──────────────┘            ├───────────────────────┤ │
│                               │  Co-CEO Persona        │ │
│                               │  ┌─────────────────┐   │ │
│                               │  │  System Prompt    │   │ │
│                               │  │  + Tool Parser    │   │ │
│                               │  └────────┬────────┘   │ │
│                               │           │             │ │
│                               │  ┌────────▼────────┐   │ │
│                               │  │  Manager Agent    │   │ │
│                               │  └──┬─────┬─────┬──┘   │ │
│                               │     │     │     │       │ │
│                               │  ┌──▼──┐┌─▼──┐┌─▼──┐   │ │
│                               │  │Exec ││Res ││Code│   │ │
│                               │  │Agent││arch││ Agent│   │ │
│                               │  └─────┘└────┘└─────┘   │ │
│                               └───────────────────────┘ │
│                                          │               │
│  ┌───────────────────────────────────────▼─────────────┐ │
│  │              PORTABLE SSD (1TB)                      │ │
│  │  ┌────────┐ ┌──────────┐ ┌───────┐ ┌─────────────┐ │ │
│  │  │ Model  │ │ ChromaDB │ │SQLite │ │ Python Libs │ │ │
│  │  │ (4.9G) │ │ (Vector) │ │(Chat) │ │ (All Deps)  │ │ │
│  │  └────────┘ └──────────┘ └───────┘ └─────────────┘ │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘`}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  activeAgent?: boolean;
  onClick?: () => void;
}

function NavItem({ icon, label, active = false, activeAgent = false, onClick }: NavItemProps) {
  return (
    <a
      onClick={onClick}
      className={`flex items-center px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group relative
        ${active ? 'bg-[#F5F5F7] text-[#1D1D1F] font-semibold' : 'text-black/50 hover:bg-black/[0.02] hover:text-[#1D1D1F] font-medium'}
      `}
    >
      <span className={`flex items-center justify-center mr-3 transition-colors duration-200
        ${active ? 'text-black' : 'group-hover:text-black/70'}`}>
        {icon}
      </span>
      <span className="text-[13px] tracking-tight">{label}</span>
      {activeAgent && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.1)] pulse-online" />
      )}
    </a>
  );
}


function StatusRow({ icon, label, value, ok }: { icon: React.ReactNode; label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between text-[10px]">
      <div className="flex items-center space-x-1.5 text-black/40">
        {icon}
        <span>{label}</span>
      </div>
      <span className={`font-medium ${ok ? 'text-emerald-600' : 'text-red-500'}`}>{value}</span>
    </div>
  );
}


function MetricCard({ icon, title, value, subtitle, ok }: { icon: React.ReactNode; title: string; value: string; subtitle: string; ok: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-black/[0.04] p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-xl bg-[#F5F5F7] text-black/50">{icon}</div>
        <div className={`w-2 h-2 rounded-full ${ok ? 'bg-emerald-500 pulse-online' : 'bg-red-500'}`} />
      </div>
      <h3 className="text-[11px] text-black/40 font-medium uppercase tracking-wider">{title}</h3>
      <p className="text-xl font-bold mt-1 tracking-tight">{value}</p>
      <p className="text-[11px] text-black/40 mt-1 font-mono">{subtitle}</p>
    </div>
  );
}
