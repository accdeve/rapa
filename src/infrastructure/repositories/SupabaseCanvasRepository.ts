import { supabase } from '../supabase/supabaseClient';
import type { ICanvasRepository } from '@/domain/interfaces/repositories';
import type { CanvasItem } from '@/domain/models/Canvas';
import { mapCanvasItemToDomain } from '../supabase/mappers';

export class SupabaseCanvasRepository implements ICanvasRepository {
  async getItems(roomId: string): Promise<CanvasItem[]> {
    const { data, error } = await supabase
      .from('canvas_items')
      .select('*')
      .eq('room_id', roomId);

    if (error) throw error;
    return (data || []).map(mapCanvasItemToDomain);
  }

  async saveItem(item: Omit<CanvasItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<CanvasItem> {
    const { data, error } = await supabase
      .from('canvas_items')
      .insert({
        room_id: item.roomId,
        type: item.type,
        parent_id: item.parentId,
        content: item.content,
        color: item.color,
        x_pos: item.xPos,
        y_pos: item.yPos,
        metadata: item.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;
    return mapCanvasItemToDomain(data);
  }

  async updateItemPos(id: string, x: number, y: number): Promise<void> {
    const { error } = await supabase
      .from('canvas_items')
      .update({
        x_pos: x,
        y_pos: y,
      })
      .eq('id', id);

    if (error) throw error;
  }

  async updateItemParent(id: string, parentId: string): Promise<void> {
    const { error } = await supabase
      .from('canvas_items')
      .update({
        parent_id: parentId,
      })
      .eq('id', id);

    if (error) throw error;
  }

  async updateItemContent(id: string, content: string): Promise<void> {
    const { error } = await supabase
      .from('canvas_items')
      .update({
        content: content,
      })
      .eq('id', id);

    if (error) throw error;
  }

  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('canvas_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  subscribeToCanvas(roomId: string, callback: (items: CanvasItem[]) => void): () => void {
    const uniqueId = Math.random().toString(36).substring(2, 10);
    console.log(`[Canvas Realtime] Initiating subscription channel for room: ${roomId}`);
    const channel = supabase
      .channel(`canvas:${roomId}:${uniqueId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'canvas_items' },
        async (payload) => {
          console.log(`[Canvas Realtime] Received database event:`, payload.eventType, payload);
          const newRoomId = payload.new && 'room_id' in payload.new ? (payload.new as any).room_id : null;
          const oldRoomId = payload.old && 'room_id' in payload.old ? (payload.old as any).room_id : null;
          
          if (!newRoomId && !oldRoomId) {
            // Replica identity default on delete: fetch to stay completely in sync
            try {
              const updated = await this.getItems(roomId);
              callback(updated);
            } catch (err) {
              console.error("[Canvas Realtime] Error fetching on replica sync:", err);
            }
          } else if (newRoomId === roomId || oldRoomId === roomId) {
            try {
              const updated = await this.getItems(roomId);
              callback(updated);
            } catch (err) {
              console.error("[Canvas Realtime] Error fetching on change sync:", err);
            }
          }
        }
      )
      .subscribe((status, err) => {
        console.log(`[Canvas Realtime] Subscription status for room ${roomId}:`, status);
        if (err) {
          console.error(`[Canvas Realtime] Subscription error:`, err);
        }
        if (status === 'SUBSCRIBED') {
          console.log(`[Canvas Realtime] Successfully listening to public.canvas_items for room: ${roomId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.warn(`[Canvas Realtime] Subscription received CHANNEL_ERROR. Make sure Realtime is enabled in your Supabase Dashboard for public.canvas_items table!`);
        }
      });

    return () => {
      console.log(`[Canvas Realtime] Removing subscription channel for room: ${roomId}`);
      supabase.removeChannel(channel);
    };
  }
}
