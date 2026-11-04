import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/config/api';

export function useOrderSocket(orderIds: string[]) {
  const [ordersStatus, setOrdersStatus] = useState<Record<string, string>>({});
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Only connect if we have order IDs to listen to
    if (!orderIds || orderIds.length === 0) return;

    // Connect to the NestJS backend
    const socketUrl = SOCKET_URL;
    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Connected to Order WebSocket');
      
      // Join a room for EVERY active order we care about
      orderIds.forEach(orderId => {
        socket.emit('joinOrderRoom', { orderId }, (response: any) => {
          if (response?.status === 'success') {
            // Set initial status
            setOrdersStatus(prev => ({ ...prev, [orderId]: response.currentStatus }));
          }
        });
      });
    });

    // Listen for real-time status updates pushed from Zinc Webhooks
    socket.on('orderStatusUpdate', (data: { orderId: string, status: string, data: any }) => {
      console.log('📦 Real-time update received:', data);
      
      setOrdersStatus(prev => ({
        ...prev,
        [data.orderId]: data.status
      }));
    });

    return () => {
      socket.disconnect();
    };
  // Re-run if the list of order IDs changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(orderIds)]);

  return ordersStatus;
}
