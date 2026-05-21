import { supabase } from '../supabase/supabaseClient';
import type { IParticipantRepository } from '@/domain/interfaces/repositories';
import type { RoomParticipant } from '@/domain/models/Room';
import { mapParticipantToDomain } from '../supabase/mappers';

export class SupabaseParticipantRepository implements IParticipantRepository {
  async add(participant: { roomId: string; userId?: string; avatarSeed: string }): Promise<RoomParticipant> {
    const { data, error } = await supabase
      .from('participants')
      .insert({
        room_id: participant.roomId,
        user_id: participant.userId,
        avatar_seed: participant.avatarSeed,
      })
      .select()
      .single();

    if (error) throw error;
    return mapParticipantToDomain(data);
  }

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('participants').delete().eq('id', id);
    if (error) throw error;
  }

  async findByRoom(roomId: string): Promise<RoomParticipant[]> {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('room_id', roomId);

    if (error) throw error;
    return (data || []).map(mapParticipantToDomain);
  }

  async updateMute(id: string, isMuted: boolean): Promise<void> {
    const { error } = await supabase
      .from('participants')
      .update({ is_muted: isMuted })
      .eq('id', id);

    if (error) throw error;
  }

  subscribeToParticipants(roomId: string, callback: (participants: RoomParticipant[]) => void): () => void {
    const uniqueId = Math.random().toString(36).substring(2, 10);
    const channel = supabase
      .channel(`participants:${roomId}:${uniqueId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants', filter: `room_id=eq.${roomId}` },
        async () => {
          const updated = await this.findByRoom(roomId);
          callback(updated);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}
