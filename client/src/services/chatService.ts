import axiosHostClient from '../api/axiosHostClient';
import axiosUserClient from '../api/axiosUserClient'

export const chatRepository = {
  fetchMessages: async (receiverId: string, eventId: string, role: 'user' | 'host') => {
    const client = role === 'host' ? axiosHostClient : axiosUserClient;
    
    const response = await client.get(`/chat/${receiverId}/event/${eventId}`);
    console.log(response)
    return response.data.messages;
  },

  sendMessage: async (hostId: string, eventId: string, content: string, role: 'user' | 'host') => {
    const client = role === 'host' ? axiosHostClient : axiosUserClient;
    const response = await client.post(`/chat/${hostId}/event/${eventId}`, { content });
    return response.data.message;
  },
  listConversations: async (role: 'user' | 'host') => {
    const client = role === 'host' ? axiosHostClient : axiosUserClient;
    const response = await client.get('/conversations', {
      /* params: { participantId }, */
    });
    console.log(response.data)
    return response.data.conversations as Array<{
      eventId: string;
      otherId: string;
      otherName: string;
      lastMessage: string;
      updatedAt: string;
      unreadCount: number;
    }>;
  },
};

export default chatRepository;