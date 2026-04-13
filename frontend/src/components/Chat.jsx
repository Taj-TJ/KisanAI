import React, { useState, useRef, useEffect, useCallback } from 'react'
import { sendQuery } from '../services/api'

const LANGUAGES = [
  { code: 'en', label: 'English',  flag: '🇬🇧', speechCode: 'en-IN' },
  { code: 'hi', label: 'हिंदी',    flag: '🇮🇳', speechCode: 'hi-IN' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ',  flag: '🇮🇳', speechCode: 'pa-IN' },
  { code: 'ml', label: 'മലയാളം', flag: '🇮🇳', speechCode: 'ml-IN' },
]

const SUGGESTIONS = {
  en: ['My crop has insects', 'What fertilizer should I use?', 'Which crop for monsoon?', 'How often to water plants?'],
  hi: ['मेरी फसल में कीड़े हैं', 'कौन सी खाद डालूं?', 'मानसून में कौन सी फसल?', 'पौधों को कितनी बार पानी दें?'],
  pa: ['ਮੇਰੀ ਫਸਲ ਵਿੱਚ ਕੀੜੇ ਹਨ', 'ਕਿਹੜੀ ਖਾਦ ਪਾਵਾਂ?', 'ਮਾਨਸੂਨ ਵਿੱਚ ਕਿਹੜੀ ਫਸਲ?', 'ਪੌਦਿਆਂ ਨੂੰ ਕਿੰਨਾ ਪਾਣੀ ਦਿਓ?'],
  ml: ['എന്റെ വിളയിൽ കീടങ്ങളുണ്ട്', 'ഏത് വളം ഉപയോഗിക്കണം?', 'മൺസൂണിൽ ഏത് വിള?', 'ചെടികൾക്ക് എത്ര പ്രാവശ്യം വെള്ളം?'],
}

const INTENT_LABELS = {
  pest:       { icon: '🐛', label: 'Pest & Disease',  color: 'text-amber-400' },
  fertilizer: { icon: '🌱', label: 'Fertilizer',      color: 'text-emerald-400' },
  crop:       { icon: '🌾', label: 'Crop Advisory',   color: 'text-yellow-400' },
  irrigation: { icon: '💧', label: 'Irrigation',      color: 'text-blue-400' },
}

const GREETINGS = {
  en: "🌾 Namaste! I'm KisanAI, your personal farming advisor. Ask me about pests, fertilizers, crops, or irrigation — in any language!",
  hi: "🌾 नमस्ते! मैं किसानएआई हूं, आपका व्यक्तिगत कृषि सलाहकार। मुझसे कीटों, उर्वरकों, फसलों या सिंचाई के बारे में पूछें - किसी भी भाषा में!",
  pa: "🌾 ਨਮਸਤੇ! ਮੈਂ ਕਿਸਾਨੇਏਆਈ ਹਾਂ, ਤੁਹਾਡਾ ਨਿੱਜੀ ਖੇਤੀ ਸਲਾਹਕਾਰ। ਮੇਰੇ ਤੋਂ ਕੀੜਿਆਂ, ਖਾਦਾਂ, ਫਸਲਾਂ ਜਾਂ ਸਿੰਚਾਈ ਬਾਰੇ ਪੁੱਛੋ - ਕਿਸੇ ਵੀ ਭਾਸ਼ਾ ਵਿੱਚ!",
  ml: "🌾 നമസ്‌കാരം! ഞാൻ കിസാൻഎഐ ആണ്, നിങ്ങളുടെ വ്യക്തിഗത കാർഷിക ഉപദേശകൻ. കീടങ്ങൾ, വളങ്ങൾ, വിളകൾ അല്ലെങ്കിൽ ജലസേചനം എന്നിവയെക്കുറിച്ച് ഏതെങ്കിലും ഭാഷയിൽ എന്നോട് ചോദിക്കുക!",
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 animate-slide-up mb-4">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-leaf-500 to-leaf-700 flex items-center justify-center text-base flex-shrink-0 shadow-lg">
        🌾
      </div>
      <div className="msg-bubble-ai rounded-2xl rounded-bl-sm px-5 py-4">
        <div className="flex gap-1.5 items-center h-5">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-leaf-400 inline-block"
              style={{ animation: `pulseDot 1.4s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  const intent = INTENT_LABELS[msg.intent]

  return (
    <div className={`flex items-end gap-3 animate-slide-up mb-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 shadow-lg ${
        isUser
          ? 'bg-gradient-to-br from-soil-400 to-soil-600'
          : 'bg-gradient-to-br from-leaf-500 to-leaf-700'
      }`}>
        {isUser ? '👨‍🌾' : '🌾'}
      </div>

      <div className={`max-w-[78%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Intent badge */}
        {!isUser && intent && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/5 ${intent.color} border border-white/10`}>
            {intent.icon} {intent.label}
          </span>
        )}

        {/* Bubble */}
        <div className={`px-4 py-3 rounded-2xl leading-relaxed text-sm font-light ${
          isUser
            ? 'msg-bubble-user text-white rounded-br-sm'
            : 'msg-bubble-ai text-gray-100 rounded-bl-sm'
        }`}>
          {msg.text}
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-gray-600 px-1">
          {msg.time}
        </span>
      </div>
    </div>
  )
}

export default function Chat() {
  const [messages, setMessages]   = useState([
    {
      id: 0,
      role: 'ai',
      text: '🌾 Namaste! I\'m KisanAI, your personal farming advisor. Ask me about pests, fertilizers, crops, or irrigation — in any language!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      intent: null,
    }
  ])
  const [input, setInput]         = useState('')
  const [lang, setLang]           = useState('en')
  const [loading, setLoading]     = useState(false)
  const [recording, setRecording] = useState(false)
  const [error, setError]         = useState(null)
  const [showLangMenu, setShowLangMenu] = useState(false)

  const bottomRef    = useRef(null)
  const inputRef     = useRef(null)
  const recognizerRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Update greeting when language changes (only if it's the only message)
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'ai') {
      setMessages([{
        ...messages[0],
        text: GREETINGS[lang] || GREETINGS.en
      }]);
    }
  }, [lang]);

  const currentLang = LANGUAGES.find(l => l.code === lang)

  const handleSend = useCallback(async (textOverride) => {
    const text = (textOverride ?? input).trim()
    if (!text || loading) return

    const userMsg = {
      id: Date.now(),
      role: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const data = await sendQuery(text, lang)
      const aiMsg = {
        id: Date.now() + 1,
        role: 'ai',
        text: data.response,
        intent: data.intent,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      setError('⚠️ Could not reach the server. Make sure the backend is running on port 5000.')
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [input, lang, loading])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const startVoice = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('⚠️ Voice input is not supported in this browser. Try Chrome.')
      return
    }

    if (recording) {
      recognizerRef.current?.stop()
      setRecording(false)
      return
    }

    const recognizer = new SpeechRecognition()
    recognizer.lang = currentLang.speechCode
    recognizer.interimResults = false
    recognizer.maxAlternatives = 1

    recognizer.onstart  = () => setRecording(true)
    recognizer.onend    = () => setRecording(false)
    recognizer.onerror  = () => { setRecording(false); setError('⚠️ Voice recognition error. Please try again.') }
    recognizer.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setInput(transcript)
      setTimeout(() => inputRef.current?.focus(), 100)
    }

    recognizerRef.current = recognizer
    recognizer.start()
  }, [recording, currentLang])

  const suggestions = SUGGESTIONS[lang] || SUGGESTIONS.en

  return (
    <div className="flex flex-col h-[calc(100dvh-56px-64px)] md:h-screen chat-gradient grain-overlay relative overflow-hidden">

      {/* Header */}
      <header className="relative z-50 flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-leaf-400 to-leaf-700 flex items-center justify-center text-xl shadow-lg">
            🌾
          </div>
          <div>
            <h1 className="text-white font-semibold text-base tracking-tight leading-none">KisanAI</h1>
            <p className="text-leaf-400 text-xs mt-0.5 font-light">Agricultural Advisory System</p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(v => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm text-gray-300"
          >
            <span>{currentLang.flag}</span>
            <span className="hidden sm:inline font-medium">{currentLang.label}</span>
            <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showLangMenu && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-[#1a2e1b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in">
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setShowLangMenu(false) }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition-colors ${
                    lang === l.code ? 'text-leaf-400 bg-leaf-900/30' : 'text-gray-300'
                  }`}
                >
                  <span className="text-base">{l.flag}</span>
                  <span>{l.label}</span>
                  {lang === l.code && <span className="ml-auto text-leaf-400">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4">
        {messages.map(msg => <Message key={msg.id} msg={msg} />)}
        {loading && <TypingIndicator />}

        {/* Error banner */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-900/30 border border-red-500/20 text-red-300 text-sm animate-fade-in">
            {error}
            <button onClick={() => setError(null)} className="ml-2 text-red-400 hover:text-red-200">✕</button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestion chips */}
      {messages.length <= 2 && (
        <div className="relative z-10 flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s)}
              className="flex-shrink-0 text-xs px-3 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:bg-leaf-900/30 hover:text-leaf-300 hover:border-leaf-700/40 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="relative z-10 px-4 pb-5 pt-2">
        <div className="input-glow flex items-center gap-2 bg-[#1a2e1b] border border-white/10 rounded-2xl px-4 py-3 transition-all">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={lang === 'en' ? 'Ask about your crops...' : lang === 'hi' ? 'अपनी फसल के बारे में पूछें...' : lang === 'pa' ? 'ਆਪਣੀ ਫਸਲ ਬਾਰੇ ਪੁੱਛੋ...' : 'നിങ്ങളുടെ വിളയെക്കുറിച്ച് ചോദിക്കുക...'}
            className="flex-1 bg-transparent text-gray-100 placeholder-gray-600 text-sm outline-none font-light"
            disabled={loading}
          />

          {/* Voice button */}
          <button
            onClick={startVoice}
            title={recording ? 'Stop recording' : 'Start voice input'}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
              recording
                ? 'bg-red-500 voice-recording text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
            }`}
          >
            <svg className="w-4 h-4" fill={recording ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          {/* Send button */}
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl bg-leaf-600 hover:bg-leaf-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all flex-shrink-0 shadow-lg"
          >
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>

        <p className="text-center text-[10px] text-gray-700 mt-2">
          KisanAI • Farming advice for pest, fertilizer, crop & irrigation
        </p>
      </div>
    </div>
  )
}
