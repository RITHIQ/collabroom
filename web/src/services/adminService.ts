/**
 * adminService.ts
 * Admin-only operations — platform stats, user management, campaign moderation,
 * dispute handling, announcement publishing.
 */
import { supabase } from './supabaseClient';
import { isMockAuthEnabled } from '../lib/mockAuth';
import { isAdminDemoSession } from '../admin/adminSession';
import { MOCK_CAMPAIGNS, MOCK_CREATORS, MOCK_BRANDS } from '../lib/mockSeedData';

export const adminService = {
  /** Platform overview stats */
  getStats: async () => {
    if (isMockAuthEnabled() || isAdminDemoSession()) {
      return {
        totalUsers: 15,
        activeCampaigns: 4,
        openDisputes: 1,
        totalRevenue: 285000,
      };
    }
    const [usersRes, campaignsRes, disputesRes, txnRes] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('wallet_transactions').select('amount').eq('type', 'credit').eq('status', 'completed'),
    ]);
    const totalRevenue = (txnRes.data ?? []).reduce((sum: number, t: { amount: number }) => sum + Number(t.amount), 0);
    return {
      totalUsers: usersRes.count ?? 0,
      activeCampaigns: campaignsRes.count ?? 0,
      openDisputes: disputesRes.count ?? 0,
      totalRevenue,
    };
  },

  /** List all users with their profiles */
  listUsers: async (page = 1, limit = 20) => {
    if (isMockAuthEnabled() || isAdminDemoSession()) {
      const mockUsers = [
        {
          id: '1',
          user_id: '1',
          role: 'admin',
          full_name: 'System Admin',
          is_verified: true,
          is_blocked: false,
          created_at: new Date().toISOString(),
          auth_user: { email: 'admin@colabroom.app' }
        },
        ...MOCK_CREATORS.map((c, idx) => ({
          id: c.id,
          user_id: c.userId,
          role: 'creator',
          full_name: c.displayName,
          is_verified: c.creatorScore > 85,
          is_blocked: false,
          created_at: new Date(Date.now() - idx * 1000 * 60 * 60 * 24 * 3).toISOString(),
          auth_user: { email: `${c.username}@colabroom.app` },
        })),
        ...MOCK_BRANDS.map((b, idx) => ({
          id: b.id,
          user_id: b.userId,
          role: 'brand',
          full_name: b.companyName,
          is_verified: b.brandScore > 85,
          is_blocked: false,
          created_at: new Date(Date.now() - idx * 1000 * 60 * 60 * 24 * 5).toISOString(),
          auth_user: { email: `${b.handle}@colabroom.app` },
        })),
      ];
      return { data: mockUsers, total: mockUsers.length };
    }
    const from = (page - 1) * limit;
    const { data, error, count } = await supabase
      .from('profiles')
      .select('*, auth_user:user_id(email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);
    if (error) throw new Error(error.message);
    return { data: data ?? [], total: count ?? 0 };
  },

  /** Block / unblock a user */
  setUserBlocked: async (userId: string, blocked: boolean) => {
    if (isMockAuthEnabled() || isAdminDemoSession()) {
      return { success: true };
    }
    const { error } = await supabase
      .from('profiles')
      .update({ is_blocked: blocked })
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  /** Verify a user */
  verifyUser: async (userId: string) => {
    if (isMockAuthEnabled() || isAdminDemoSession()) {
      return { success: true };
    }
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: true })
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  /** List all campaigns for admin */
  listCampaigns: async () => {
    if (isMockAuthEnabled() || isAdminDemoSession()) {
      return MOCK_CAMPAIGNS;
    }
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  /** Update campaign status */
  updateCampaignStatus: async (campaignId: string, status: string) => {
    if (isMockAuthEnabled() || isAdminDemoSession()) {
      return { success: true };
    }
    const { error } = await supabase
      .from('campaigns')
      .update({ status })
      .eq('id', campaignId);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  /** List open disputes */
  listDisputes: async () => {
    if (isMockAuthEnabled() || isAdminDemoSession()) {
      return [
        {
          id: 'disp_mock_1',
          campaign_id: 'camp_mock_boat_audio',
          raised_by: 'cr_mock_arjun',
          reason: 'Late payment release for Milestone 1.',
          status: 'open',
          created_at: new Date().toISOString(),
          campaigns: { title: 'Rockerz ANC — Monsoon campaign', brand_name: 'boAt' }
        }
      ];
    }
    const { data, error } = await supabase
      .from('disputes')
      .select('*, campaigns(title, brand_name)')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  /** Resolve a dispute */
  resolveDispute: async (disputeId: string, resolution: string) => {
    if (isMockAuthEnabled() || isAdminDemoSession()) {
      return { success: true };
    }
    const { error } = await supabase
      .from('disputes')
      .update({ status: 'resolved', resolution, resolved_at: new Date().toISOString() })
      .eq('id', disputeId);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  /** List announcements */
  listAnnouncements: async () => {
    if (isMockAuthEnabled() || isAdminDemoSession()) {
      return [
        {
          id: 'ann_mock_1',
          title: 'Welcome to ColabRoom Admin Panel',
          body: 'Manage users, review campaigns, and resolve disputes in real-time.',
          target_audience: 'all',
          is_published: true,
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ];
    }
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  /** Create and publish announcement */
  createAnnouncement: async (
    createdBy: string,
    title: string,
    body: string,
    targetAudience: 'all' | 'creators' | 'brands',
    publish = true
  ) => {
    if (isMockAuthEnabled() || isAdminDemoSession()) {
      return {
        id: `ann_mock_${Date.now()}`,
        title,
        body,
        target_audience: targetAudience,
        created_by: createdBy,
        is_published: publish,
        published_at: publish ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
      };
    }
    const { data, error } = await supabase
      .from('announcements')
      .insert({
        title,
        body,
        target_audience: targetAudience,
        created_by: createdBy,
        is_published: publish,
        published_at: publish ? new Date().toISOString() : null,
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);

    // Insert notifications for target users if published
    if (publish) {
      let query = supabase.from('profiles').select('user_id');
      if (targetAudience !== 'all') {
        query = query.eq('role', targetAudience === 'creators' ? 'creator' : 'brand');
      }
      const { data: users } = await query;
      if (users && users.length > 0) {
        await supabase.from('notifications').insert(
          users.map((u: { user_id: string }) => ({
            user_id: u.user_id,
            type: 'announcement',
            title,
            body,
            data: { announcement_id: data.id },
          }))
        );
      }
    }
    return data;
  },
};
