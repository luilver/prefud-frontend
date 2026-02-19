import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL, PURCHASES_ERROR_CODE, type PurchasesPackage, type CustomerInfo } from '@revenuecat/purchases-capacitor';

// RevenueCat API keys test
//const REVENUECAT_API_KEY = 'test_KFZibtSrGczqQOdxuSEcAsJuwLb';
// RevenueCat API keys production (uncomment when ready to switch to production)
const REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY || 'test_KFZibtSrGczqQOdxuSEcAsJuwLb';

// RevenueCat product IDs mapped to your backend subscription type IDs
export const RC_PRODUCT_MAP: Record<string, string> = {
  // RevenueCat product ID -> Backend subscriptionTypeId
  'family_subscription': '68818f1d0adc665cd16cf18e',
  'professional_subscription': '68818f6e0adc665cd16cf190',
};

// Reverse map: Backend subscriptionTypeId -> RevenueCat product ID
export const BACKEND_TO_RC_MAP: Record<string, string> = {
  '68818f1d0adc665cd16cf18e': 'family_subscription',
  '68818f6e0adc665cd16cf190': 'professional_subscription',
};

let isInitialized = false;

/**
 * Check if running on a native platform (iOS/Android)
 */
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Initialize RevenueCat SDK. Should be called once at app startup on native platforms.
 */
export const initializeRevenueCat = async (): Promise<void> => {
  if (!isNativePlatform() || isInitialized) return;

  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
    
    await Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
    });

    isInitialized = true;
    console.log('[RevenueCat] SDK initialized successfully');
  } catch (error) {
    console.error('[RevenueCat] Failed to initialize SDK:', error);
    throw error;
  }
};

/**
 * Identify user in RevenueCat (call after login)
 */
export const identifyUser = async (userId: string): Promise<void> => {
  if (!isNativePlatform() || !isInitialized) return;

  try {
    const { customerInfo } = await Purchases.logIn({ appUserID: userId });
    console.log('[RevenueCat] User identified:', userId, customerInfo);
  } catch (error) {
    console.error('[RevenueCat] Failed to identify user:', error);
    throw error;
  }
};

/**
 * Logout user from RevenueCat (call on app logout)
 */
export const logoutRevenueCat = async (): Promise<void> => {
  if (!isNativePlatform() || !isInitialized) return;

  try {
    await Purchases.logOut();
    console.log('[RevenueCat] User logged out');
  } catch (error) {
    console.error('[RevenueCat] Failed to logout:', error);
  }
};

/**
 * Get available packages/offerings from RevenueCat
 */
export const getOfferings = async (): Promise<PurchasesPackage[]> => {
  if (!isNativePlatform() || !isInitialized) return [];

  try {
    
    const offerings = await Purchases.getOfferings();
    console.log('[RevenueCat] Offerings:', offerings);


    if (offerings.current && offerings.current.availablePackages.length > 0) {
      return offerings.current.availablePackages;
    }

    return [];
  } catch (error) {
    console.error('[RevenueCat] Failed to get offerings:', error);
    return [];
  }
};

/**
 * Purchase a package through RevenueCat (triggers native IAP)
 */
export const purchasePackage = async (
  pkg: PurchasesPackage
): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> => {
  if (!isNativePlatform() || !isInitialized) {
    return { success: false, error: 'RevenueCat not available on this platform' };
  }

  try {
    console.log('REVENUECAT this is the pkg to buy ', pkg)
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
    console.log('[RevenueCat] Purchase successful:', customerInfo);
    return { success: true, customerInfo };
  } catch (error: any) {
    if (error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      console.log('[RevenueCat] Purchase cancelled by user');
      return { success: false, error: 'cancelled' };
    }
    console.error('[RevenueCat] Purchase failed:', error);
    return { success: false, error: error.message || 'Purchase failed' };
  }
};

/**
 * Purchase a subscription by its RevenueCat product identifier.
 * Finds the matching package from offerings and purchases it.
 */
export const purchaseSubscriptionByProductId = async (
  productId: string
): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> => {
  const packages = await getOfferings();
  
  const matchingPackage = packages.find(
    (pkg) => pkg.product.identifier === productId
  );

  if (!matchingPackage) {
    console.error('[RevenueCat] No package found for product:', productId);
    return { success: false, error: `Product ${productId} not found in offerings` };
  }

  return purchasePackage(matchingPackage);
};

/**
 * Restore purchases (useful when user reinstalls or switches devices)
 */
export const restorePurchases = async (): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> => {
  if (!isNativePlatform() || !isInitialized) {
    return { success: false, error: 'RevenueCat not available on this platform' };
  }

  try {
    const { customerInfo } = await Purchases.restorePurchases();
    console.log('[RevenueCat] Purchases restored:', customerInfo);
    return { success: true, customerInfo };
  } catch (error: any) {
    console.error('[RevenueCat] Restore failed:', error);
    return { success: false, error: error.message || 'Restore failed' };
  }
};

/**
 * Get current customer info (subscription status, entitlements)
 */
export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
  if (!isNativePlatform() || !isInitialized) return null;

  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    console.log('[RevenueCat] Customer info:', customerInfo);
    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat] Failed to get customer info:', error);
    return null;
  }
};

/**
 * Check if user has an active entitlement
 */
export const hasActiveEntitlement = async (entitlementId: string = 'premium'): Promise<boolean> => {
  const customerInfo = await getCustomerInfo();
  if (!customerInfo) return false;

  const entitlement = customerInfo.entitlements.active[entitlementId];
  return !!entitlement && entitlement.isActive;
};

/**
 * Get the backend subscription type ID from a RevenueCat product identifier
 */
export const getBackendSubscriptionTypeId = (rcProductId: string): string | undefined => {
  return RC_PRODUCT_MAP[rcProductId];
};

/**
 * Get the RevenueCat product ID from a backend subscription type ID
 */
export const getRevenueCatProductId = (backendSubTypeId: string): string | undefined => {
  return BACKEND_TO_RC_MAP[backendSubTypeId];
};
