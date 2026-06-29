import { ApiResponse } from '../types';
import { AgentMessageRequest, AgentResponse } from '../types/chat';
import axiosClient from './axiosClient';

const chatApi = {
  askAgent: async (payload: AgentMessageRequest) => {
    return axiosClient.post<ApiResponse<AgentResponse>>('/agents/ask', payload);
  }
};

export default chatApi;