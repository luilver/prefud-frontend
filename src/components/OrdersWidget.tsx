import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Package, CheckCircle, AlertCircle, Loader2, ArrowRight, Clock, MapPin, Receipt, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { useOrderSocket } from '@/hooks/useOrderSocket';
import { useLanguage } from '@/contexts/LanguageContext';

interface OrderItem {
  url: string;
  quantity: number;
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

export const OrdersWidget = () => {
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

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

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
    <div className="w-full mb-8">
      <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
        <ShoppingBag className="w-5 h-5" />
        Your Recent Orders
      </h2>
      
      {/* Scrollable Container for Mobile, Grid for Desktop */}
      <div className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:pb-0">
        {orders.slice(0, 5).map(order => {
          const status = realtimeStatuses[order._id] || order.status;
          const display = getStatusDisplay(status);
          
          return (
            <Card 
              key={order._id} 
              className="min-w-[280px] sm:min-w-0 snap-center cursor-pointer hover:shadow-lg transition-all border border-border/50 bg-white/80 backdrop-blur-sm"
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center pr-6">
                <span>Order Details</span>
                <span className="font-mono text-sm text-primary">
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
                    <div key={idx} className="flex justify-between items-center text-sm p-2 bg-secondary/30 rounded-md">
                      <span className="truncate pr-4 text-blue-600 hover:underline cursor-pointer" onClick={() => window.open(item.url, '_blank')}>
                        Product Link
                      </span>
                      <span className="font-medium">Qty: {item.quantity}</span>
                    </div>
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
