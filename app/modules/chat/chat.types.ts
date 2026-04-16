export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  read: boolean;
}

export interface ChatSession {
  id: string;
  patient_id: string;
  nutritionist_id: string;
  last_message?: Message;
  unread_count: number;
}
