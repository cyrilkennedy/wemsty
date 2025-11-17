// src/lib/paystack/plans.js
export const PLAN_PRICES = {
  creator_monthly: { amount: 2500, tier: 'creator', yearly: false },
  creator_yearly: { amount: 27000, tier: 'creator', yearly: true },
  pro_monthly: { amount: 5000, tier: 'pro', yearly: false },
  pro_yearly: { amount: 54000, tier: 'pro', yearly: true },
  enterprise_monthly: { amount: 7000, tier: 'enterprise', yearly: false },
  enterprise_yearly: { amount: 75600, tier: 'enterprise', yearly: true },
};

export const getPlanDetails = (planId) => PLAN_PRICES[planId];