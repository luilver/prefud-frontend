import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_BASE_URL || "https://pantry-ms-brain.onrender.com";

export interface UserAddress {
  _id: string;
  country_code: string;
  zipcode: string;
  state: string;
  city: string;
  line1: string;
  line2?: string;
  nickname?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressPayload {
  country_code: string;
  zipcode: string;
  state: string;
  city: string;
  line1: string;
  line2?: string;
  nickname?: string;
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  try {
    const token = localStorage.getItem("authToken");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  } catch {}
  return headers;
}

/**
 * Fetch all addresses for a user.
 * GET /address/:userId
 */
export async function getUserAddresses(
  userId: string
): Promise<UserAddress[]> {
  try {
    const response = await axios.get<UserAddress[]>(
      `${BASE_URL}/address/${userId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching addresses:",
      error.response?.data || error.message
    );
    return [];
  }
}

/**
 * Create a new address for a user.
 * POST /address/:userId
 */
export async function createUserAddress(
  userId: string,
  payload: CreateAddressPayload
): Promise<UserAddress> {
  const response = await axios.post<UserAddress>(
    `${BASE_URL}/address/${userId}`,
    payload,
    { headers: getAuthHeaders() }
  );
  return response.data;
}

/**
 * Delete an address for a user.
 * DELETE /address/:userId/:addressId
 */
export async function deleteUserAddress(
  userId: string,
  addressId: string
): Promise<void> {
  await axios.delete(`${BASE_URL}/address/${userId}/${addressId}`, {
    headers: getAuthHeaders(),
  });
}

// ─── Orders / Quotes ───────────────────────────────────────────────────────

export interface QuoteIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface QuoteMatchedProduct {
  product_id: string;
  title: string;
  price: number; // in cents
  retailer: string;
  image_url: string;
}

export interface QuoteItem {
  ingredient: string;
  matchedProduct: QuoteMatchedProduct;
  quantity: number;
}

export interface OrderQuote {
  quoteId: string;
  items: QuoteItem[];
  productCostCents: number;
  totalAmountCents: number;
  marginPercent: number;
  retailer: string;
  fulfillmentType: string;
  expiresAt: string;
}

export interface QuotePayload {
  ingredients: QuoteIngredient[];
  retailer: string;
  fulfillmentType: string;
  shippingMethod: string;
  pickupStoreAddress?: {
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
}

/**
 * Request an order quote.
 * POST /api/v1/orders/quotes
 */
export async function quoteOrder(
  payload: QuotePayload
): Promise<OrderQuote> {
  const response = await axios.post<OrderQuote>(
    `${BASE_URL}/api/v1/orders/quotes`,
    payload,
    { headers: getAuthHeaders() }
  );
  return response.data;
}
