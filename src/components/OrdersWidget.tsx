import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Package, CheckCircle, AlertCircle, Loader2, ArrowRight, Clock, MapPin, Receipt, ShoppingBag, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { useOrderSocket } from '@/hooks/useOrderSocket';
import { useLanguage } from '@/contexts/LanguageContext';

interface OrderItem {
  url: string;
  quantity: number;
  name?: string;
  image?: string;
}

interface Order {
  _id: string;
  zincOrderId: string;
  status: string;
  maxPrice: number;
  items: OrderItem[];
  shippingAddress: any;
  createdAt: string;
  errorReason?: string;
  trackingNumbers?: any[];
}

const OrderItemView = ({ item }: { item: OrderItem }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="flex items-start text-sm p-2.5 bg-secondary/30 rounded-md gap-3">
      <div 
        className="flex-shrink-0 cursor-pointer" 
        onClick={() => window.open(item.url, '_blank')}
        title="View Product"
      >
        {item.image ? (
          <img src={item.image} alt={item.name || 'Product'} className="w-12 h-12 object-cover rounded border border-border/50" />
        ) : (
          <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center border border-border/50">
            <Package className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 min-w-0 justify-center min-h-[3rem]">
        <span 
          className={`text-primary font-medium text-sm leading-tight mb-1 cursor-pointer transition-all ${isExpanded ? '' : 'line-clamp-1'}`}
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? "Click to collapse" : "Click to expand"}
        >
          {item.name || 'Product Link'}
        </span>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">Qty: {item.quantity}</span>
          <a href={item.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
            View Link
          </a>
        </div>
      </div>
    </div>
  );
};

interface OrdersWidgetProps {
  hideDelivered?: boolean;
}

export const OrdersWidget: React.FC<OrdersWidgetProps> = ({ hideDelivered }) => {
  const { user: authUser } = useAuth();
  const { user } = useUser();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id || !authUser?.token) return;
      try {
        const apiUrl = import.meta.env.VITE_BASE_URL || 'https://pantry-ms-brain.onrender.com';
        const res = await fetch(`${apiUrl}/api/v1/orders/user/${user.id}`, {
          headers: {
            Authorization: `Bearer ${authUser.token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user?.id, authUser?.token]);

  // Setup WebSocket listening for active orders
  const activeOrderIds = orders
    .filter(o => !['DELIVERED', 'FAILED', 'CANCELLED'].includes(o.status))
    .map(o => o._id);

  const realtimeStatuses = useOrderSocket(activeOrderIds);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'PROCESSING':
        return { label: 'Processing', icon: <Loader2 className="w-4 h-4 animate-spin text-blue-500" />, color: 'text-blue-600 bg-blue-50' };
      case 'PLACED':
      case 'SHIPPED':
        return { label: 'On the way', icon: <Package className="w-4 h-4 text-amber-500" />, color: 'text-amber-600 bg-amber-50' };
      case 'DELIVERED':
      case 'COMPLETED':
        return { label: 'Delivered', icon: <CheckCircle className="w-4 h-4 text-green-500" />, color: 'text-green-600 bg-green-50' };
      case 'FAILED':
      case 'CANCELLED':
        return { label: 'Cancelled', icon: <AlertCircle className="w-4 h-4 text-red-500" />, color: 'text-red-600 bg-red-50' };
      default:
        return { label: status, icon: <Clock className="w-4 h-4 text-gray-500" />, color: 'text-gray-600 bg-gray-50' };
    }
  };

  const formatPrice = (amount: number) => `$${amount.toFixed(2)}`;

  if (loading) {
    return (
      <div className="py-4 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (orders.length === 0) {
    return null; // Don't show anything if no orders
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden">
      <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
        <ShoppingBag className="w-5 h-5" />
        Your Recent Orders
      </h2>
      
      {/* Grid Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
        {orders
          .filter(order => {
            if (hideDelivered) {
              const status = realtimeStatuses[order._id] || order.status;
              return status !== 'DELIVERED';
            }
            return true;
          })
          .slice(0, 5)
          .map(order => {
          const status = realtimeStatuses[order._id] || order.status;
          const display = getStatusDisplay(status);
          
          return (
            <Card 
              key={order._id} 
              className="w-full cursor-pointer hover:shadow-lg transition-all border border-border/50 bg-white/80 backdrop-blur-sm"
              onClick={() => setSelectedOrder(order)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${display.color}`}>
                    {display.icon}
                    {display.label}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="font-semibold text-foreground truncate">
                  Order #{order.zincOrderId?.split('-')[0].toUpperCase() || order._id.slice(-6).toUpperCase()}
                </h3>
                
                <div className="mt-3 flex justify-between items-end">
                  <p className="text-sm text-muted-foreground">
                    {order.items?.length || 0} items
                  </p>
                  <p className="font-medium text-primary">
                    {formatPrice(order.maxPrice)}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="max-w-md w-[95vw] max-h-[90vh] overflow-y-auto rounded-xl p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center pr-6">
                <span>Order Details</span>
                <span className="font-mono text-sm text-primary truncate max-w-[120px] sm:max-w-none text-right">
                  #{selectedOrder.zincOrderId?.split('-')[0].toUpperCase() || selectedOrder._id.slice(-6).toUpperCase()}
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 pt-4">
              {/* Status Banner */}
              <div className={`p-4 rounded-lg flex items-center gap-3 ${getStatusDisplay(realtimeStatuses[selectedOrder._id] || selectedOrder.status).color}`}>
                {getStatusDisplay(realtimeStatuses[selectedOrder._id] || selectedOrder.status).icon}
                <div>
                  <p className="font-semibold">{getStatusDisplay(realtimeStatuses[selectedOrder._id] || selectedOrder.status).label}</p>
                  {(selectedOrder.status === 'FAILED' || selectedOrder.status === 'CANCELLED') && selectedOrder.errorReason && (
                    <p className="text-xs opacity-80 mt-1">{selectedOrder.errorReason}</p>
                  )}
                </div>
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Date Placed
                  </p>
                  <p className="text-sm font-medium">
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Receipt className="w-3 h-3" /> Total
                  </p>
                  <p className="text-sm font-medium">
                    {formatPrice(selectedOrder.maxPrice)}
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Shipping To
                </p>
                <div className="text-sm bg-secondary/50 p-3 rounded-md">
                  <p className="font-medium">{selectedOrder.shippingAddress?.first_name} {selectedOrder.shippingAddress?.last_name}</p>
                  <p>{selectedOrder.shippingAddress?.address_line1}</p>
                  {selectedOrder.shippingAddress?.address_line2 && <p>{selectedOrder.shippingAddress?.address_line2}</p>}
                  <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postal_code}</p>
                </div>
              </div>

              {/* Items Summary */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Package className="w-3 h-3" /> Items ({selectedOrder.items?.length || 0})
                </p>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <OrderItemView key={idx} item={item} />
                  ))}
                </div>
              </div>

              {/* Tracking Numbers */}
              {selectedOrder.trackingNumbers && selectedOrder.trackingNumbers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Tracking Details</p>
                  <div className="text-sm bg-secondary/50 p-3 rounded-md space-y-1">
                    {selectedOrder.trackingNumbers.map((track, idx) => (
                      <p key={idx} className="font-medium">
                        {track.carrier}: {track.tracking_number}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
