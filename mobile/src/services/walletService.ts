/**
 * walletService.ts (Mobile)
 * 
 * Handles all wallet and payment operations for mobile app.
 * Mirrors web version for complete feature parity.
 */

import { supabase } from '../lib/supabase';

export interface Wallet {
  userId: string;
  availableBalance: number;
  pendingBalance: number;
  lockedBalance: number;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit' | 'escrow_lock' | 'escrow_release';
  amount: number;
  method?: string;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  createdAt: string;
}

export const walletService = {
  /**
   * Get user's wallet
   */
  async getWallet(userId: string): Promise<Wallet> {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    // If wallet doesn't exist, create it
    if (!data) {
      return this.initializeWallet(userId);
    }

    return {
      userId: data.user_id,
      availableBalance: data.available_balance,
      pendingBalance: data.pending_balance,
      lockedBalance: data.locked_balance,
      currency: data.currency,
    };
  },

  /**
   * Initialize wallet for new user
   */
  async initializeWallet(userId: string): Promise<Wallet> {
    const { data, error } = await supabase
      .from('wallets')
      .insert({
        user_id: userId,
        available_balance: 0,
        pending_balance: 0,
        locked_balance: 0,
        currency: 'INR',
      })
      .select()
      .single();

    if (error) throw error;

    return {
      userId: data.user_id,
      availableBalance: data.available_balance,
      pendingBalance: data.pending_balance,
      lockedBalance: data.locked_balance,
      currency: data.currency,
    };
  },

  /**
   * Get wallet transactions
   */
  async getTransactions(userId: string, limit = 50): Promise<WalletTransaction[]> {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(tx => ({
      id: tx.id,
      userId: tx.user_id,
      type: tx.type,
      amount: tx.amount,
      method: tx.method,
      status: tx.status,
      description: tx.description,
      createdAt: tx.created_at,
    }));
  },

  /**
   * Add funds to wallet (payment gateway integration)
   */
  async addFunds(
    userId: string,
    amount: number,
    paymentMethod: 'razorpay' | 'upi' | 'card',
    transactionId: string
  ): Promise<WalletTransaction> {
    // Create transaction record
    const { data, error } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        type: 'credit',
        amount,
        method: paymentMethod,
        status: 'completed',
        description: `Added funds via ${paymentMethod} (${transactionId})`,
      })
      .select()
      .single();

    if (error) throw error;

    // Update available balance
    const wallet = await this.getWallet(userId);
    await supabase
      .from('wallets')
      .update({
        available_balance: wallet.availableBalance + amount,
      })
      .eq('user_id', userId);

    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      amount: data.amount,
      method: data.method,
      status: data.status,
      description: data.description,
      createdAt: data.created_at,
    };
  },

  /**
   * Withdraw funds from wallet
   */
  async withdrawFunds(
    userId: string,
    amount: number,
    method: 'bank_transfer' | 'upi'
  ): Promise<WalletTransaction> {
    const wallet = await this.getWallet(userId);

    if (wallet.availableBalance < amount) {
      throw new Error('Insufficient available balance');
    }

    // Create transaction
    const { data, error } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        type: 'debit',
        amount,
        method,
        status: 'pending',
        description: `Withdrawal to ${method}`,
      })
      .select()
      .single();

    if (error) throw error;

    // Update available balance and add to pending
    await supabase
      .from('wallets')
      .update({
        available_balance: wallet.availableBalance - amount,
        pending_balance: wallet.pendingBalance + amount,
      })
      .eq('user_id', userId);

    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      amount: data.amount,
      method: data.method,
      status: data.status,
      description: data.description,
      createdAt: data.created_at,
    };
  },

  /**
   * Lock funds in escrow (when contract signed)
   */
  async lockFundsInEscrow(
    userId: string,
    amount: number,
    contractId: string
  ): Promise<void> {
    const wallet = await this.getWallet(userId);

    if (wallet.availableBalance < amount) {
      throw new Error('Insufficient available balance for escrow lock');
    }

    // Create transaction record
    await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        type: 'escrow_lock',
        amount,
        method: 'escrow',
        status: 'completed',
        description: `Escrow locked for contract ${contractId}`,
      });

    // Update wallet balances
    await supabase
      .from('wallets')
      .update({
        available_balance: wallet.availableBalance - amount,
        locked_balance: wallet.lockedBalance + amount,
      })
      .eq('user_id', userId);
  },

  /**
   * Release funds from escrow
   */
  async releaseFundsFromEscrow(
    userId: string,
    amount: number,
    contractId: string
  ): Promise<void> {
    const wallet = await this.getWallet(userId);

    if (wallet.lockedBalance < amount) {
      throw new Error('Insufficient locked balance');
    }

    // Create transaction record
    await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        type: 'escrow_release',
        amount,
        method: 'escrow',
        status: 'completed',
        description: `Escrow released from contract ${contractId}`,
      });

    // Update wallet balances
    await supabase
      .from('wallets')
      .update({
        locked_balance: wallet.lockedBalance - amount,
        available_balance: wallet.availableBalance + amount,
      })
      .eq('user_id', userId);
  },

  /**
   * Get wallet stats
   */
  async getWalletStats(userId: string): Promise<{
    totalEarnings: number;
    totalWithdrawals: number;
    totalFees: number;
    averageTransactionValue: number;
  }> {
    const transactions = await this.getTransactions(userId, 1000);

    const totalEarnings = transactions
      .filter(tx => tx.type === 'credit')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalWithdrawals = transactions
      .filter(tx => tx.type === 'debit')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalFees = transactions
      .filter(tx => tx.description?.includes('fee'))
      .reduce((sum, tx) => sum + tx.amount, 0);

    const averageTransactionValue =
      transactions.length > 0
        ? transactions.reduce((sum, tx) => sum + tx.amount, 0) / transactions.length
        : 0;

    return {
      totalEarnings,
      totalWithdrawals,
      totalFees,
      averageTransactionValue,
    };
  },
};
