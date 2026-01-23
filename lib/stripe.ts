import Stripe from 'stripe';

// Fallback for build time if keys aren't set
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || 'dummy_key_to_pass_build';

export const stripe = new Stripe(STRIPE_KEY, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

/**
 * Create a Stripe Connect Express account for a producer
 */
export async function createConnectAccount(email: string, userId: string) {
  const account = await stripe.accounts.create({
    type: 'express',
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: {
      user_id: userId,
    },
  });

  return account;
}

/**
 * Create an account link for Connect onboarding
 */
export async function createAccountLink(accountId: string, returnUrl: string, refreshUrl: string) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    return_url: returnUrl,
    refresh_url: refreshUrl,
    type: 'account_onboarding',
  });

  return accountLink;
}

/**
 * Create a payment intent with application fee
 */
export async function createPaymentIntent(
  amount: number,
  connectedAccountId: string,
  platformFee: number,
  metadata: Record<string, string>
) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    application_fee_amount: platformFee,
    transfer_data: {
      destination: connectedAccountId,
    },
    metadata,
  });

  return paymentIntent;
}

/**
 * Get Connect account status
 */
export async function getAccountStatus(accountId: string) {
  const account = await stripe.accounts.retrieve(accountId);
  
  return {
    chargesEnabled: account.charges_enabled,
    detailsSubmitted: account.details_submitted,
    payoutsEnabled: account.payouts_enabled,
  };
}
