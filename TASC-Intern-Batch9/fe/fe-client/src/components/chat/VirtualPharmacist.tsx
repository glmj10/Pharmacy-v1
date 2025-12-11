import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Minus } from 'lucide-react';
import type { ChatMessage } from '../../types/chat.types';
import chatService from '../../api/chatService';
import { cn } from '../../lib/utils';

const VirtualPharmacist: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      text: 'Xin chào! Tôi là trợ lý sức khỏe ảo. Bạn đang cảm thấy thế nào hoặc cần tìm thuốc gì?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Ref để tự động cuộn xuống cuối khung chat
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    // 1. Thêm tin nhắn của User
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true); // Hiện trạng thái bot đang gõ

    try {
      // 2. Gọi API lấy phản hồi
      const botResponse = await chatService.sendMessage(userMsg.text);
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end font-sans">
      
      {/* 1. KHUNG CHAT WINDOW */}
      <div 
        className={cn(
          "bg-white w-[350px] md:w-[380px] h-[500px] rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right mb-4",
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-0 pointer-events-none h-0 mb-0"
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
               <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Dược sĩ AI</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-xs opacity-90">Luôn sẵn sàng</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded transition">
              <Minus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={cn("flex gap-2 max-w-[85%]", msg.sender === 'user' ? "ml-auto flex-row-reverse" : "")}
            >
              {/* Avatar */}
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                msg.sender === 'bot' ? "bg-blue-100 text-primary" : "bg-gray-200 text-gray-600"
              )}>
                {msg.sender === 'bot' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>

              {/* Bubble */}
              <div className={cn(
                "p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                msg.sender === 'bot' 
                  ? "bg-white text-gray-800 rounded-tl-none border border-gray-100" 
                  : "bg-blue-600 text-white rounded-tr-none"
              )}>
                {msg.text}
                <div className={cn("text-[10px] mt-1 opacity-70", msg.sender === 'user' ? "text-blue-100 text-right" : "text-gray-400")}>
                  {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
             <div className="flex gap-2 max-w-[85%]">
               <div className="w-8 h-8 rounded-full bg-blue-100 text-primary flex items-center justify-center shrink-0 mt-1">
                 <Bot className="w-5 h-5" />
               </div>
               <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-1">
                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 shrink-0">
          <div className="relative flex items-center">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Nhập triệu chứng hoặc câu hỏi..." 
              className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
            />
            <button 
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="absolute right-2 p-2 bg-primary text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-primary transition shadow-md"
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <div className="text-[10px] text-center text-gray-400 mt-2">
            Trợ lý ảo hỗ trợ thông tin tham khảo, không thay thế bác sĩ.
          </div>
        </form>
      </div>

      {/* 2. FLOATING BUTTON (NÚT MỞ CHAT) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 relative group",
          isOpen ? "bg-gray-200 text-gray-600 rotate-90" : "bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
        
        {/* Tooltip khi chưa mở */}
        {!isOpen && (
          <span className="absolute right-full mr-4 bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Chat với Dược sĩ
          </span>
        )}

        {/* Notification Dot */}
        {!isOpen && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-ping"></span>
        )}
        {!isOpen && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></span>
        )}
      </button>
    </div>
  );
};

export default VirtualPharmacist;