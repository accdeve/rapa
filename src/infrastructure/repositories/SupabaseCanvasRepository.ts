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
    const channel = supabase
      .channel(`canvas:${roomId}:${uniqueId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'canvas_items', filter: `room_id=eq.${roomId}` },
        async () => {
          const updated = await this.getItems(roomId);
          callback(updated);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}
