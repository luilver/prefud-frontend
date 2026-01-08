export type OrderStatus =
  | 'CREATED'
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'COMPLETED';

export interface OrderStatusEvent {
  orderId: string;
  status: OrderStatus;
  updatedAt: string;
}
