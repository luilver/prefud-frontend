export function buildOrderSseUrl(orderId: string, token?: string) {
  const baseUrl = import.meta.env.VITE_PANTRY_URL;

  if (!baseUrl) {
    throw new Error('VITE_PANTRY_URL is not defined');
  }

  const url = new URL(`${baseUrl}/stream`);

  url.searchParams.set('orderId', orderId);

  if (token) {
    url.searchParams.set('token', token);
  }

  return url.toString();
}
