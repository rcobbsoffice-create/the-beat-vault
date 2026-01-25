export const createStripeConnectAccount = async (email: string) => {
  console.log(`[Stripe] Creating Connect account for: ${email}`);
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    id: 'acct_' + Math.random().toString(36).substr(2, 14),
    status: 'pending_onboarding'
  };
};

export const createOnboardingLink = async (accountId: string) => {
  console.log(`[Stripe] Creating onboarding link for account: ${accountId}`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real app, this would be a Stripe-hosted URL
  return {
    url: `/dashboard/onboarding/stripe?account_id=${accountId}`
  };
};
