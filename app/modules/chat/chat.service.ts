import { supabase } from '@/lib/supabase';
import { Message, ChatSession } from './chat.types';

export const chatService = {
  async getMessages(sessionId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data as Message[];
  },

  async sendMessage(message: Partial<Message>): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return null;
    }

    return data as Message;
  },

  async getSessions(userId: string): Promise<ChatSession[]> {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .or(`patient_id.eq.${userId},nutritionist_id.eq.${userId}`);

    if (error) {
      console.error('Error fetching chat sessions:', error);
      return [];
    }

    return data as ChatSession[];
  }
};
