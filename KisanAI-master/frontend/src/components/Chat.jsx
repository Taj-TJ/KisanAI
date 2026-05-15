import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlusCircle, 
  Trash2, 
  Send, 
  Mic, 
  Globe, 
  ChevronDown, 
  Menu, 
  MessageSquare, 
  History,
  X,
  Search,
  MoreVertical,
  Paperclip,
  Zap,
  User
} from 'lucide-react'
import toast from 'react-hot-toast'
import { sendQuery, fetchChatHistory, clearChatHistory, fetchThreads } from '../services/api'

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
  pest:       { icon: '🐛', label: 'Pest & Disease',  color: 'text-amber-600', bg: 'bg-amber-50' },
  fertilizer: { icon: '🌱', label: 'Fertilizer',      color: 'text-emerald-600', bg: 'bg-emerald-50' },
  crop:       { icon: '🌾', label: 'Crop Advisory',   color: 'text-yellow-600', bg: 'bg-yellow-50' },
  irrigation: { icon: '💧', label: 'Irrigation',      color: 'text-blue-600', bg: 'bg-blue-50' },
}

const GREETINGS = {
  en: "Hello! I am KisanAI, your precision agriculture partner. I can help you with crop health analysis, soil nutrition, irrigation schedules, and pest management. How can I assist your farm today?",
  hi: "नमस्ते! मैं किसानएआई हूं, आपका सटीक कृषि भागीदार। मैं फसल स्वास्थ्य विश्लेषण, मिट्टी के पोषण, सिंचाई कार्यक्रम और कीट प्रबंधन में आपकी मदद कर सकता हूं। आज मैं आपके खेत की कैसे सहायता कर सकता हूं?",
  pa: "ਹੈਲੋ! ਮੈਂ ਕਿਸਾਨਏਆਈ ਹਾਂ, ਤੁਹਾਡਾ ਸਟੀਕ ਖੇਤੀਬਾੜੀ ਸਾਥੀ। ਮੈਂ ਫਸਲ ਦੀ ਸਿਹਤ ਦੇ ਵਿਸ਼ਲੇਸ਼ਣ, ਮਿੱਟੀ ਦੇ ਪੋਸ਼ਣ, ਸਿੰਚਾਈ ਦੇ ਕਾਰਜਕ੍ਰਮ ਅਤੇ ਕੀੜਿਆਂ ਦੇ ਪ੍ਰਬੰਧਨ ਵਿੱਚ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੇ ਫਾਰਮ ਦੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
  ml: "ഹലോ! ഞാൻ കിസാൻഎഐ ആണ്, നിങ്ങളുടെ കൃത്യമായ കൃഷി പങ്കാളി. വിളകളുടെ ആരോഗ്യ വിശകലനം, മണ്ണിലെ പോഷകാഹാരം, ജലസേചന ഷെഡ്യൂളുകൾ, കീടനാശിനി മാനേജ്‌മെന്റ് എന്നിവയിൽ എനിക്ക് നിങ്ങളെ സഹായിക്കാനാകും. ഇന്ന് നിങ്ങളുടെ ഫാമിനെ എനിക്ക് എങ്ങനെ സഹായിക്കാനാകും?",
}

function TypingIndicator() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="flex gap-4 items-start max-w-3xl mb-6"
    >
      <div className="w-8 h-8 rounded-lg bg-[#d9e6da] flex-shrink-0 flex items-center justify-center mt-1">
        <Zap size={16} className="text-[#1b5e20]" />
      </div>
      <div className="bg-white border border-[#e1e4db] p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
        <span className="text-[10px] text-[#41493e] font-black uppercase tracking-widest">Analyzing</span>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
              className="w-1 h-1 rounded-full bg-[#1b5e20]"
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className={`flex gap-4 items-start mb-8 ${isUser ? 'justify-end' : 'max-w-3xl'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-[#d9e6da] flex-shrink-0 flex items-center justify-center mt-1 border border-[#1b5e20]/10">
          <Zap size={16} className="text-[#1b5e20]" />
        </div>
      )}

      <div className={`flex flex-col gap-1 ${isUser ? 'items-end max-w-[85%]' : 'flex-1'}`}>
        {/* Intent badge */}
        {!isUser && intent && (
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-1 ${intent.bg} ${intent.color} border border-current/10`}>
            {intent.icon} {intent.label}
          </span>
        )}

        {/* Bubble */}
        <div className={`p-4 md:p-5 rounded-2xl shadow-sm ${
          isUser
            ? 'bg-[#002c06] text-white rounded-tr-none border border-[#002c06]'
            : 'bg-white text-[#191d18] rounded-tl-none border border-[#e1e4db]'
        }`}>
          <p className="text-sm md:text-base leading-relaxed font-medium whitespace-pre-wrap">
            {msg.text}
          </p>
          <span className={`text-[10px] block mt-3 font-bold uppercase tracking-widest opacity-60 ${isUser ? 'text-right' : ''}`}>
            {msg.time}
          </span>
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-[#ecefe6] flex-shrink-0 flex items-center justify-center mt-1 border border-[#c0c9bb] overflow-hidden">
           <User size={18} className="text-[#41493e]" />
        </div>
      )}
    </motion.div>
  )
}

