/**
 * contractService.ts (Mobile)
 * 
 * Handles all contract-related operations for mobile app.
 * Mirrors web version for complete feature parity.
 */

import { supabase } from '../lib/supabase';
import type { Contract, Milestone } from '../types';

export const contractService = {
  /**
   * Get all contracts for a user
   */
  async getUserContracts(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*, campaigns(title)')
      .or(`brand_id.eq.${userId},creator_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get single contract by ID
   */
  async getContractById(contractId: string): Promise<any> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*, campaigns(title)')
      .eq('id', contractId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create new contract
   */
  async createContract(contract: {
    campaignId?: string;
    brandId: string;
    creatorId: string;
    content: any;
  }): Promise<any> {
    const { data, error } = await supabase
      .from('contracts')
      .insert({
        campaign_id: contract.campaignId || null,
        brand_id: contract.brandId,
        creator_id: contract.creatorId,
        content: contract.content,
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update contract status
   */
  async updateContractStatus(
    contractId: string,
    status: 'draft' | 'sent' | 'under_review' | 'signed' | 'executed'
  ): Promise<any> {
    const updates: any = { status };
    if (status === 'signed') {
      updates.signed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('contracts')
      .update(updates)
      .eq('id', contractId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get milestones for a contract
   */
  async getContractMilestones(contractId: string): Promise<Milestone[]> {
    // First get campaign from contract
    const contract = await this.getContractById(contractId);
    if (!contract.campaign_id) return [];

    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('campaign_id', contract.campaign_id)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Update milestone status
   */
  async updateMilestoneStatus(
    milestoneId: string,
    status: 'pending' | 'in_progress' | 'completed' | 'late' | 'disputed'
  ): Promise<any> {
    const updates: any = { status };
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('milestones')
      .update(updates)
      .eq('id', milestoneId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get content submissions for a milestone
   */
  async getMilestoneSubmissions(milestoneId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('content_submissions')
      .select('*')
      .eq('milestone_id', milestoneId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Submit content for a milestone
   */
  async submitContent(submission: {
    milestoneId: string;
    creatorId: string;
    caption: string;
    files: string[];
  }): Promise<any> {
    const { data, error } = await supabase
      .from('content_submissions')
      .insert({
        milestone_id: submission.milestoneId,
        creator_id: submission.creatorId,
        caption: submission.caption,
        files: submission.files,
        status: 'submitted',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Review/approve submission
   */
  async reviewSubmission(
    submissionId: string,
    status: 'approved' | 'changes_requested' | 'in_review' | 'published',
    feedback?: string
  ): Promise<any> {
    const { data, error } = await supabase
      .from('content_submissions')
      .update({
        status,
        feedback: feedback || null,
      })
      .eq('id', submissionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get contract PDF content
   */
  async getContractPDF(contractId: string): Promise<any> {
    const contract = await this.getContractById(contractId);
    return contract.content; // Content is stored as JSONB
  },

  /**
   * Save contract signature
   */
  async saveContractSignature(contractId: string, signatureData: string): Promise<any> {
    const contract = await this.getContractById(contractId);
    const updatedContent = {
      ...contract.content,
      signature: signatureData,
      signedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('contracts')
      .update({
        content: updatedContent,
        status: 'signed',
        signed_at: new Date().toISOString(),
      })
      .eq('id', contractId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
