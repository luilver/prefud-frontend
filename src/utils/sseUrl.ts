export function buildOrderSseUrl(orderId: string, token?: string) {
  const baseUrl = import.meta.env.VITE_PANTRY_URL || 'https://pantry-ms-brain.onrender.com';

  const url = new URL(`${baseUrl}/stream`);

  url.searchParams.set('orderId', orderId);

  if (token) {
    url.searchParams.set('token', token);
  }

  return url.toString();
}
