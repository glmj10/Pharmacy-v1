import axiosClient from './axiosClient';
import type { ChatMessage, AgentMessageRequest, AgentResponse } from '../types/chat.types';
import type { ApiResponse } from '../types';

// Hàm helper lấy SessionID (Nếu chưa có thì tạo mới)
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('chat_session_id');
  if (!sessionId) {
    // Tạo random ID đơn giản
    sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('chat_session_id', sessionId);
  }
  return sessionId;
};

const chatService = {
  // Gửi tin nhắn và nhận phản hồi
  sendMessage: async (text: string): Promise<ChatMessage> => {
    
    // 1. Chuẩn bị payload
    const payload: AgentMessageRequest = {
      sessionId: getSessionId(),
      message: text
    };

    try {
      // 2. Gọi API thật
      // API: POST /agents/ask
      const res = await axiosClient.post<ApiResponse<AgentResponse>>('/agents/ask', payload);
      
      // 3. Lấy dữ liệu từ response
      const data = res.data;
      console.log(res.data)

      // 4. Map dữ liệu Backend sang cấu trúc ChatMessage của Frontend
      return {
        id: Date.now().toString(),
        text: data.message || "Xin lỗi, tôi không nhận được phản hồi.", // Lấy tin nhắn từ bot
        sender: 'bot',
        timestamp: new Date()
      };

    } catch (error) {
      console.error("Chatbot API Error:", error);
      return {
        id: Date.now().toString(),
        text: "Hiện tại hệ thống đang bận, vui lòng thử lại sau.",
        sender: 'bot',
        timestamp: new Date()
      };
    }
  }
};

export default chatService;