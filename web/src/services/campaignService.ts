/**
 * campaignService.ts
 * Real Supabase campaign CRUD — list, get, create, apply, manage applications.
 */
import { supabase } from './supabaseClient';

export const campaignService = {
  /** List all public campaigns (for creators to browse) */
  listPublic: async () => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('visibility', 'public')
      .in('status', ['active', 'in_progress'])
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  /** List campaigns owned by brand (current user) */
  listMyBrandCampaigns: async (userId: string) => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('brand_user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  /** List campaigns a creator has applied to */
  listMyCreatorCampaigns: async (userId: string) => {
    const { data, error } = await supabase
      .from('campaign_applications')
      .select('*, campaigns(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row: Record<string, unknown>) => row.campaigns).filter(Boolean);
  },

  /** Get a single campaign by id */
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error('Campaign not found');
    return data;
  },

  /** Create a new campaign (brand only) */
  create: async (userId: string, payload: Record<string, unknown>) => {
    const { data, error } = await supabase
      .from('campaigns')
      .insert({ ...payload, brand_user_id: userId, status: 'active', visibility: 'public' })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  /** Update campaign */
  update: async (id: string, payload: Record<string, unknown>) => {
    const { error } = await supabase
      .from('campaigns')
      .update(payload)
      .eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  /** Apply to a campaign (creator) */
  apply: async (campaignId: string, userId: string, coverLetter: string) => {
    const { error } = await supabase
      .from('campaign_applications')
      .insert({ campaign_id: campaignId, user_id: userId, cover_letter: coverLetter, status: 'pending' });
    if (error) {
      if (error.code === '23505') throw new Error('You have already applied to this campaign');
      throw new Error(error.message);
    }
    // Increment applications_count
    await supabase.rpc('increment', { table_name: 'campaigns', row_id: campaignId, field: 'applications_count' }).maybeSingle();
    return { success: true };
  },

  /** Get applications for a campaign (brand) */
  getApplications: async (campaignId: string) => {
    const { data, error } = await supabase
      .from('campaign_applications')
      .select('*, profiles(full_name, avatar_url), creators(username, creator_score, creator_tier, niches)')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  /** Update application status (brand approve/reject) */
  updateApplicationStatus: async (applicationId: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('campaign_applications')
      .update({ status })
      .eq('id', applicationId);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  /** Check if current user already applied */
  hasApplied: async (campaignId: string, userId: string) => {
    const { data } = await supabase
      .from('campaign_applications')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('user_id', userId)
      .maybeSingle();
    return !!data;
  },

  /** Get milestones for a campaign */
  getMilestones: async (campaignId: string) => {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('due_date', { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  },
};
