import { Capacitor } from '@capacitor/core';
import {
  Purchases,
  LOG_LEVEL,
  type PurchasesOffering,
  type PurchasesPackage,
  type CustomerInfo,
} from '@revenuecat/purchases-capacitor';

/**
 * Check if running on a native platform (iOS/Android).
 * On web we fall back to Stripe (see SubscriptionManager).
 */
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

const IOS_KEY = import.meta.env.VITE_RC_IOS_KEY as string | undefined;
const ANDROID_KEY = import.meta.env.VITE_RC_ANDROID_KEY as string | undefined;

let configured = false;
let configuringUserId: string | null = null;

/**
 * Initialise the RevenueCat SDK once per session. No-op on web or when no
 * key is present for the current platform.
 */
export async function initRevenueCat(appUserId?: string): Promise<void> {
  if (!isNativePlatform()) return;

  const platform = Capacitor.getPlatform();
  const apiKey = platform === 'ios' ? IOS_KEY : ANDROID_KEY;

  if (!apiKey) {
    console.warn(
      `[RevenueCat] Missing public SDK key for ${platform}. ` +
        `Set VITE_RC_IOS_KEY / VITE_RC_ANDROID_KEY.`
    );
    return;
  }

  console.log(`[RevenueCat] Initialising for platform: ${platform} with key starting with: ${apiKey.substring(0, 8)}...`);

  if (configured && configuringUserId === (appUserId ?? null)) return;

  try {
    if (!configured) {
      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
      await Purchases.configure({ apiKey, appUserID: appUserId });
      configured = true;
    } else if (appUserId && configuringUserId !== appUserId) {
      await Purchases.logIn({ appUserID: appUserId });
    }
    configuringUserId = appUserId ?? null;
  } catch (e) {
    console.error('[RevenueCat] configure failed', e);
  }
}

/**
 * Return the current RevenueCat offerings (packages = purchasable items).
 * Empty array on web or when not configured.
 */
export async function getNativeOfferings(): Promise<PurchasesPackage[]> {
  if (!isNativePlatform() || !configured) return [];
  try {
    const { current } = await Purchases.getOfferings();
    const offering: PurchasesOffering | null = current ?? null;
    return offering?.availablePackages ?? [];
  } catch (e) {
    console.error('[RevenueCat] getOfferings failed', e);
    return [];
  }
}

export interface NativePurchaseResult {
  customerInfo: CustomerInfo;
  productIdentifier: string;
  transactionIdentifier: string;
}

/**
 * Trigger the native Apple/Google purchase sheet for the given package.
 */
export async function purchaseNativePackage(
  pkg: PurchasesPackage
): Promise<NativePurchaseResult> {
  if (!isNativePlatform()) {
    throw new Error('Native purchases are only available on iOS/Android.');
  }
  const result = await Purchases.purchasePackage({ aPackage: pkg });
  const customerInfo = result.customerInfo;
  const productIdentifier = pkg.product.identifier;
  // RC returns the original transaction identifier under different keys
  // depending on SDK version; we use it purely as a server-side reference.
  const transactionIdentifier =
    (customerInfo as any)?.originalAppUserId ||
    (customerInfo as any)?.originalApplicationVersion ||
    productIdentifier;

  return { customerInfo, productIdentifier, transactionIdentifier };
}

/**
 * Restore previous purchases (required by Apple). Returns the active
 * entitlement identifier if one is now active.
 */
export async function restoreNativePurchases(): Promise<CustomerInfo | null> {
  if (!isNativePlatform()) return null;
  try {
    const { customerInfo } = await Purchases.restorePurchases();
    return customerInfo;
  } catch (e) {
    console.error('[RevenueCat] restorePurchases failed', e);
    return null;
  }
}

/** Returns the first active entitlement identifier, if any. */
export function getActiveEntitlement(
  customerInfo: CustomerInfo | null | undefined
): string | null {
  if (!customerInfo) return null;
  const active = customerInfo.entitlements?.active ?? {};
  const keys = Object.keys(active);
  return keys.length > 0 ? keys[0] : null;
}

/**
 * Deep-link to the platform's subscription management page so the user can
 * cancel or change their plan (in-app cancellation is not allowed).
 */
export function openManageSubscriptions(): void {
  if (!isNativePlatform()) return;
  const url =
    Capacitor.getPlatform() === 'ios'
      ? 'https://apps.apple.com/account/subscriptions'
      : 'https://play.google.com/store/account/subscriptions';
  window.open(url, '_blank');
}
