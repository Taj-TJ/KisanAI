import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { sendQuery } from '../services/api'
import GlowButton from './ui/GlowButton'

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
  pest:       { icon: '🐛', label: 'Pest & Disease',  color: 'text-amber-400', bg: 'bg-amber-400/10' },
  fertilizer: { icon: '🌱', label: 'Fertilizer',      color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  crop:       { icon: '🌾', label: 'Crop Advisory',   color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  irrigation: { icon: '💧', label: 'Irrigation',      color: 'text-blue-400', bg: 'bg-blue-400/10' },
}

const GREETINGS = {
  en: "🌾 Namaste! I'm KisanAI, your personal farming advisor. Ask me about pests, fertilizers, crops, or irrigation — in any language!",
  hi: "🌾 नमस्ते! मैं किसानएआई हूं, आपका व्यक्तिगत कृषि सलाहकार। मुझसे कीटों, उर्वरकों, फसलों या सिंचाई के बारे में पूछें - किसी भी भाषा में!",
  pa: "🌾 ਨਮਸਤੇ! ਮੈਂ ਕਿਸਾਨੇਏਆਈ ਹਾਂ, ਤੁਹਾਡਾ ਨਿੱਜੀ ਖੇਤੀ ਸਲਾਹਕਾਰ। ਮੇਰੇ ਤੋਂ ਕੀੜਿਆਂ, ਖਾਦਾਂ, ਫਸਲਾਂ ਜਾਂ ਸਿੰਚਾਈ ਬਾਰੇ ਪੁੱਛੋ - ਕਿਸੇ ਵੀ ਭਾਸ਼ਾ ਵਿੱਚ!",
  ml: "🌾 നമസ്‌കാരം! ഞാൻ കിസാൻഎഐ ആണ്, നിങ്ങളുടെ വ്യക്തിഗത കാർഷിക ഉപദേശകൻ. കീടങ്ങൾ, വളങ്ങൾ, വിളകൾ അല്ലെങ്കിൽ ജലസേചനം എന്നിവയെക്കുറിച്ച് ഏതെങ്കിലും ഭാഷയിൽ എന്നോട് ചോദിക്കുക!",
}

function TypingIndicator() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-end gap-3 mb-4"
    >
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-leaf-500 to-leaf-700 flex items-center justify-center text-base flex-shrink-0 shadow-lg">
        🌾
      </div>
      <div className="msg-bubble-ai rounded-2xl rounded-bl-sm px-5 py-4 border border-white/5 flex items-center gap-2">
        <span className="text-xs text-leaf-300 font-medium tracking-widest uppercase">Thinking</span>
        <div className="flex gap-1.5 items-center">
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
              className="w-1.5 h-1.5 rounded-full bg-leaf-400 inline-block"
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  const intent = INTENT_LABELS[msg.intent]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      layout
      className={`flex items-end gap-3 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 shadow-lg ${
        isUser
          ? 'bg-gradient-to-br from-soil-400 to-soil-600'
          : 'bg-gradient-to-br from-leaf-500 to-leaf-700'
      }`}>
        {isUser ? '👨‍🌾' : '🌾'}
      </div>

      <div className={`max-w-[85%] md:max-w-[75%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Intent badge */}
        {!isUser && intent && (
          <motion.span 
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${intent.bg} ${intent.color} border border-white/5 shadow-sm`}
          >
            {intent.icon} {intent.label}
          </motion.span>
        )}

        {/* Bubble */}
        <div className={`px-4 py-3 rounded-2xl leading-relaxed text-sm font-light shadow-xl backdrop-blur-sm ${
          isUser
            ? 'msg-bubble-user text-white rounded-br-sm'
            : 'msg-bubble-ai text-gray-100 rounded-bl-sm border border-white/5'
        }`}>
          {msg.text}
        </div>

        {/* Timestamp */}
        <span className="text-[9px] text-gray-500 px-1 font-mono tracking-widest opacity-70">
          {msg.time}
        </span>
      </div>
    </motion.div>
  )
}

