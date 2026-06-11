/**
 * userService.ts
 * User profile CRUD — read/update creator and brand profiles from Supabase.
 */
import { supabase } from './supabaseClient';

export const userService = {
  /** Get current user's profile row */
  getMyProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  },

  /** Get creator profile for current user */
  getMyCreatorProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  },

  /** Get brand profile for current user */
  getMyBrandProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  },

  /** Upsert creator profile */
  upsertCreatorProfile: async (userId: string, data: Record<string, unknown>) => {
    const { error } = await supabase
      .from('creators')
      .upsert({ user_id: userId, ...data, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    if (error) throw new Error(error.message);
    return { success: true };
  },

  /** Upsert brand profile */
  upsertBrandProfile: async (userId: string, data: Record<string, unknown>) => {
    const { error } = await supabase
      .from('brands')
      .upsert({ user_id: userId, ...data, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    if (error) throw new Error(error.message);
    return { success: true };
  },

  /** Update base profile (avatar, display name) */
  updateProfile: async (userId: string, data: { full_name?: string; avatar_url?: string }) => {
    const { error } = await supabase
      .from('profiles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    return { success: true };
  },
};
