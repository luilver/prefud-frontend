import { PANTRY_API_URL } from "@/config/api";

export function buildOrderSseUrl(orderId: string, token?: string) {
  const baseUrl = PANTRY_API_URL;

  const url = new URL(`${baseUrl}/stream`);

  url.searchParams.set('orderId', orderId);

  if (token) {
    url.searchParams.set('token', token);
  }

  return url.toString();
}
