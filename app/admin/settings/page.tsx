import { requireAdmin } from "@/lib/middleware/admin";
import { getSettings } from "@/lib/actions/settings";
import { SettingsForm } from "@/components/admin/settings-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, CreditCard, Mail, Shield, Truck } from "lucide-react";

export default async function AdminSettingsPage() {
  await requireAdmin();

  const settingsResult = await getSettings();
  const settings = settingsResult.success ? settingsResult.data : {};

  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Settings</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Manage store configuration and preferences
        </p>
      </div>

      {/* Store Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="size-5" />
            Store Configuration
          </CardTitle>
          <CardDescription>
            Basic store information and branding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm
            settings={settings || {}}
            fields={[
              { key: "store_name", label: "Store Name", type: "text" },
              { key: "store_description", label: "Store Description", type: "text" },
              { key: "store_email", label: "Contact Email", type: "email" },
              { key: "store_phone", label: "Contact Phone", type: "text" },
              { key: "store_address", label: "Store Address", type: "text" },
            ]}
          />
        </CardContent>
      </Card>

      {/* Currency & Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="size-5" />
            Currency & Shipping
          </CardTitle>
          <CardDescription>
            Currency and shipping configuration (Default: Ghana Cedis)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm
            settings={settings || {}}
            fields={[
              { key: "default_currency", label: "Default Currency Code", type: "text", placeholder: "GHS" },
              { key: "currency_symbol", label: "Currency Symbol", type: "text", placeholder: "GH\u20B5" },
              { key: "shipping_fee", label: "Default Shipping Fee", type: "number" },
              { key: "free_shipping_threshold", label: "Free Shipping Threshold (0 to disable)", type: "number" },
            ]}
          />
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5" />
            Features & Inventory
          </CardTitle>
          <CardDescription>
            Enable/disable store features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm
            settings={settings || {}}
            fields={[
              { key: "low_stock_threshold", label: "Low Stock Alert Threshold", type: "number" },
              { key: "enable_reviews", label: "Enable Product Reviews", type: "boolean" },
              { key: "auto_approve_reviews", label: "Auto-Approve Reviews", type: "boolean" },
              { key: "enable_wishlist", label: "Enable Wishlist", type: "boolean" },
              { key: "enable_coupons", label: "Enable Coupon Codes", type: "boolean" },
            ]}
          />
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-5" />
            Payment Gateway
          </CardTitle>
          <CardDescription>Payment processing configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  P
                </span>
              </div>
              <div>
                <p className="font-medium">Paystack</p>
                <p className="text-sm text-muted-foreground">
                  Card, Bank Transfer, USSD, Mobile Money
                </p>
              </div>
            </div>
            <Badge variant={process.env.PAYSTACK_SECRET_KEY ? "success" : "secondary"}>
              {process.env.PAYSTACK_SECRET_KEY ? "Active" : "Not Configured"}
            </Badge>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm font-medium">Supported Payment Methods:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline">Card</Badge>
              <Badge variant="outline">Bank Transfer</Badge>
              <Badge variant="outline">USSD</Badge>
              <Badge variant="outline">Mobile Money</Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Payment keys are configured via environment variables for security.
            Contact your developer to update payment settings.
          </p>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="size-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>Email configuration and templates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Order Confirmation</p>
                <p className="text-sm text-muted-foreground">
                  Sent when an order is placed
                </p>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Shipping Notification</p>
                <p className="text-sm text-muted-foreground">
                  Sent when order is shipped with tracking info
                </p>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Low Stock Alert</p>
                <p className="text-sm text-muted-foreground">
                  Admin alert when product stock is low
                </p>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environment Info */}
      <Card>
        <CardHeader>
          <CardTitle>Environment</CardTitle>
          <CardDescription>Current application environment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-3">
              <p className="text-sm text-muted-foreground">Node Environment</p>
              <p className="mt-1 font-mono text-sm">
                {process.env.NODE_ENV || "development"}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-sm text-muted-foreground">Database</p>
              <p className="mt-1 font-mono text-sm">PostgreSQL</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-sm text-muted-foreground">Default Currency</p>
              <p className="mt-1 font-mono text-sm">
                {settings?.default_currency?.value || "GHS"} ({settings?.currency_symbol?.value || "GH\u20B5"})
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
