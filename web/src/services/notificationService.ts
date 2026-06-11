/**
 * notificationService.ts
 * Real Supabase notifications — fetch, mark read, mark all read.
 */
import { supabase } from './supabaseClient';

export const notificationService = {
  /** Fetch notifications for current user */
  list: async (userId: string, limit = 20) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  /** Count unread notifications */
  countUnread: async (userId: string) => {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) return 0;
    return count ?? 0;
  },

  /** Mark a single notification as read */
  markRead: async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  /** Mark all notifications as read for a user */
  markAllRead: async (userId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  /** Insert a notification (server-side use) */
  insert: async (userId: string, type: string, title: string, body: string, data?: Record<string, unknown>) => {
    const { error } = await supabase
      .from('notifications')
      .insert({ user_id: userId, type, title, body, data: data ?? {} });
    if (error) throw new Error(error.message);
    return { success: true };
  },
};
