import {
  Client,
  AccountId,
  PrivateKey,
  TransferTransaction,
  TokenId,
  Hbar,
  Status,
} from '@hashgraph/sdk';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';
import Payment from '../models/Payment';

class HederaService {
  private client: Client;
  private operatorId!: AccountId;
  private operatorKey!: PrivateKey;
  private usdcTokenId!: TokenId;

  /** True when operator credentials + USDC token are available. */
  readonly usdcConfigured: boolean;
  /** True when at minimum operator credentials are available (needed for HBAR). */
  readonly hbarConfigured: boolean;

  constructor() {
    this.usdcConfigured =
      !!(env.hedera.operatorId && env.hedera.operatorKey && env.hedera.usdcTokenId);
    this.hbarConfigured = !!(env.hedera.operatorId && env.hedera.operatorKey);

    if (!this.hbarConfigured) {
      logger.warn('Hedera credentials not configured — payment features disabled');
    } else if (!this.usdcConfigured) {
      logger.warn('Hedera USDC token not configured — USDC payments disabled');
    }

    this.client =
      env.hedera.network === 'mainnet' ? Client.forMainnet() : Client.forTestnet();

    if (env.hedera.operatorId && env.hedera.operatorKey) {
      this.operatorId = AccountId.fromString(env.hedera.operatorId);
      this.operatorKey = PrivateKey.fromStringDer(env.hedera.operatorKey);
      this.client.setOperator(this.operatorId, this.operatorKey);
    }

    if (env.hedera.usdcTokenId) {
      this.usdcTokenId = TokenId.fromString(env.hedera.usdcTokenId);
    }
  }

  /**
   * Send USDC **from the platform operator account** to any Hedera account.
   * Used for worker payouts and escrow refunds.
   */
  async sendFromPlatform(
    toAccountId: string,
    amount: number,
    memo: string,
  ): Promise<string> {
    if (!this.usdcConfigured) {
      throw new AppError('Hedera not configured', 500);
    }
    try {
      const tokenAmount = Math.round(amount * 1_000_000); // USDC has 6 decimals

      const transaction = new TransferTransaction()
        .addTokenTransfer(this.usdcTokenId, this.operatorId, -tokenAmount)
        .addTokenTransfer(this.usdcTokenId, AccountId.fromString(toAccountId), tokenAmount)
        .setTransactionMemo(memo)
        .freezeWith(this.client);

      const signedTx = await transaction.sign(this.operatorKey);
      const response = await signedTx.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      if (receipt.status !== Status.Success) {
        throw new AppError(`Hedera transfer failed: ${receipt.status}`, 500);
      }

      const txId = response.transactionId.toString();
      logger.info(`Platform → ${toAccountId}: ${amount} USDC — ${txId} — ${memo}`);
      return txId;
    } catch (error) {
      logger.error('sendFromPlatform failed', error);
      throw error instanceof AppError
        ? error
        : new AppError('Platform payment failed. Please try again.', 500);
    }
  }

  /**
   * Release escrow to a worker minus the platform commission.
   * Returns `{ txId, workerAmount, commissionAmount }`.
   */
  async releaseToWorker(
    workerHederaId: string,
    rewardAmount: number,
    commissionRate: number,
    memo: string,
  ): Promise<{ txId: string; workerAmount: number; commissionAmount: number }> {
    const commissionAmount = parseFloat((rewardAmount * commissionRate).toFixed(6));
    const workerAmount = parseFloat((rewardAmount - commissionAmount).toFixed(6));

    const txId = await this.sendFromPlatform(workerHederaId, workerAmount, memo);
    // Commission remains in the operator (platform) account automatically.
    return { txId, workerAmount, commissionAmount };
  }

