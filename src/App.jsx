import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import ChatArea from './components/ChatArea';
import { MODES } from './constants';

const API_URL = "";

function App() {
  const [view, setView] = useState('landing'); 
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [currentMode, setCurrentMode] = useState('explain');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const clearSession = () => {
    setMessages([]);
    setInputValue('');
  };

  const handleStartChat = () => {
    setView('chat');
  };

  const handleSend = async (textOverride) => {
    const text = textOverride || inputValue;
    if (!text.trim() || isTyping) return;

    const userMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    if (!textOverride) setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: newMessages,
          mode: currentMode
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        aiContent += chunk;
        
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], content: aiContent };
          return updated;
        });
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: `⚠️ Terjadi kesalahan: ${error.message}. Pastikan koneksi internet stabil atau periksa konfigurasi server.` }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Notify on mode change (only when there are existing messages)
  useEffect(() => {
    if (messages.length > 0) {
      const modeLabel = MODES.find(m => m.id === currentMode)?.label || currentMode;
      setMessages(prev => [
        ...prev, 
        { role: 'system', content: `Mode berganti ke ${modeLabel}` }
      ]);
    }
  }, [currentMode]);

  return (
    <div className="min-h-screen bg-background text-on-surface transition-colors duration-300">
      {view === 'landing' ? (
        <LandingPage 
          onGetStarted={handleStartChat} 
          theme={theme} 
          toggleTheme={toggleTheme} 
        />
      ) : (
        <div className="min-h-screen p-2 md:p-6">
          <ChatArea 
            messages={messages}
            inputValue={inputValue}
            setInputValue={setInputValue}
            handleSend={handleSend}
            isTyping={isTyping}
            currentMode={currentMode}
            setCurrentMode={setCurrentMode}
            clearSession={clearSession}
            onBackToLanding={() => setView('landing')}
            theme={theme}
            toggleTheme={toggleTheme}
          />
        </div>
      )}
    </div>
  );
}

export default App;
