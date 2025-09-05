import axios from "axios";

const API_PAYMENTS =
  import.meta.env.VITE_PAYMENTS || "https://zora-ms-stripe-1.onrender.com";
const BASE_URL =
  import.meta.env.VITE_BASE_URL || "https://pantry-auth-1.onrender.com";

interface PaymentMethodResponse {
  id: string;
  object: string;
  billing_details: {
    address: {
      city: string | null;
      country: string | null;
      line1: string | null;
      line2: string | null;
      postal_code: string | null;
      state: string | null;
    };
    email: string | null;
    name: string | null;
    phone: string | null;
    tax_id?: string | null;
  };
  card: {
    brand: string;
    checks: {
      address_line1_check: string | null;
      address_postal_code_check: string | null;
      cvc_check: string | null;
    };
    country: string;
    display_brand: string;
    exp_month: number;
    exp_year: number;
    fingerprint: string;
    funding: string;
    last4: string;
    three_d_secure_usage: {
      supported: boolean;
    };
  };
  created: number;
  customer: string | null;
  livemode: boolean;
  metadata: Record<string, unknown>;
  type: string;
}

export async function createPaymentMethod(
  token: string
): Promise<PaymentMethodResponse> {
  const data = JSON.stringify({
    type: "card",
    card: {
      token,
    },
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${API_PAYMENTS}/stripe/payment-method`,
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };

  try {
    const response = await axios.request<PaymentMethodResponse>(config);
    console.log("PaymentMethod created:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating payment method:",
      error.response?.data || error.message
    );
    throw error;
  }
}


interface StripePaymentMethod {
  id: string;
  object: string;
  customer: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  [key: string]: any; // Allow extra fields from Stripe
}

//attach payment method for user
export async function attachPaymentMethod(
  paymentMethodId: string,
  customerId: string
): Promise<StripePaymentMethod> {
  try {
    const { data } = await axios.post<StripePaymentMethod>(
      `${API_PAYMENTS}/stripe/attach-payment-method`,
      {
        paymentMethodId,
        customerId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        maxBodyLength: Infinity,
      }
    );

    console.log("Stripe Response:", data);
    return data;
  } catch (error) {
    console.error("Error attaching payment method:", error);
    throw error;
  }
}

export interface StripeProduct {
  id: string;
  object: "product";
  active: boolean;
  attributes: string[];
  created: number;
  default_price: string | null;
  description: string | null;
  images: string[];
  livemode: boolean;
  marketing_features: string[];
  metadata: Record<string, string>;
  name: string;
  package_dimensions: null | {
    height: number;
    length: number;
    weight: number;
    width: number;
  };
  shippable: boolean | null;
  statement_descriptor: string | null;
  tax_code: string | null;
  type: "service" | "good";
  unit_label: string | null;
  updated: number;
  url: string | null;
}

//create ruku product
export async function createStripeProduct(
  name: string,
  description: string
): Promise<StripeProduct> {
  const { data } = await axios.post<StripeProduct>(
    `${API_PAYMENTS}/stripe/create-product`,
    { name, description },
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  return data;
}

//create ruku price

export interface StripePrice {
  id: string;
  object: "price";
  active: boolean;
  billing_scheme: "per_unit" | "tiered";
  created: number;
  currency: string;
  custom_unit_amount: number | null;
  livemode: boolean;
  lookup_key: string | null;
  metadata: Record<string, string>;
  nickname: string | null;
  product: string;
  recurring: {
    aggregate_usage: string | null;
    interval: "day" | "week" | "month" | "year";
    interval_count: number;
    meter: string | null;
    trial_period_days: number | null;
    usage_type: "licensed" | "metered";
  };
  tax_behavior: "inclusive" | "exclusive" | "unspecified";
  tiers_mode: string | null;
  transform_quantity: string | null;
  type: "one_time" | "recurring";
  unit_amount: number;
  unit_amount_decimal: string;
}

export async function createStripePrice(
  productId: string,
  amount: number,
  currency: string,
  interval: "day" | "week" | "month" | "year"
): Promise<StripePrice> {
  const { data } = await axios.post<StripePrice>(
    `${API_PAYMENTS}/stripe/create-price`,
    {
      productId,
      amount,
      currency,
      interval,
    },
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  return data;
}

//generate subscruption

export interface StripeSubscription {
  id: string;
  object: "subscription";
  application: string | null;
  application_fee_percent: number | null;
  automatic_tax: {
    disabled_reason: string | null;
    enabled: boolean;
    liability: any | null;
  };
  billing_cycle_anchor: number;
  billing_cycle_anchor_config: any | null;
  billing_thresholds: any | null;
  cancel_at: number | null;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  cancellation_details: {
    comment: string | null;
    feedback: string | null;
    reason: string | null;
  };
  collection_method: "charge_automatically" | "send_invoice";
  created: number;
  currency: string;
  current_period_end: number;
  current_period_start: number;
  customer: string;
  days_until_due: number | null;
  default_payment_method: string | null;
  default_source: string | null;
  default_tax_rates: any[];
  description: string | null;
  discount: any | null;
  discounts: any[];
  ended_at: number | null;
  invoice_settings: {
    account_tax_ids: any | null;
    issuer: { type: string };
  };
  items: {
    object: "list";
    data: Array<{
      id: string;
      object: "subscription_item";
      billing_thresholds: any | null;
      created: number;
      current_period_end: number;
      current_period_start: number;
      discounts: any[];
      metadata: Record<string, string>;
      plan: any;
      price: any;
      quantity: number;
      subscription: string;
      tax_rates: any[];
    }>;
    has_more: boolean;
    total_count: number;
    url: string;
  };
  latest_invoice: string;
  livemode: boolean;
  metadata: Record<string, string>;
  next_pending_invoice_item_invoice: string | null;
  on_behalf_of: string | null;
  pause_collection: any | null;
  payment_settings: {
    payment_method_options: any | null;
    payment_method_types: any | null;
    save_default_payment_method: "off" | "on";
  };
  pending_invoice_item_interval: any | null;
  pending_setup_intent: any | null;
  pending_update: any | null;
  plan: any;
  quantity: number;
  schedule: string | null;
  start_date: number;
  status: "active" | "incomplete" | "past_due" | "canceled" | "unpaid";
  test_clock: string | null;
  transfer_data: any | null;
  trial_end: number | null;
  trial_settings: {
    end_behavior: { missing_payment_method: string };
  };
  trial_start: number | null;
}

export async function createStripeSubscription(
  customerId: string,
  priceId: string
): Promise<StripeSubscription> {
  const { data } = await axios.post<StripeSubscription>(
    `${API_PAYMENTS}/stripe/subscription`,
    { customerId, priceId },
    { headers: { "Content-Type": "application/json" } }
  );
  return data;
}

//get all of the subscriptions

export interface ApiSubscriptionType {
  _id: string;
  name: string;
  price: number;
  mealPlans: number;
  healthyDrinks: number;
  specialMeals: number;
  generatedMeals: number;
  updatedAt?: string;
  description:string;
}

export async function getAllSubscriptionTypes(): Promise<ApiSubscriptionType[]> {
  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${BASE_URL}/subscriptionType/all`,
    headers: {},
  };

  try {
    const response = await axios.request<ApiSubscriptionType[]>(config);
    console.log('Subscription types:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching subscription types:', error.response?.data || error.message);
    throw error;
  }
}

//set default payment method

interface SetDefaultPaymentMethodResponse {
  id: string;
  object: string;
  email: string | null;
  name: string | null;
  invoice_settings: {
    default_payment_method: string | null;
  };
  // Puedes agregar más campos según la respuesta esperada
}




export async function setDefaultPaymentMethod(
  paymentMethodId: string,
  customerId: string
): Promise<SetDefaultPaymentMethodResponse | null> {
  const data = JSON.stringify({
    paymentMethodId,
    customerId,
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${API_PAYMENTS}/stripe/customer/set-default-payment-method`,
    headers: {
      "Content-Type": "application/json",
    },
    data,
  };

  try {
    const response = await axios.request<SetDefaultPaymentMethodResponse>(config);
    console.log("Customer updated:", response.data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("Error response:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
    return null;
  }
}




//persist subscription in Pantry DB

interface SubscriptionResponse {
  userId: string;
  subscriptionTypeId: string;
  dayOfTheMonth: number;
  dateStarted: string;
  status: boolean;
  mealPlans: number;
  specialMeals: number;
  healthyDrinks: number;
  generateMeals: number;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export async function persistUserSubscription(
  userId: string,
  subscriptionTypeId: string,
  responseCreateSubscription: string
): Promise<SubscriptionResponse> {
  const data = JSON.stringify({
    subscriptionTypeId,
    rukusubscriptionID: responseCreateSubscription
  });
console.log('data to send to persist subscription ', data);
  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${BASE_URL}/subscription/${userId}`,
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };

  try {
    const response = await axios.request<SubscriptionResponse>(config);
    console.log("Subscription updated:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating subscription:",
      error.response?.data || error.message
    );
    throw error;
  }
}

export interface UserPaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  isDefault: boolean;
}

//get user payment methods
export async function getUserPaymentMethods(rukuClientId: string): Promise<UserPaymentMethod[]> {
  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${API_PAYMENTS}/stripe/methods/${rukuClientId}`,
    headers: {},
  };

  try {
    const response = await axios.request<UserPaymentMethod[]>(config);
    console.log('Payment methods:', response.data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      console.error('Customer not found:', error.response?.data?.message);
      return [];
    }
    console.error('Error fetching payment methods:', error.response?.data || error.message);
    throw error;
  }
}

//cancel subscription
export async function cancelUserSubscription(userId: string): Promise<{ success: boolean; message?: string; subscription?: any, code: string }> {
  const config = {
    method: "delete",
    maxBodyLength: Infinity,
    url: `${BASE_URL}/subscription/${userId}`,
    headers: {},
  };

  try {
    const response = await axios.request(config);
    console.log("Subscription cancelled:", response.data);
    
    if (response.status === 200 && response.data.code === "01") {
      return { 
        success: true, 
        message: response.data.message,
        subscription: response.data.return 
      };
    } else {
      return { success: false, message: "Unexpected response status" };
    }
  } catch (error: any) {
    console.error("Error cancelling subscription:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Failed to cancel subscription"
    };
  }
}

// Subscribe user to a subscription
export interface SubscribeUserResponse {
  code: string;
  message: string;
  return: {
    userId: string;
    subscriptionTypeId: string;
    dayOfTheMonth: number;
    dateStarted: string;
    status: boolean;
    mealPlans: number;
    specialMeals: number;
    healthyDrinks: number;
    generateMeals: number;
    rukusubscriptionID: string;
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

export const subscribeUser = async (
  userId: string,
  subscriptionTypeId: string,
  rukusubscriptionID: string
): Promise<SubscribeUserResponse> => {
  try {
    const response = await axios.post(
      `http://localhost:3001/subscription/subscribe/${userId}`,
      {
        subscriptionTypeId,
        rukusubscriptionID
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error subscribing user:', error);
    throw new Error(error.response?.data?.message || 'Failed to subscribe user');
  }
};
