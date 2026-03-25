"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Truck, XCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  updateOrderStatus,
  updatePaymentStatus,
  updateTrackingNumber,
  adminCancelOrder,
  adminRefundOrder,
} from "@/lib/actions/order";
import { toast } from "sonner";

interface OrderStatusUpdateProps {
  order: {
    id: string;
    orderStatus: string;
    paymentStatus: string;
    trackingNumber?: string | null;
    shippedAt?: Date | null;
    deliveredAt?: Date | null;
  };
}

export function OrderStatusUpdate({ order }: OrderStatusUpdateProps) {
  const router = useRouter();
  const [orderStatus, setOrderStatus] = useState(order.orderStatus);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [trackingNumber, setTrackingNumber] = useState(
    order.trackingNumber || "",
  );
  const [loading, setLoading] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);

  const canCancel =
    order.orderStatus !== "cancelled" && order.orderStatus !== "delivered";
  const canRefund = order.paymentStatus === "paid";

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

  const handleTrackingNumberUpdate = async () => {
    if (trackingNumber === (order.trackingNumber || "")) return;

    setTrackingLoading(true);
    const result = await updateTrackingNumber(order.id, trackingNumber);

    if (result.success) {
      toast.success("Tracking number updated successfully");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update tracking number");
      setTrackingNumber(order.trackingNumber || "");
    }
    setTrackingLoading(false);
  };

  const handleCancelOrder = async () => {
    setCancelLoading(true);
    const result = await adminCancelOrder(order.id);

    if (result.success) {
      toast.success("Order cancelled and stock restored");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to cancel order");
    }
    setCancelLoading(false);
    setShowCancelConfirm(false);
  };

  const handleRefundOrder = async () => {
    setRefundLoading(true);
    const result = await adminRefundOrder(order.id);

    if (result.success) {
      toast.success("Order refunded and stock restored");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to refund order");
    }
    setRefundLoading(false);
    setShowRefundConfirm(false);
  };

  return (
    <div className="space-y-4">
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
                  <SelectItem value="processing">Processing</SelectItem>
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

      {/* Tracking Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="size-5" />
            Shipping
          </CardTitle>
          <CardDescription>Tracking and delivery information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tracking Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tracking Number</label>
            <div className="flex gap-2">
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
              />
              <Button
                size="sm"
                onClick={handleTrackingNumberUpdate}
                disabled={
                  trackingLoading ||
                  trackingNumber === (order.trackingNumber || "")
                }
              >
                {trackingLoading && <Loader2 className="size-4 animate-spin" />}
                <span className={trackingLoading ? "ml-2" : ""}>Save</span>
              </Button>
            </div>
          </div>

          {/* Timestamps */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipped At</span>
              <span>
                {order.shippedAt
                  ? new Date(order.shippedAt).toLocaleString()
                  : "Not shipped yet"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivered At</span>
              <span>
                {order.deliveredAt
                  ? new Date(order.deliveredAt).toLocaleString()
                  : "Not delivered yet"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Actions */}
      {(canCancel || canRefund) && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Admin Actions</CardTitle>
            <CardDescription>
              These actions will restore product stock
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Cancel Order */}
            {canCancel && !showCancelConfirm && (
              <Button
                variant="outline"
                className="w-full justify-start border-destructive/50 text-destructive hover:bg-destructive/10"
                onClick={() => setShowCancelConfirm(true)}
              >
                <XCircle className="mr-2 size-4" />
                Cancel Order
              </Button>
            )}
            {showCancelConfirm && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                <p className="mb-3 text-sm">
                  Cancel this order? Stock will be restored.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleCancelOrder}
                    disabled={cancelLoading}
                  >
                    {cancelLoading && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    Confirm Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={cancelLoading}
                  >
                    Keep Order
                  </Button>
                </div>
              </div>
            )}

            {/* Refund Order */}
            {canRefund && !showRefundConfirm && (
              <Button
                variant="outline"
                className="w-full justify-start border-amber-500/50 text-amber-600 hover:bg-amber-50"
                onClick={() => setShowRefundConfirm(true)}
              >
                <RefreshCcw className="mr-2 size-4" />
                Process Refund
              </Button>
            )}
            {showRefundConfirm && (
              <div className="rounded-lg border border-amber-500/50 bg-amber-50 p-3 dark:bg-amber-950">
                <p className="mb-3 text-sm">
                  Process refund? Order will be cancelled and stock restored.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700"
                    onClick={handleRefundOrder}
                    disabled={refundLoading}
                  >
                    {refundLoading && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    Confirm Refund
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowRefundConfirm(false)}
                    disabled={refundLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
