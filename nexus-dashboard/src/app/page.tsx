"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bot, Code, Settings, Home, Mic, MicOff, Search, Menu, Paperclip, Send, Briefcase, UserPlus, FileText, ChevronRight, Activity, Command, MoreHorizontal, Maximize2 } from 'lucide-react';

export default function AntiGravityDashboard() {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Initialization complete. Welcome to your private instance. I am the GPT-4o Co-CEO. How may I orchestrate your objectives today?' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    
    const newMsg = { role: 'user', content: inputText, actions: [] };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8080/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMsg.content, project_scope: "Global" })
      });
      
      const data = await res.json();
      
      if (data.status === "success") {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.response, 
          actions: data.actions || [] 
        }]);
      } else {
        setMessages(prev => [...prev, { role: 'system', content: `[Diagnostic Alert]: ${data.response}`, actions: [] }]);
      }
    } catch (error) {
       setMessages(prev => [...prev, { role: 'system', content: `Unable to connect to the local inference engine. Please verify the Python backend is active at 127.0.0.1:8080.`, actions: [] }]);
    }
    
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-[#FBFBFC] text-[#1D1D1F] font-sans antialiased overflow-hidden selection:bg-black/10">
      
      {/* Sidebar - Quiet Luxury Aesthetic */}
      <aside className="w-[280px] bg-white border-r border-black/[0.04] flex flex-col justify-between z-10 hidden md:flex">
        <div>
          <div className="px-6 py-8 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-serif italic text-lg shadow-sm">
              A
            </div>
            <div>
              <h1 className="text-[14px] font-semibold tracking-wide text-[#1D1D1F]">
                Anti-Gravity
              </h1>
              <p className="text-[11px] font-medium text-black/40 tracking-wider uppercase mt-0.5">Private Instance</p>
            </div>
          </div>
          
          <div className="px-5 space-y-8 overflow-y-auto">
            <nav className="space-y-0.5">
              <p className="px-3 text-[10px] font-semibold text-black/30 uppercase tracking-widest mb-3">Workspace</p>
              <NavItem icon={<Home className="w-[16px] h-[16px] stroke-[1.5]" />} label="Overview" />
              <NavItem icon={<Briefcase className="w-[16px] h-[16px] stroke-[1.5]" />} label="Initiatives" active />
              <NavItem icon={<Code className="w-[16px] h-[16px] stroke-[1.5]" />} label="Architecture" />
            </nav>
            
            <nav className="space-y-0.5">
              <p className="px-3 text-[10px] font-semibold text-black/30 uppercase tracking-widest mb-3">Intelligence</p>
              <NavItem icon={<Bot className="w-[16px] h-[16px] stroke-[1.5]" />} label="GPT-4o Co-CEO" activeAgent />
              <NavItem icon={<FileText className="w-[16px] h-[16px] stroke-[1.5]" />} label="Research Analyst" />
              <NavItem icon={<UserPlus className="w-[16px] h-[16px] stroke-[1.5]" />} label="Executive Assistant" />
            </nav>
          </div>
        </div>

        <div className="p-5">
           <div className="mb-4">
               <NavItem icon={<Settings className="w-[16px] h-[16px] stroke-[1.5]" />} label="Preferences" />
           </div>
          <div className="p-4 rounded-xl bg-[#F5F5F7] border border-black/[0.03] flex items-center justify-between group cursor-pointer transition-all hover:bg-[#EAEAEB]">
            <div className="flex items-center space-x-3">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.1)]" />
               <div className="flex flex-col">
                  <span className="text-[12px] font-medium text-[#1D1D1F]">Local Core</span>
                  <span className="text-[10px] text-black/40 tracking-wide font-mono mt-0.5">127.0.0.1</span>
               </div>
            </div>
            <Activity className="w-4 h-4 text-black/20 group-hover:text-black/50 transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main Chat Interface */}
      <main className="flex-1 flex flex-col relative bg-white md:bg-transparent">
        
        {/* Header */}
        <header className="h-[72px] px-8 bg-white/80 backdrop-blur-xl border-b border-black/[0.04] flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <Menu className="w-5 h-5 text-black/40 md:hidden cursor-pointer" />
            <div>
              <h2 className="text-[15px] font-semibold text-[#1D1D1F] tracking-tight">
                Direct Line
              </h2>
              <p className="text-[11px] text-black/40 font-medium tracking-wide">Secure Offline Connection</p>
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

        {/* Chat History */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto space-y-10 max-w-4xl mx-auto w-full scroll-smooth">
          {messages.map((msg: any, i) => (
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

                {/* Message Content */}
                <div className="flex flex-col group w-full">
                  {/* Action Log (if any) */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mb-4 space-y-2">
                       {msg.actions.map((action: any, idx: number) => (
                         <div key={idx} className="bg-[#F5F5F7] border border-black/[0.03] rounded-xl p-3 font-mono text-[11px]">
                           <div className="flex items-center text-black/50 mb-1">
                             <Activity className="w-3 h-3 mr-2 text-emerald-500" />
                             <span className="uppercase tracking-widest font-bold">System {action.tool}</span>
                           </div>
                           <div className="text-black/70 mb-2 truncate">PATH: {action.input}</div>
                           <div className="bg-black/[0.02] p-2 rounded border border-black/[0.01] max-h-32 overflow-y-auto whitespace-pre-wrap text-black/60">
                             {action.output}
                           </div>
                         </div>
                       ))}
                    </div>
                  )}

                  <div className={`text-[14.5px] leading-[1.65] font-medium tracking-tight
                    ${msg.role === 'user' 
                      ? 'bg-black text-white px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-md ml-auto' 
                      : 'text-[#333336] pt-1'} 
                  `}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  
                  {/* Assistant Actions Footer */}
                  {(msg.role === 'system' || msg.role === 'assistant') && (
                     <div className="mt-4 flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="text-[11px] text-black/40 hover:text-black transition-colors flex items-center font-medium"><Command className="w-3 h-3 mr-1.5"/> Execute</button>
                       <button className="text-[11px] text-black/40 hover:text-black transition-colors flex items-center font-medium"><Code className="w-3 h-3 mr-1.5"/> Inspect</button>
                     </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex justify-start message-enter">
               <div className="flex space-x-4 max-w-[75%]">
                 <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#FAFAFA] border border-black/5 mt-1">
                    <div className="w-1.5 h-1.5 bg-black/40 rounded-full animate-pulse"></div>
                 </div>
                 <div className="pt-2.5 flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce"></span>
                 </div>
               </div>
             </div>
          )}
          <div ref={chatEndRef} className="h-4" />
        </div>

        {/* Minimalist Input Area */}
        <div className="p-6 md:p-8 bg-gradient-to-t from-white via-white to-transparent sticky bottom-0 z-30">
          <div className="max-w-3xl mx-auto relative group">
            
            <div className="relative rounded-2xl bg-white border border-black/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-focus-within:border-black/20 group-focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500">
              
              <div className="flex items-end p-2 px-3">
                <button className="p-3 mb-0.5 text-black/30 hover:text-black transition-colors rounded-xl md:mr-1">
                  <Paperclip className="w-[18px] h-[18px] stroke-[1.5]" />
                </button>
                
                <textarea
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
                  {/* Voice disabled per directive */}
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
                    GPT-4o Identity Active
                  </span>
                </div>
                <div className="hidden md:flex items-center space-x-3 opacity-60">
                  <span><kbd className="font-mono bg-white px-1 rounded shadow-sm border border-black/5">Enter</kbd> to execute</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  activeAgent?: boolean;
}

function NavItem({ icon, label, active = false, activeAgent = false }: NavItemProps) {
  return (
    <a href="#" className={`flex items-center px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group relative
      ${active ? 'bg-[#F5F5F7] text-[#1D1D1F] font-semibold' : 'text-black/50 hover:bg-black/[0.02] hover:text-[#1D1D1F] font-medium'}
    `}>
      <span className={`flex items-center justify-center mr-3 transition-colors duration-200 
        ${active ? 'text-black' : 'group-hover:text-black/70'}`}>
        {icon}
      </span>
      <span className="text-[13px] tracking-tight">{label}</span>
      {activeAgent && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-black shadow-[0_0_0_2px_rgba(0,0,0,0.05)]" />
      )}
    </a>
  );
}