export default function Chat() {
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [lang, setLang]           = useState('en')
  const [loading, setLoading]     = useState(false)
  const [recording, setRecording] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [showSidebar, setShowSidebar]   = useState(false)
  const [threads, setThreads]           = useState([])
  const [currentThreadId, setCurrentThreadId] = useState('default')
  const [threadTitle, setThreadTitle]         = useState(null)

  const bottomRef    = useRef(null)
  const inputRef     = useRef(null)
  const fileInputRef  = useRef(null)
  const recognizerRef = useRef(null)

  const loadThreads = async () => {
    try {
      const data = await fetchThreads()
      setThreads(data)
    } catch (err) { console.error('Threads error:', err) }
  }

  useEffect(() => {
    document.title = "Advisory Chat | KisanAI";
    async function loadHistory() {
      const token = localStorage.getItem('kisanai_token')
      if (!token) {
        setMessages([{
          id: 0,
          role: 'ai',
          text: GREETINGS[lang] || GREETINGS.en,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          intent: null,
        }])
        return
      }

      setLoading(true)
      setLoading(true)
      try {
        const history = await fetchChatHistory(currentThreadId)
        if (history && history.length > 0) {
          const formatted = history.map(c => ({
            id: c.id,
            role: c.role,
            text: c.text,
            intent: c.intent,
            time: new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }))
          setMessages(formatted)
          setThreadTitle(history[0].threadTitle)
        } else {
          throw new Error('Empty')
        }
      } catch (err) {
        // Fallback to greeting if fetch fails or is empty
        setMessages([{
          id: 0,
          role: 'ai',
          text: GREETINGS[lang] || GREETINGS.en,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          intent: null,
        }])
        setThreadTitle(null)
      } finally {
        setLoading(false)
      }
    }
    loadHistory()
    loadThreads()
  }, [currentThreadId, lang])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

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
      window.speechSynthesis.cancel()
      const cleanText = text.replace(/[*#_\[\]\(\)]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText)
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
      const data = await sendQuery(text, lang, currentThreadId, threadTitle)
      const aiMsg = {
        id: Date.now() + 1,
        role: 'ai',
        text: data.response,
        intent: data.intent,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, aiMsg])
      speak(data.response)
      if (!threadTitle) loadThreads()
    } catch (err) {
      toast.error('Connection error. Please try again.')
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [input, lang, loading, currentThreadId, threadTitle])

  const startVoice = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Voice input is not supported here.')
      return
    }

    if (recording) {
      recognizerRef.current?.stop()
      setRecording(false)
      return
    }

    const recognizer = new SpeechRecognition()
    recognizer.lang = currentLang.speechCode
    recognizer.onstart = () => setRecording(true)
    recognizer.onend = () => setRecording(false)
    recognizer.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setInput(transcript)
    }
    recognizerRef.current = recognizer
    recognizer.start()
  }, [recording, currentLang])

  const handleNewChat = () => {
    setCurrentThreadId('chat_' + Date.now())
    setThreadTitle(null)
    setMessages([])
    toast.success('New session started')
  }

  const handleDeleteHistory = async () => {
    if (!window.confirm('Delete history?')) return
    try {
      await clearChatHistory()
      handleNewChat()
      loadThreads()
    } catch (err) { toast.error('Failed') }
  }

  const suggestions = SUGGESTIONS[lang] || SUGGESTIONS.en

  return (
    <div className="flex h-[calc(100vh-64px)] md:h-screen bg-[#f4f4f0] font-['Manrope'] text-[#191d18] relative overflow-hidden">
      
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.aside
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              className="fixed md:relative inset-y-0 left-0 w-72 bg-[#f4f4f0] border-r border-[#e1e4db]/50 z-[70] flex flex-col shadow-xl"
            >
              <div className="p-6 border-b border-[#e1e4db]/50 flex items-center justify-between">
                <span className="text-[#002c06] font-black text-xs uppercase tracking-widest">Conversations</span>
                <button onClick={handleDeleteHistory} className="text-[#41493e] hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1 no-scrollbar">
                {threads.map(t => (
                  <button
                    key={t.threadId}
                    onClick={() => { setCurrentThreadId(t.threadId); setShowSidebar(false) }}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      currentThreadId === t.threadId ? 'bg-[#d9e6da] border border-[#1b5e20]/10' : 'hover:bg-[#ecefe6] border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <MessageSquare size={18} className={currentThreadId === t.threadId ? 'text-[#1b5e20]' : 'text-[#41493e]'} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs truncate font-bold ${currentThreadId === t.threadId ? 'text-[#002c06]' : 'text-[#41493e]'}`}>
                          {t.title}
                        </p>
                        <p className="text-[10px] text-[#41493e] mt-1 truncate opacity-70">{t.lastMessage}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="p-4 border-t border-[#e1e4db]/50">
                <button onClick={handleNewChat} className="w-full py-3 bg-[#002c06] text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-all">
                  <PlusCircle size={16} /> New Session
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-6 border-b border-[#e1e4db] bg-white sticky top-0 z-40">
          <div className="flex items-center gap-3 md:gap-4">
            <button onClick={() => setShowSidebar(v => !v)} className="p-2 -ml-2 rounded-xl hover:bg-[#f4f4f0] text-[#41493e]">
              <Menu size={24} />
            </button>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[#d9e6da] flex items-center justify-center border border-[#1b5e20]/10">
              <Zap size={20} className="text-[#1b5e20]" />
            </div>
            <div>
              <h1 className="text-[#002c06] font-extrabold text-sm md:text-lg tracking-tight leading-none">
                {threadTitle || 'KisanAI Assistant'}
              </h1>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1b5e20] animate-pulse"></span>
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#1b5e20]">Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
             <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-xl border border-[#e1e4db] hover:bg-[#f4f4f0] text-sm font-bold text-[#41493e] transition-all">
                <span>{currentLang.flag}</span>
                <span className="hidden sm:inline uppercase tracking-tighter text-[11px]">{currentLang.label}</span>
                <ChevronDown size={14} className={`transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
             </button>
             <button className="p-2 text-[#41493e] hover:bg-[#f4f4f0] rounded-xl"><MoreVertical size={20} /></button>
          </div>

          <AnimatePresence>
            {showLangMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute right-12 md:right-20 top-full mt-2 w-48 bg-white border border-[#e1e4db] rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => { setLang(l.code); setShowLangMenu(false) }}
                    className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-bold transition-all ${lang === l.code ? 'bg-[#d9e6da] text-[#1b5e20]' : 'text-[#41493e] hover:bg-[#f4f4f0]'}`}>
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 no-scrollbar pb-64">
          <div className="max-w-5xl mx-auto w-full">
            <AnimatePresence initial={false}>
              {messages.map(msg => <Message key={msg.id} msg={msg} />)}
              {loading && <TypingIndicator key="typing" />}
            </AnimatePresence>
            <div ref={bottomRef} className="h-4" />
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 bg-white/80 backdrop-blur-xl border-t border-[#e1e4db] z-40">
          <div className="max-w-4xl mx-auto space-y-4">
            
            {/* Chips */}
            {messages.length <= 2 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => handleSend(s)}
                    className="whitespace-nowrap px-4 py-2 rounded-full border border-[#002c06] text-[#002c06] bg-white font-bold text-[10px] uppercase tracking-widest hover:bg-[#002c06] hover:text-white transition-all">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="relative flex items-center gap-2 bg-white border border-[#002c06] rounded-2xl p-1.5 md:p-2 shadow-sm focus-within:ring-4 focus-within:ring-[#002c06]/5 transition-all">
              <button 
                onClick={startVoice} 
                className={`p-2 md:p-3 rounded-xl transition-all ${recording ? 'bg-red-500 text-white animate-pulse' : 'text-[#002c06] hover:bg-[#f4f4f0]'}`}
              >
                <Mic size={20} />
              </button>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 md:p-3 text-[#002c06] hover:bg-[#f4f4f0] rounded-xl transition-colors"
              >
                <Paperclip size={20} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    toast.success('Image selected! Analysis starting...');
                    // Logic to handle image analysis can be integrated here
                  }
                }}
              />

              <input 
                ref={inputRef} 
                type="text" 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Describe your farm issue..."
                className="flex-grow bg-transparent border-none outline-none focus:ring-0 font-medium text-xs md:text-sm text-[#191d18] placeholder-[#41493e]/50 px-2 min-w-0"
                disabled={loading}
              />
              
              <button 
                onClick={() => handleSend()} 
                disabled={!input.trim() || loading}
                className="w-10 h-10 md:w-12 md:h-12 bg-[#002c06] text-white rounded-xl flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-lg disabled:opacity-30"
              >
                <Send size={20} />
              </button>
            </div>

            <p className="text-center text-[9px] md:text-[10px] font-bold text-[#41493e] opacity-50 uppercase tracking-[0.2em]">
               KisanAI provides general advice. For critical issues, consult a field officer.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
