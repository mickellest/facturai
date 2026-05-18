import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Mic, MicOff } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! Soy tu asistente inteligente de FacturAI. Puedo ayudarte a buscar información sobre tus facturas, consultar totales por proveedor, o ver qué pagos están pendientes. ¿En qué te ayudo hoy?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reemplaza esto con la URL del Webhook de tu flujo de n8n
  const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/chat-assistant';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage.content, 
          sessionId: 'user-session-1' 
        }),
      });

      if (!response.ok) {
        throw new Error('Error al conectar con el asistente');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.output || data.message || data.response || 'El asistente procesó la solicitud pero no devolvió un texto.'
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'No me pude conectar con n8n. Asegúrate de crear el flujo con el Webhook (URL: http://localhost:5678/webhook/chat-assistant) y que el flujo esté activo o en modo escucha (Execute Workflow).'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Tu navegador no soporta el reconocimiento de voz. Usa Chrome o Edge.');
      return;
    }

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Error de reconocimiento de voz:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col h-full bg-transparent relative animate-in fade-in duration-500">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-200/60 flex items-center gap-4 bg-white/50 backdrop-blur-md sticky top-0 z-10">
        <div className="bg-gradient-to-br from-primary to-indigo-600 p-2.5 rounded-xl shadow-sm">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Asistente Inteligente</h1>
          <p className="text-sm text-gray-500 font-medium">Conectado a tu base de datos mediante IA</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            
            <div className={`max-w-[75%] px-6 py-4 rounded-2xl text-[15px] ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-primary to-indigo-600 text-white rounded-tr-sm shadow-md' 
                : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100 shadow-sm'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>

            {msg.role === 'user' && (
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 justify-start">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white border border-gray-100 px-6 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="text-gray-500 text-[15px] font-medium">Procesando consulta en la base de datos...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white/50 backdrop-blur-md border-t border-gray-200/60">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center gap-2">
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3.5 rounded-xl transition-all shadow-sm flex-shrink-0 ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-white border border-gray-200 text-gray-500 hover:text-primary hover:border-primary/50'
            }`}
            title="Usar dictado por voz"
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Escuchando..." : "Pregúntale algo a tu asistente..."}
              className="w-full pl-6 pr-16 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-gray-800 text-[15px]"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2.5 top-2.5 p-2.5 bg-primary text-white rounded-xl hover:bg-primary-hover disabled:opacity-50 disabled:hover:bg-primary transition-colors shadow-sm"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </div>
        </form>
        <p className="text-center text-xs text-gray-400 mt-3">
          El asistente usa Inteligencia Artificial y puede cometer errores. Verifica siempre la información importante.
        </p>
      </div>
    </div>
  );
}
