import { OrderStatusEvent } from "@/types/types";
import { useEffect, useState } from "react";

export function useOrderStatusSSE(orderId: string) {
  const [status, setStatus] = useState<OrderStatusEvent | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const eventSource = new EventSource(
      `/api/orders/status/stream?orderId=${orderId}`
    );

    eventSource.onmessage = (event) => {
      const data: OrderStatusEvent = JSON.parse(event.data);
      setStatus(data);
    };

    eventSource.onerror = () => {
      console.error("SSE connection error");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [orderId]);

  return status;
}
