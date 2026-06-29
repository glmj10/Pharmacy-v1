export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Request gửi lên Backend
export interface AgentMessageRequest {
  sessionId: string;
  message: string;
}

// Response nhận về từ Backend
export interface AgentResponse {
  message: string;
  products: any[]; // Bạn có thể thay 'any' bằng Product[] nếu muốn map sản phẩm sau này
}