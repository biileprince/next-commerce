"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateOrderStatus, updatePaymentStatus } from "@/lib/actions/order";
import { toast } from "sonner";

interface OrderStatusUpdateProps {
  order: {
    id: string;
    orderStatus: string;
    paymentStatus: string;
  };
}

export function OrderStatusUpdate({ order }: OrderStatusUpdateProps) {
  const router = useRouter();
  const [orderStatus, setOrderStatus] = useState(order.orderStatus);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [loading, setLoading] = useState(false);

  const handleOrderStatusUpdate = async () => {
    if (orderStatus === order.orderStatus) return;

    setLoading(true);
    const result = await updateOrderStatus(order.id, orderStatus);

    if (result.success) {
      toast.success("Order status updated successfully");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update order status");
      setOrderStatus(order.orderStatus);
    }
    setLoading(false);
  };

  const handlePaymentStatusUpdate = async () => {
    if (paymentStatus === order.paymentStatus) return;

    setLoading(true);
    const result = await updatePaymentStatus(order.id, paymentStatus);

    if (result.success) {
      toast.success("Payment status updated successfully");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update payment status");
      setPaymentStatus(order.paymentStatus);
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Status</CardTitle>
        <CardDescription>Change order or payment status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Order Status</label>
          <div className="flex gap-2">
            <Select value={orderStatus} onValueChange={setOrderStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={handleOrderStatusUpdate}
              disabled={loading || orderStatus === order.orderStatus}
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              <span className={loading ? "ml-2" : ""}>Update</span>
            </Button>
          </div>
        </div>

        {/* Payment Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Payment Status</label>
          <div className="flex gap-2">
            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={handlePaymentStatusUpdate}
              disabled={loading || paymentStatus === order.paymentStatus}
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              <span className={loading ? "ml-2" : ""}>Update</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
