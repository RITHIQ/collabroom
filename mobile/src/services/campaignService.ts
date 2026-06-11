/**
 * campaignService.ts (Mobile)
 * 
 * Handles all campaign-related API calls for mobile app.
 * Mirrors the web version to ensure feature parity.
 */

import { supabase } from '../lib/supabase';
import type { Campaign } from '../types';

export const campaignService = {
  /**
   * Get all active campaigns (for brand discovery)
   */
  async getAllCampaigns(): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*, brands(company_name)')
      .eq('status', 'active')
      .eq('visibility', 'public');

    if (error) throw error;
    return data || [];
  },

  /**
   * Get campaigns by current user (for brand viewing own campaigns)
   */
  async getUserCampaigns(userId: string): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('brand_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get single campaign by ID
   */
  async getCampaignById(campaignId: string): Promise<Campaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*, brands(company_name)')
      .eq('id', campaignId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create new campaign (for brands)
   */
  async createCampaign(campaign: Partial<Campaign>, userId: string): Promise<Campaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        brand_user_id: userId,
        title: campaign.title,
        description: campaign.description,
        niche: campaign.niche,
        platforms: campaign.platforms,
        content_formats: campaign.contentFormats,
        start_date: campaign.startDate,
        end_date: campaign.endDate,
        budget: campaign.budget,
        status: 'draft',
        visibility: campaign.visibility || 'public',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update campaign
   */
  async updateCampaign(campaignId: string, updates: Partial<Campaign>): Promise<Campaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .update({
        title: updates.title,
        description: updates.description,
        niche: updates.niche,
        platforms: updates.platforms,
        content_formats: updates.contentFormats,
        start_date: updates.startDate,
        end_date: updates.endDate,
        budget: updates.budget,
        status: updates.status,
      })
      .eq('id', campaignId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get campaign applications for a campaign
   */
  async getCampaignApplications(campaignId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('campaign_applications')
      .select('*, profiles(full_name), creators(display_name)')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Apply to a campaign (creator applies to brand campaign)
   */
  async applyToCampaign(campaignId: string, userId: string, message: string): Promise<any> {
    const { data, error } = await supabase
      .from('campaign_applications')
      .insert({
        campaign_id: campaignId,
        user_id: userId,
        message,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Check if creator already applied to campaign
   */
  async hasApplied(campaignId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('campaign_applications')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return !!data;
  },

  /**
   * Approve/reject application
   */
  async updateApplicationStatus(
    applicationId: string,
    status: 'approved' | 'rejected' | 'pending'
  ): Promise<any> {
    const { data, error } = await supabase
      .from('campaign_applications')
      .update({ status })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