  /**
   * Verify that a Hedera transaction exists and transferred at least `minAmount`
   * USDC from `fromAccountId` via the Hedera Mirror Node REST API.
   * Returns true/false — failures are non-fatal (logged as warnings).
   */
  async verifyDeposit(
    txId: string,
    fromAccountId: string,
    minAmount: number,
  ): Promise<boolean> {
    const network = env.hedera.network === 'mainnet' ? 'mainnet-public' : 'testnet';
    // Mirror Node expects timestamp-based IDs like "0.0.xxx@seconds.nanos"
    // normalise "@" → "-" for URL
    const normalised = txId.replace('@', '-');
    const url = `https://${network}.mirrornode.hedera.com/api/v1/transactions/${encodeURIComponent(normalised)}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        logger.warn(`Mirror node returned ${res.status} for tx ${txId}`);
        return false;
      }
      const body = (await res.json()) as any;
      const tokenTransfers: any[] = body.transactions?.[0]?.token_transfers ?? [];
      const usdcId = env.hedera.usdcTokenId;
      // Look for a negative transfer from the requester's account for the USDC token
      const debit = tokenTransfers.find(
        (t) =>
          t.token_id === usdcId &&
          t.account === fromAccountId &&
          t.amount < 0 &&
          Math.abs(t.amount) >= Math.round(minAmount * 1_000_000),
      );
      return !!debit;
    } catch (err) {
      logger.warn('Mirror node verification failed (non-fatal)', err);
      return false;
    }
  }

  /**
   * Query the USDC token balance for a Hedera account.
   */
  async getUsdcBalance(accountId: string): Promise<number> {
    if (!this.usdcConfigured) return 0;
    try {
      const { AccountBalanceQuery } = await import('@hashgraph/sdk');
      const balance = await new AccountBalanceQuery()
        .setAccountId(AccountId.fromString(accountId))
        .execute(this.client);

      const tokenBalance = balance.tokens?.get(this.usdcTokenId);
      return tokenBalance ? tokenBalance.toNumber() / 1_000_000 : 0;
    } catch (error) {
      logger.error(`Failed to fetch USDC balance for ${accountId}`, error);
      throw new AppError('Unable to fetch balance', 500);
    }
  }

  /**
   * Send HBAR **from the platform operator account** to any Hedera account.
   * `amountHbar` is in whole HBAR (e.g. 5.5 = 5.5 ℏ).
   */
  async sendHbarFromPlatform(
    toAccountId: string,
    amountHbar: number,
    memo: string,
  ): Promise<string> {
    if (!this.hbarConfigured) {
      throw new AppError('Hedera not configured', 500);
    }
    try {
      const tinybar = Math.round(amountHbar * 1e8);
      const transaction = new TransferTransaction()
        .addHbarTransfer(this.operatorId, Hbar.fromTinybars(-tinybar))
        .addHbarTransfer(AccountId.fromString(toAccountId), Hbar.fromTinybars(tinybar))
        .setTransactionMemo(memo)
        .freezeWith(this.client);

      const signedTx = await transaction.sign(this.operatorKey);
      const response = await signedTx.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      if (receipt.status !== Status.Success) {
        throw new AppError(`Hedera HBAR transfer failed: ${receipt.status}`, 500);
      }

      const txId = response.transactionId.toString();
      logger.info(`Platform → ${toAccountId}: ${amountHbar} HBAR — ${txId} — ${memo}`);
      return txId;
    } catch (error) {
      logger.error('sendHbarFromPlatform failed', error);
      throw error instanceof AppError
        ? error
        : new AppError('Platform HBAR payment failed. Please try again.', 500);
    }
  }

  /**
   * Release HBAR escrow to a worker minus the platform commission.
   */
  async releaseHbarToWorker(
    workerHederaId: string,
    rewardAmountHbar: number,
    commissionRate: number,
    memo: string,
  ): Promise<{ txId: string; workerAmount: number; commissionAmount: number }> {
    const commissionAmount = parseFloat((rewardAmountHbar * commissionRate).toFixed(8));
    const workerAmount = parseFloat((rewardAmountHbar - commissionAmount).toFixed(8));
    const txId = await this.sendHbarFromPlatform(workerHederaId, workerAmount, memo);
    return { txId, workerAmount, commissionAmount };
  }

  /**
   * Verify an HBAR transfer via Mirror Node.
   * Returns true if the tx shows a debit of at least `minAmountHbar` HBAR from `fromAccountId`.
   */
  async verifyHbarDeposit(
    txId: string,
    fromAccountId: string,
    minAmountHbar: number,
  ): Promise<boolean> {
    const network = env.hedera.network === 'mainnet' ? 'mainnet-public' : 'testnet';
    const normalised = txId.replace('@', '-');
    const url = `https://${network}.mirrornode.hedera.com/api/v1/transactions/${encodeURIComponent(normalised)}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        logger.warn(`Mirror node returned ${res.status} for tx ${txId}`);
        return false;
      }
      const body = (await res.json()) as any;
      // Mirror Node uses `transfers` for HBAR (amounts in tinybar)
      const hbarTransfers: any[] = body.transactions?.[0]?.transfers ?? [];
      const minTinybar = Math.round(minAmountHbar * 1e8);
      const debit = hbarTransfers.find(
        (t) =>
          t.account === fromAccountId &&
          t.amount < 0 &&
          Math.abs(t.amount) >= minTinybar,
      );
      return !!debit;
    } catch (err) {
      logger.warn('Mirror node HBAR verification failed (non-fatal)', err);
      return false;
    }
  }

  /**
   * @deprecated Use sendFromPlatform / releaseToWorker instead.
   * Kept for backward compat but should not be called in new code.
   */
  async processTaskPayment(
    paymentId: string,
    _fromHederaId: string,
    toHederaId: string,
    amount: number,
  ): Promise<string> {
    const payment = await Payment.findByPk(paymentId);
    if (!payment) throw new AppError('Payment record not found', 404);

    try {
      await payment.update({ status: 'processing' });
      const txId = await this.sendFromPlatform(
        toHederaId,
        amount,
        `drops legacy payment ${paymentId}`,
      );
      await payment.update({ status: 'completed', hederaTransactionId: txId });
      return txId;
    } catch (error) {
      await payment.update({ status: 'failed' });
      throw error;
    }
  }
}

export const hederaService = new HederaService();
