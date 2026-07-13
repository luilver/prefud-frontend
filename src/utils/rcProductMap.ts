import type { ApiSubscriptionType } from '@/services/payments';

/**
 * Map RevenueCat product / package identifiers (configured in App Store
 * Connect, Play Console and the RevenueCat dashboard) to the matching
 * backend `subscriptionType.name`. Update these strings to match the real
 * product identifiers you set up.
 */
// export const RC_PRODUCT_TO_PLAN_NAME: Record<string, string> = {
//   family_monthly: 'family',
//   family_yearly: 'family',
//   professional_monthly: 'professional',
//   professional_yearly: 'professional',
// };
export const RC_PRODUCT_TO_PLAN_NAME: Record<string, string> = {
  // iOS
  family_monthly: "family",
  professional_monthly: "professional",

  // Android
  "family_monthly:family-monthly": "family",
  "professional_monthly:professional-monthly": "professional",
};

/**
 * Resolve a backend subscriptionType id from a RevenueCat product
 * identifier, given the list of subscription types returned by the API.
 */
export function resolveSubscriptionTypeId(
  rcProductIdentifier: string,
  apiPlans: ApiSubscriptionType[]
): string | null {
  const planName = RC_PRODUCT_TO_PLAN_NAME[rcProductIdentifier];
  if (!planName) return null;
  const match = apiPlans.find(
    (p) => p.name.toLowerCase() === planName.toLowerCase()
  );
  return match?._id ?? null;
}