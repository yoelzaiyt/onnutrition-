'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Send, 
  Image as ImageIcon, 
  MoreVertical, 
  Search,
  Check,
  CheckCheck,
  User,
  Paperclip,
  Smile,
  MessageSquare
} from 'lucide-react';
import { Message, ChatSession } from './chat.types';
import { chatService } from './chat.service';

interface ChatPageProps {
  currentUserId: string;
  userRole: 'patient' | 'nutri';
  onBack: () => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ currentUserId, userRole, onBack }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      try {
        const data = await chatService.getSessions(currentUserId);
        if (data.length > 0) {
          setSessions(data);
          setSelectedSession(data[0]);
        } else {
          // Demo sessions
          const demoSessions: ChatSession[] = [
            {
              id: 's1',
              patient_id: userRole === 'nutri' ? 'p1' : currentUserId,
              nutritionist_id: userRole === 'nutri' ? currentUserId : 'n1',
              unread_count: 2,
              last_message: {
                id: 'm1',
                sender_id: 'p1',
                receiver_id: currentUserId,
                content: 'Olá Nutri, tudo bem? Tenho uma dúvida sobre o almoço.',
                created_at: new Date().toISOString(),
                read: false
              }
            }
          ];
          setSessions(demoSessions);
          setSelectedSession(demoSessions[0]);
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [currentUserId, userRole]);

  useEffect(() => {
    if (selectedSession) {
      const fetchMessages = async () => {
        try {
          const data = await chatService.getMessages(selectedSession.id);
          if (data.length > 0) {
            setMessages(data);
          } else {
            // Demo messages
            const demoMessages: Message[] = [
              {
                id: 'm1',
                sender_id: userRole === 'nutri' ? 'p1' : 'n1',
                receiver_id: currentUserId,
                content: 'Olá! Como você está hoje?',
                created_at: new Date(Date.now() - 3600000).toISOString(),
                read: true
              },
              {
                id: 'm2',
                sender_id: currentUserId,
                receiver_id: userRole === 'nutri' ? 'p1' : 'n1',
                content: 'Tudo bem! Seguindo o plano à risca.',
                created_at: new Date(Date.now() - 3000000).toISOString(),
                read: true
              },
              {
                id: 'm3',
                sender_id: userRole === 'nutri' ? 'p1' : 'n1',
                receiver_id: currentUserId,
                content: 'Excelente! Vi que você registrou o café da manhã corretamente.',
                created_at: new Date(Date.now() - 2000000).toISOString(),
                read: true
              }
            ];
            setMessages(demoMessages);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };
      fetchMessages();
    }
  }, [selectedSession, currentUserId, userRole]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedSession) return;

    const message: Partial<Message> = {
      sender_id: currentUserId,
      receiver_id: userRole === 'nutri' ? selectedSession.patient_id : selectedSession.nutritionist_id,
      content: newMessage,
      created_at: new Date().toISOString(),
      read: false
    };

    // Optimistic update
    setMessages(prev => [...prev, { ...message, id: Math.random().toString() } as Message]);
    setNewMessage('');

    try {
      await chatService.sendMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#22B391] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-[#22B391] transition-all shadow-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-[#0B2B24] tracking-tight">Mensagens</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Chat em tempo real</p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden flex">
        {/* Sidebar - Sessions */}
        <div className="w-80 border-r border-slate-100 flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar conversa..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border-none text-sm font-bold focus:ring-2 focus:ring-[#22B391]/20"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className={`w-full p-6 flex items-center gap-4 transition-all border-b border-slate-50 text-left ${
                  selectedSession?.id === session.id ? 'bg-[#22B391]/5 border-l-4 border-l-[#22B391]' : 'hover:bg-slate-50'
                }`}
              >
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-black text-[#0B2B24] truncate">
                      {userRole === 'nutri' ? 'Paciente Demo' : 'Nutricionista Demo'}
                    </p>
                    {session.last_message && (
                      <span className="text-[10px] font-bold text-slate-400">
                        {new Date(session.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate font-medium">
                    {session.last_message?.content || 'Inicie uma conversa'}
                  </p>
                </div>
                {session.unread_count > 0 && (
                  <div className="w-5 h-5 bg-[#22B391] rounded-full flex items-center justify-center text-[10px] font-black text-white">
                    {session.unread_count}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50/30">
          {selectedSession ? (
            <>
              {/* Chat Header */}
              <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#22B391]/10 rounded-xl flex items-center justify-center text-[#22B391]">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-black text-[#0B2B24]">
                      {userRole === 'nutri' ? 'Paciente Demo' : 'Nutricionista Demo'}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Online Agora</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-[#0B2B24] transition-all">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {messages.map((msg, index) => {
                  const isMine = msg.sender_id === currentUserId;
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] group ${isMine ? 'items-end' : 'items-start'}`}>
                        <div className={`p-4 rounded-2xl text-sm font-bold leading-relaxed shadow-sm ${
                          isMine 
                            ? 'bg-[#0B2B24] text-white rounded-tr-none' 
                            : 'bg-white text-[#0B2B24] border border-slate-100 rounded-tl-none'
                        }`}>
                          {msg.content}
                          <div className={`flex items-center justify-end gap-1 mt-2 ${isMine ? 'text-white/50' : 'text-slate-400'}`}>
                            <span className="text-[9px] font-black uppercase tracking-widest">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMine && (
                              msg.read ? <CheckCheck className="w-3 h-3 text-[#22B391]" /> : <Check className="w-3 h-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 bg-white border-t border-slate-100">
                <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button type="button" className="p-3 text-slate-400 hover:text-[#22B391] transition-all rounded-xl hover:bg-slate-50">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button type="button" className="p-3 text-slate-400 hover:text-[#22B391] transition-all rounded-xl hover:bg-slate-50">
                      <ImageIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      className="w-full pl-4 pr-12 py-4 bg-slate-50 rounded-2xl border-none text-sm font-bold focus:ring-2 focus:ring-[#22B391]/20"
                    />
                    <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#22B391] transition-all">
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>
                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-4 bg-[#22B391] text-white rounded-2xl shadow-xl shadow-[#22B391]/20 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mb-6 border border-slate-100">
                <MessageSquare className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-black text-[#0B2B24] mb-2">Sua Central de Mensagens</h3>
              <p className="text-slate-400 text-sm font-bold max-w-xs">
                Selecione uma conversa ao lado para iniciar o atendimento ou tirar dúvidas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
