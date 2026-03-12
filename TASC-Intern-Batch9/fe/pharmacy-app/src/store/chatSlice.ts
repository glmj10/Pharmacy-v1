import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import chatService from '../api/chatService';
import { ChatMessage } from '../types/chat';

interface ChatState {
  messages: ChatMessage[];
  sessionId: string;
  loading: boolean;
  error: string | null;
}

// Hàm tạo ID ngẫu nhiên cho session và message
const generateId = () => Math.random().toString(36).substr(2, 9);

const initialState: ChatState = {
  messages: [
    {
      id: 'welcome',
      text: 'Xin chào! Tôi là Dược sĩ ảo AI. Tôi có thể giúp gì cho bạn về sức khỏe hôm nay?',
      sender: 'bot',
      timestamp: Date.now(),
    }
  ],
  sessionId: `session-${Date.now()}-${generateId()}`, // Tạo session ID duy nhất
  loading: false,
  error: null,
};

// Async Thunk: Gửi tin nhắn
export const sendMessageToAgent = createAsyncThunk(
  'chat/sendMessage',
  async (messageText: string, { getState, rejectWithValue }) => {
    const state = getState() as any;
    const sessionId = state.chat.sessionId;

    try {
      const response = await chatService.askAgent({
        sessionId,
        message: messageText
      });
      return response.data.data; // Trả về AgentResponse
    } catch (err: any) {
      return rejectWithValue(err.message || 'Lỗi kết nối tới Dược sĩ ảo');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Action để add tin nhắn của User ngay lập tức (Optimistic UI)
    addUserMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({
        id: generateId(),
        text: action.payload,
        sender: 'user',
        timestamp: Date.now(),
      });
    },
    resetChat: (state) => {
        state.messages = initialState.messages;
        state.sessionId = `session-${Date.now()}-${generateId()}`; // Reset session mới
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessageToAgent.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendMessageToAgent.fulfilled, (state, action) => {
        state.loading = false;
        // Add tin nhắn trả lời của Bot
        state.messages.push({
          id: generateId(),
          text: action.payload.message,
          sender: 'bot',
          timestamp: Date.now(),
        });
      })
      .addCase(sendMessageToAgent.rejected, (state) => {
        state.loading = false;
        // Có thể add tin nhắn báo lỗi nếu muốn
        state.messages.push({
            id: generateId(),
            text: 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.',
            sender: 'bot',
            timestamp: Date.now(),
        });
      });
  },
});

export const { addUserMessage, resetChat } = chatSlice.actions;
export default chatSlice.reducer;