import {
  createContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { buildOrderSseUrl } from '../utils/sseUrl';
import { OrderStatusEvent } from '@/types/types';

type OrderStateMap = Record<string, OrderStatusEvent>;

export const OrderSSEContext = createContext<{
  orders: OrderStateMap;
} | null>(null);

export function OrderSSEProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [orders, setOrders] = useState<OrderStateMap>({});
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // ⚠️ Stream GLOBAL por usuario (sin orderId aquí)
    const token = localStorage.getItem('token') ?? undefined;

    const url = buildOrderSseUrl('ALL', token);
    const es = new EventSource(url);

    eventSourceRef.current = es;

    es.onmessage = (event) => {
      const data: OrderStatusEvent = JSON.parse(event.data);

      setOrders((prev) => ({
        ...prev,
        [data.orderId]: data,
      }));
    };

    es.onerror = () => {
      console.error('SSE error, closing connection');
      es.close();
    };

    return () => {
      es.close();
    };
  }, []);

  return (
    <OrderSSEContext.Provider value={{ orders }}>
      {children}
    </OrderSSEContext.Provider>
  );
}
