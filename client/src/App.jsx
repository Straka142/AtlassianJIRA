import { useState, useRef, useCallback, useEffect } from 'react';
import AgentMascot from './components/AgentMascot';
import VoiceButton from './components/VoiceButton';
import MessageBubble from './components/MessageBubble';
import FileUpload from './components/FileUpload';
import './App.css';

const WELCOME = {
  role: 'assistant',
  content: "Hi there, Lincoln Lions! I'm Linc! 🎩 Press the big button below and ask me anything — I love to help you learn! You can also load files so I can teach you about any topic!",
};

export default function App() {
  const [messages, setMessages] = useState([WELCOME]);
  const [agentState, setAgentState] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [loadedFiles, setLoadedFiles] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [inputText, setInputText] = useState('');

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const agentStateRef = useRef('idle');

  useEffect(() => { agentStateRef.current = agentState; }, [agentState]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, agentState]);

  const speak = useCallback((text) => {
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.88;
    utterance.pitch = 1.15;
    utterance.volume = 1;

    const assignVoice = () => {
      const voices = synth.getVoices();
      const pick =
        voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
        voices.find(v => v.lang.startsWith('en-US')) ||
        voices[0];
      if (pick) utterance.voice = pick;
    };

    if (synth.getVoices().length > 0) assignVoice();
    else synth.addEventListener('voiceschanged', assignVoice, { once: true });

    utterance.onstart = () => setAgentState('speaking');
    utterance.onend   = () => setAgentState('idle');
    utterance.onerror = () => setAgentState('idle');

    synth.speak(utterance);
  }, []);

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages(prev => [...prev, { role: 'user', content: trimmed }]);
    setAgentState('thinking');
    setTranscript('');
    setInputText('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-8).filter(m => m.role !== 'system'),
        }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const { response } = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      speak(response);
    } catch {
      const fallback = "Oops! I had a little hiccup. Can you try asking me again? 😄";
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
      setAgentState('idle');
    }
  }, [messages, speak]);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert('Voice input needs Chrome or Edge. You can type below! 🌐');
      return;
    }

    window.speechSynthesis.cancel();
    recognitionRef.current?.abort();

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';
    recognitionRef.current = rec;

    rec.onstart  = () => setAgentState('listening');

    rec.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join('');
      setTranscript(text);
      if (e.results[e.results.length - 1].isFinal) sendMessage(text);
    };

    rec.onerror = (e) => {
      if (e.error === 'not-allowed') {
        alert('Microphone access was denied. Allow it in your browser settings! 🎤');
      }
      setAgentState('idle');
      setTranscript('');
    };

    rec.onend = () => {
      if (agentStateRef.current === 'listening') setAgentState('idle');
    };

    rec.start();
  }, [sendMessage]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setAgentState('idle');
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (inputText.trim() && agentState === 'idle') sendMessage(inputText);
  }, [inputText, agentState, sendMessage]);

  const DECORATIONS = ['🦁', '🎩', '⭐', '🔴', '⚪', '🎈', '🏫', '🌟'];

  return (
    <div className="app">
      <div className="bg-deco" aria-hidden="true">
        {DECORATIONS.map((d, i) => (
          <span key={i} className={`deco deco-${i}`}>{d}</span>
        ))}
      </div>

      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="school-badge">🏫 Lincoln Elementary · Wauwatosa, WI</div>
          <h1 className="title">🎩 Linc the Learning Lion! 🎩</h1>
          <p className="subtitle">Go Lions! Ask me anything — I love to help you learn!</p>
        </header>

        {/* Main area */}
        <div className="main-area">
          {/* Left: Mascot */}
          <div className="mascot-col">
            <AgentMascot state={agentState} />

            {transcript && (
              <div className="transcript-bubble" aria-live="polite">
                "{transcript}"
              </div>
            )}

            {loadedFiles.length > 0 && (
              <div className="files-badge">
                📚 {loadedFiles.length} file{loadedFiles.length !== 1 ? 's' : ''} loaded!
              </div>
            )}

            <div className="paw-prints" aria-hidden="true">🐾 Go Lions! 🐾</div>
          </div>

          {/* Right: Chat */}
          <div className="chat-col">
            <div className="messages" role="log" aria-live="polite" aria-label="Conversation">
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
              {agentState === 'thinking' && (
                <div className="thinking-row" aria-label="Sparky is thinking">
                  <div className="bubble-avatar" aria-hidden="true">🌟</div>
                  <div className="thinking-dots">
                    <span className="tdot" /><span className="tdot" /><span className="tdot" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Controls row */}
        <div className="controls">
          <VoiceButton state={agentState} onStart={startListening} onStop={stopListening} />

          <button
            className="upload-toggle"
            onClick={() => setShowUpload(v => !v)}
            aria-expanded={showUpload}
          >
            <span className="upload-toggle-icon">📚</span>
            <span>Load Files</span>
          </button>
        </div>

        {/* Text input fallback */}
        <form className="text-form" onSubmit={handleSubmit}>
          <input
            className="text-input"
            type="text"
            placeholder="Or type your question here…"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            disabled={agentState !== 'idle'}
            aria-label="Type your question"
          />
          <button
            className="send-btn"
            type="submit"
            disabled={!inputText.trim() || agentState !== 'idle'}
          >
            Send ➤
          </button>
        </form>

        {/* File upload panel */}
        {showUpload && (
          <FileUpload
            onFilesUploaded={(files) => setLoadedFiles(prev => [...prev, ...files])}
            onClose={() => setShowUpload(false)}
          />
        )}
      </div>
    </div>
  );
}
