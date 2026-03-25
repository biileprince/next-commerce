import { requireAdmin } from "@/lib/middleware/admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, CreditCard, Mail, Shield } from "lucide-react";

export default async function AdminSettingsPage() {
  await requireAdmin();

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
            Basic store information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Store Name</p>
              <p className="mt-1 font-medium">NextCommerce</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Currency</p>
              <p className="mt-1 font-medium">NGN (Nigerian Naira)</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Default Shipping</p>
              <p className="mt-1 font-medium">NGN 2,000</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Tax Rate</p>
              <p className="mt-1 font-medium">0% (No tax configured)</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Store configuration is managed through environment variables and
            code settings.
          </p>
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
            <Badge variant="success">Active</Badge>
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
              <Badge variant="secondary">Not configured</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Shipping Notification</p>
                <p className="text-sm text-muted-foreground">
                  Sent when order is shipped
                </p>
              </div>
              <Badge variant="secondary">Not configured</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Delivery Confirmation</p>
                <p className="text-sm text-muted-foreground">
                  Sent when order is delivered
                </p>
              </div>
              <Badge variant="secondary">Not configured</Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Email notifications require SMTP configuration in environment
            variables.
          </p>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5" />
            Security
          </CardTitle>
          <CardDescription>Security and access settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Admin Route Protection</p>
                <p className="text-sm text-muted-foreground">
                  All /admin routes require authentication
                </p>
              </div>
              <Badge variant="success">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Role-Based Access</p>
                <p className="text-sm text-muted-foreground">
                  Only admin users can access admin panel
                </p>
              </div>
              <Badge variant="success">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">API Rate Limiting</p>
                <p className="text-sm text-muted-foreground">
                  Limit API requests to prevent abuse
                </p>
              </div>
              <Badge variant="secondary">Not configured</Badge>
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
              <p className="text-sm text-muted-foreground">Auth Provider</p>
              <p className="mt-1 font-mono text-sm">Better Auth</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
