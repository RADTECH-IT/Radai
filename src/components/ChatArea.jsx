import React, { useRef, useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import MessageCard from './MessageCard';
import { MODES } from '../constants';

const API_URL = "";

const ChatArea = ({ 
  messages, 
  inputValue, 
  setInputValue, 
  handleSend, 
  isTyping, 
  currentMode,
  setCurrentMode,
  clearSession,
  onBackToLanding,
  theme,
  toggleTheme
}) => {
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      const prefix = currentMode === 'summary' ? 'Analisis dan ringkas dokumen ini:\n\n' : 'Dokumen referensi:\n\n';
      handleSend(prefix + data.text.substring(0, 5000));
    } catch (error) {
      console.error(error);
      alert('Gagal mengunggah file. Pastikan server berjalan.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const selectedMode = MODES.find(m => m.id === currentMode);

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] w-full max-w-5xl mx-auto">
      
      {/* Chat Container */}
      <div className="glass-panel rounded-2xl md:rounded-3xl flex flex-col flex-1 overflow-hidden shadow-xl">
        
        {/* Header */}
        <div className="px-5 md:px-6 py-4 border-b border-outline flex items-center justify-between bg-surface-low/30">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToLanding}
              className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all duration-200"
              aria-label="Kembali"
            >
              <Icons.ArrowLeft size={18} />
            </button>
            <div className="h-5 w-px bg-outline" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Icons.Activity className="text-primary w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">RadAI</h3>
                <p className="text-[11px] text-on-surface-variant">{selectedMode?.label} Mode</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={clearSession}
              className="p-2 rounded-xl text-on-surface-variant hover:text-accent-rose hover:bg-accent-rose/5 transition-all duration-200"
              title="Reset percakapan"
            >
              <Icons.Trash2 size={16} />
            </button>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all duration-200"
              title="Ganti tema"
            >
              {theme === 'dark' ? <Icons.Sun size={16} /> : <Icons.Moon size={16} />}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-5 custom-scrollbar"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in px-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                <Icons.MessageSquarePlus size={28} className="text-primary/60" />
              </div>
              <h3 className="text-xl font-bold mb-2">Mulai Percakapan</h3>
              <p className="text-sm text-on-surface-variant max-w-md leading-relaxed">
                Ketik pertanyaan tentang radiologi atau unggah dokumen untuk memulai sesi belajar.
                Pilih mode sesuai yang akan dilakukan.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <MessageCard key={idx} message={msg} />
            ))
          )}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Icons.Bot size={16} className="text-primary" />
              </div>
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-md glass-panel">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary/60" style={{ animation: 'pulse-dot 1.4s infinite', animationDelay: '0s' }} />
                  <div className="w-2 h-2 rounded-full bg-primary/60" style={{ animation: 'pulse-dot 1.4s infinite', animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 rounded-full bg-primary/60" style={{ animation: 'pulse-dot 1.4s infinite', animationDelay: '0.4s' }} />
                </div>
                <span className="text-xs text-on-surface-variant ml-1">Menulis...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="px-4 md:px-6 py-4 border-t border-outline bg-surface-low/20">
          <div className="flex gap-3 items-end max-w-4xl mx-auto">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".pdf,.txt" 
            />
            <button 
              onClick={() => fileInputRef.current.click()}
              disabled={isUploading}
              className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 border border-outline text-on-surface-variant hover:text-primary hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50"
              title="Unggah dokumen (PDF/TXT)"
            >
              {isUploading ? (
                <Icons.Loader2 size={18} className="animate-spin" />
              ) : (
                <Icons.Paperclip size={18} />
              )}
            </button>
            
            <div className="flex-1 relative">
              <textarea 
                ref={textareaRef}
                rows={1}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  adjustHeight();
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ketik pertanyaan tentang radiologi..."
                className="w-full bg-surface-lowest border border-outline focus:border-primary/50 focus:ring-2 focus:ring-primary/10 text-on-surface text-sm rounded-xl py-3 px-4 transition-all duration-200 resize-none min-h-[44px] placeholder:text-on-surface-variant/50 outline-none"
              />
            </div>

            <button 
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isTyping}
              className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary-hover hover:shadow-lg active:scale-95 disabled:opacity-40 disabled:shadow-none disabled:active:scale-100"
            >
              <Icons.SendHorizontal size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex justify-center gap-2 mt-4 pb-4 flex-wrap">
        {MODES.map((mode) => {
          const Icon = Icons[mode.icon];
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setCurrentMode(mode.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                isActive 
                ? 'bg-primary border-primary text-white shadow-md shadow-primary/20' 
                : 'bg-surface-low/50 border-outline text-on-surface-variant hover:text-primary hover:border-primary/40'
              }`}
            >
              <Icon size={15} />
              <span>{mode.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ChatArea;
