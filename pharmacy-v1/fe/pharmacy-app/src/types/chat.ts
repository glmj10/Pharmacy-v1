// Request gửi lên
export interface AgentMessageRequest {
  sessionId: string;
  message: string;
}

// Response nhận về
export interface AgentResponse {
  message: string;
  // products: ProductResponse[]; // Tạm thời chưa dùng
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}