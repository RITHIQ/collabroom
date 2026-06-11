/**
 * userService.ts (Mobile)
 * 
 * Handles user profile operations for mobile app.
 * Mirrors web version for complete feature parity.
 */

import { supabase } from '../lib/supabase';
import type { CreatorProfile, BrandProfile } from '../types';

export const userService = {
  /**
   * Get creator profile
   */
  async getCreatorProfile(userId: string): Promise<CreatorProfile> {
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get brand profile
   */
  async getBrandProfile(userId: string): Promise<BrandProfile> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update creator profile
   */
  async updateCreatorProfile(
    userId: string,
    updates: Partial<CreatorProfile>
  ): Promise<CreatorProfile> {
    const { data, error } = await supabase
      .from('creators')
      .update({
        display_name: updates.displayName,
        username: updates.username,
        bio: updates.bio,
        tagline: updates.tagline,
        location: updates.location,
        languages: updates.languages,
        niches: updates.niches,
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update brand profile
   */
  async updateBrandProfile(
    userId: string,
    updates: Partial<BrandProfile>
  ): Promise<BrandProfile> {
    const { data, error } = await supabase
      .from('brands')
      .update({
        company_name: updates.companyName,
        handle: updates.handle,
        industry: updates.industry,
        company_size: updates.companySize,
        website: updates.website,
        description: updates.description,
        preferred_niches: updates.preferredNiches,
        preferred_platforms: updates.preferredPlatforms,
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get user profile (generic)
   */
  async getUserProfile(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update user profile (generic)
   */
  async updateUserProfile(userId: string, updates: any): Promise<any> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: updates.fullName,
        avatar_url: updates.avatarUrl,
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all creators (for brand discovery)
   */
  async getAllCreators(): Promise<CreatorProfile[]> {
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .order('display_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get all brands (for creator discovery)
   */
  async getAllBrands(): Promise<BrandProfile[]> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('company_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Search creators by niche
   */
  async searchCreatorsByNiche(niche: string): Promise<CreatorProfile[]> {
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .contains('niches', [niche]);

    if (error) throw error;
    return data || [];
  },

  /**
   * Search brands by industry
   */
  async searchBrandsByIndustry(industry: string): Promise<BrandProfile[]> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('industry', industry);

    if (error) throw error;
    return data || [];
  },

  /**
   * Get creator by username
   */
  async getCreatorByUsername(username: string): Promise<CreatorProfile> {
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .eq('username', username)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get brand by handle
   */
  async getBrandByHandle(handle: string): Promise<BrandProfile> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('handle', handle)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get notifications for user
   */
  async getNotifications(userId: string, limit = 20): Promise<any[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);

    if (error) throw error;
  },

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<any> {
    // Get profile to determine if creator or brand
    const profile = await this.getUserProfile(userId);
    const role = profile.role;

    if (role === 'creator') {
      const creatorProfile = await this.getCreatorProfile(userId);
      return {
        role: 'creator',
        campaignsCompleted: creatorProfile.completionPercentage,
        onTimeDeliveryRate: creatorProfile.onTimeDeliveryRate,
        creatorScore: creatorProfile.creatorScore,
      };
    } else if (role === 'brand') {
      const brandProfile = await this.getBrandProfile(userId);
      return {
        role: 'brand',
        campaignsCompleted: brandProfile.campaignsCompleted,
        onTimePaymentRate: brandProfile.onTimePaymentRate,
        brandScore: brandProfile.brandScore,
      };
    }

    return { role };
  },
};
