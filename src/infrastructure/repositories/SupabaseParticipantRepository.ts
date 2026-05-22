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
    console.log(`[Participant Realtime] Initiating subscription channel for room: ${roomId}`);
    const channel = supabase
      .channel(`participants:${roomId}:${uniqueId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants' },
        async (payload) => {
          console.log(`[Participant Realtime] Received database event:`, payload.eventType, payload);
          const newRoomId = payload.new && 'room_id' in payload.new ? (payload.new as any).room_id : null;
          const oldRoomId = payload.old && 'room_id' in payload.old ? (payload.old as any).room_id : null;
          
          if (!newRoomId && !oldRoomId) {
            try {
              const updated = await this.findByRoom(roomId);
              callback(updated);
            } catch (err) {
              console.error("[Participant Realtime] Error fetching on replica sync:", err);
            }
          } else if (newRoomId === roomId || oldRoomId === roomId) {
            try {
              const updated = await this.findByRoom(roomId);
              callback(updated);
            } catch (err) {
              console.error("[Participant Realtime] Error fetching on change sync:", err);
            }
          }
        }
      )
      .subscribe((status, err) => {
        console.log(`[Participant Realtime] Subscription status for room ${roomId}:`, status);
        if (err) {
          console.error(`[Participant Realtime] Subscription error:`, err);
        }
        if (status === 'SUBSCRIBED') {
          console.log(`[Participant Realtime] Successfully listening to public.participants for room: ${roomId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.warn(`[Participant Realtime] Subscription received CHANNEL_ERROR. Make sure Realtime is enabled in your Supabase Dashboard for public.participants table!`);
        }
      });

    return () => {
      console.log(`[Participant Realtime] Removing subscription channel for room: ${roomId}`);
      supabase.removeChannel(channel);
    };
  }
}
