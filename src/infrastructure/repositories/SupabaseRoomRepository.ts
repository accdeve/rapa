import { supabase } from '../supabase/supabaseClient';
import type { IRoomRepository } from '@/domain/interfaces/repositories';
import type { Room, RoomCreateInput, RoomUpdateInput } from '@/domain/models/Room';
import { mapRoomToDomain } from '../supabase/mappers';

export class SupabaseRoomRepository implements IRoomRepository {
  async create(input: RoomCreateInput & { code: string; gmId: string }): Promise<Room> {
    const payload: Record<string, unknown> = {
      code: input.code,
      title: input.title,
      session_type: input.sessionType,
      max_participants: input.maxParticipants,
      status: 'waiting',
    };
    // Only include gm_id if it's a valid non-empty value
    if (input.gmId && input.gmId.trim() !== '') {
      payload.gm_id = input.gmId;
    }

    const { data, error } = await supabase
      .from('rooms')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return mapRoomToDomain(data);
  }

  async findById(id: string): Promise<Room | null> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapRoomToDomain(data) : null;
  }

  async findByCode(code: string): Promise<Room | null> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (error) throw error;
    return data ? mapRoomToDomain(data) : null;
  }

  async update(id: string, input: RoomUpdateInput): Promise<Room> {
    const updateData: any = {};
    if (input.title) updateData.title = input.title;
    if (input.status) updateData.status = input.status;
    if (input.maxParticipants) updateData.max_participants = input.maxParticipants;
    if (input.sessionType) updateData.session_type = input.sessionType;

    const { data, error } = await supabase
      .from('rooms')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapRoomToDomain(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('rooms').delete().eq('id', id);
    if (error) throw error;
  }

  async listActive(): Promise<Room[]> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .neq('status', 'finished')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapRoomToDomain);
  }

  async listByGm(gmId: string): Promise<Room[]> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('gm_id', gmId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapRoomToDomain);
  }

  subscribeToRoom(id: string, callback: (room: Room) => void): () => void {
    const uniqueId = Math.random().toString(36).substring(2, 10);
    const channel = supabase
      .channel(`room:${id}:${uniqueId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${id}` },
        (payload) => {
          callback(mapRoomToDomain(payload.new));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}
