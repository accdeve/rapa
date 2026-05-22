import { supabase } from '../supabase/supabaseClient';
import type { IQuestionRepository } from '@/domain/interfaces/repositories';
import type { Question } from '@/domain/models/Question';
import { mapQuestionToDomain } from '../supabase/mappers';

export class SupabaseQuestionRepository implements IQuestionRepository {
  async create(question: { roomId: string; participantId?: string; content: string }): Promise<Question> {
    const { data, error } = await supabase
      .from('questions')
      .insert({
        room_id: question.roomId,
        participant_id: question.participantId,
        content: question.content,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return mapQuestionToDomain(data);
  }

  async findByRoom(roomId: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapQuestionToDomain);
  }

  async updateStatus(id: string, status: Question['status']): Promise<Question> {
    const { data, error } = await supabase
      .from('questions')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapQuestionToDomain(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (error) throw error;
  }

  subscribeToQuestions(roomId: string, callback: (questions: Question[]) => void): () => void {
    const uniqueId = Math.random().toString(36).substring(2, 10);
    const channel = supabase
      .channel(`questions:${roomId}:${uniqueId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'questions' },
        async (payload) => {
          const newRoomId = payload.new && 'room_id' in payload.new ? (payload.new as any).room_id : null;
          const oldRoomId = payload.old && 'room_id' in payload.old ? (payload.old as any).room_id : null;
          
          if (!newRoomId && !oldRoomId) {
            try {
              const updated = await this.findByRoom(roomId);
              callback(updated);
            } catch (err) {
              console.error("Error in real-time questions sync:", err);
            }
          } else if (newRoomId === roomId || oldRoomId === roomId) {
            try {
              const updated = await this.findByRoom(roomId);
              callback(updated);
            } catch (err) {
              console.error("Error in real-time questions sync:", err);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}
