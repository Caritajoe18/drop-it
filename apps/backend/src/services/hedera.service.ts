import {
  Client,
  AccountId,
  PrivateKey,
  TransferTransaction,
  TokenId,
  Hbar,
  TransactionId,
  AccountBalanceQuery,
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

  constructor() {
    if (!env.hedera.operatorId || !env.hedera.operatorKey || !env.hedera.usdcTokenId) {
      logger.warn('Hedera credentials not configured — payment features disabled');
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
   * Transfer USDC tokens between two Hedera accounts.
   * USDC on Hedera has 6 decimal places.
   */
  async transferUsdc(
    fromAccountId: string,
    toAccountId: string,
    amount: number,
  ): Promise<string> {
    try {
      // USDC has 6 decimals on Hedera
      const tokenAmount = Math.round(amount * 1_000_000);

      const transaction = new TransferTransaction()
        .addTokenTransfer(this.usdcTokenId, AccountId.fromString(fromAccountId), -tokenAmount)
        .addTokenTransfer(this.usdcTokenId, AccountId.fromString(toAccountId), tokenAmount)
        .setTransactionMemo(`drops task payment: ${amount} USDC`)
        .freezeWith(this.client);

      const signedTx = await transaction.sign(this.operatorKey);
      const response = await signedTx.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      if (receipt.status !== Status.Success) {
        throw new AppError(`Hedera transfer failed with status: ${receipt.status}`, 500);
      }

      const txId = response.transactionId.toString();
      logger.info(`USDC transfer successful: ${txId} — ${amount} USDC from ${fromAccountId} to ${toAccountId}`);
      return txId;
    } catch (error) {
      logger.error('USDC transfer failed', error);
      throw error instanceof AppError
        ? error
        : new AppError('Payment transfer failed. Please try again.', 500);
    }
  }

  /**
   * Process payment for an approved task submission.
   */
  async processTaskPayment(
    paymentId: string,
    fromHederaId: string,
    toHederaId: string,
    amount: number,
  ): Promise<string> {
    const payment = await Payment.findByPk(paymentId);
    if (!payment) throw new AppError('Payment record not found', 404);

    try {
      await payment.update({ status: 'processing' });

      const transactionId = await this.transferUsdc(fromHederaId, toHederaId, amount);

      await payment.update({
        status: 'completed',
        hederaTransactionId: transactionId,
      });

      return transactionId;
    } catch (error) {
      await payment.update({ status: 'failed' });
      throw error;
    }
  }

  /**
   * Query the USDC token balance for a Hedera account.
   */
  async getUsdcBalance(accountId: string): Promise<number> {
    try {
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
}

export const hederaService = new HederaService();