export default function Chat() {
  const [messages, setMessages]   = useState([
    {
      id: 0,
      role: 'ai',
      text: GREETINGS.en,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      intent: null,
    }
  ])
  const [input, setInput]         = useState('')
  const [lang, setLang]           = useState('en')
  const [loading, setLoading]     = useState(false)
  const [recording, setRecording] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)

  const bottomRef    = useRef(null)
  const inputRef     = useRef(null)
  const recognizerRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Update greeting when language changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'ai') {
      setMessages([{
        ...messages[0],
        text: GREETINGS[lang] || GREETINGS.en
      }]);
    }
  }, [lang]);

  const currentLang = LANGUAGES.find(l => l.code === lang)

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel() // Stop previous
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = currentLang.speechCode
      utterance.rate = 1.0
      window.speechSynthesis.speak(utterance)
    }
  }

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
      speak(data.response) // Synthesize voice reply
    } catch (err) {
      toast.error('Could not reach the server. Make sure the backend is running.')
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
      toast.error('Voice input is not supported in this browser.')
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

    recognizer.onstart  = () => { setRecording(true); toast('Listening...', { icon: '🎙️' }) }
    recognizer.onend    = () => setRecording(false)
    recognizer.onerror  = () => { setRecording(false); toast.error('Voice recognition failed.') }
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
      <header className="relative z-50 flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 10 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-leaf-400 to-leaf-700 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(97,166,93,0.3)]"
          >
            🌾
          </motion.div>
          <div>
            <h1 className="text-white font-semibold text-base tracking-tight leading-none">KisanAI</h1>
            <p className="text-leaf-400 text-[10px] mt-0.5 font-bold uppercase tracking-widest opacity-80">Online Assistant</p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowLangMenu(v => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm text-gray-300 shadow-inner"
          >
            <span>{currentLang.flag}</span>
            <span className="hidden sm:inline font-medium text-xs">{currentLang.label}</span>
            <svg className={`w-3 h-3 text-gray-500 transition-transform ${showLangMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.button>

          <AnimatePresence>
            {showLangMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-44 bg-[#112012] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl"
              >
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setShowLangMenu(false) }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                      lang === l.code ? 'text-leaf-400 bg-leaf-900/30 font-bold' : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-base">{l.flag}</span>
                    <span>{l.label}</span>
                    {lang === l.code && <span className="ml-auto text-leaf-400">✓</span>}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Messages Area */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
        <div className="max-w-3xl mx-auto w-full">
          <AnimatePresence initial={false}>
            {messages.map(msg => <Message key={msg.id} msg={msg} />)}
            {loading && <TypingIndicator key="typing" />}
          </AnimatePresence>
          <div ref={bottomRef} className="h-2" />
        </div>
      </div>

      {/* Footer Area */}
      <div className="relative z-20 px-4 pb-5 pt-2 max-w-3xl mx-auto w-full">
        {/* Suggestion chips */}
        <AnimatePresence>
          {messages.length <= 2 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="flex gap-2 pb-3 overflow-x-auto no-scrollbar"
            >
              {suggestions.map((s, i) => (
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(97, 166, 93, 0.1)' }}
                  key={i}
                  onClick={() => handleSend(s)}
                  className="flex-shrink-0 text-[11px] font-medium px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-leaf-300 hover:border-leaf-700/40 transition-colors shadow-sm whitespace-nowrap"
                >
                  {s}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input bar */}
        <div className="input-glow flex items-center gap-2 bg-[#1a2e1b]/80 backdrop-blur-md border border-white/10 rounded-2xl p-2 transition-all shadow-2xl">
          <button
            onClick={startVoice}
            title={recording ? 'Stop recording' : 'Start voice input'}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ml-1 ${
              recording
                ? 'bg-red-500 voice-recording text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
            }`}
          >
            <svg className="w-4 h-4" fill={recording ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={lang === 'en' ? 'Ask about your crops...' : lang === 'hi' ? 'अपनी फसल के बारे में पूछें...' : lang === 'pa' ? 'ਆਪਣੀ ਫਸਲ ਬਾਰੇ ਪੁੱਛੋ...' : 'നിങ്ങളുടെ വിളയെക്കുറിച്ച് ചോദിക്കുക...'}
            className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 text-sm outline-none font-light px-2"
            disabled={loading}
          />

          <GlowButton
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 flex items-center justify-center flex-shrink-0 shadow-lg rounded-xl"
          >
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </GlowButton>
        </div>
      </div>
    </div>
  )
}
