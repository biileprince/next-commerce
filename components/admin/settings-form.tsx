"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateSettings } from "@/lib/actions/settings";
import { toast } from "sonner";

interface SettingField {
  key: string;
  label: string;
  type: "text" | "email" | "number" | "boolean";
  placeholder?: string;
}

interface SettingsFormProps {
  settings: Record<
    string,
    { value: string; type: string; description: string; isPublic: boolean }
  >;
  fields: SettingField[];
}

export function SettingsForm({ settings, fields }: SettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of fields) {
      initial[field.key] = settings[field.key]?.value || "";
    }
    return initial;
  });

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const result = await updateSettings(values);

      if (result.success) {
        toast.success("Settings updated successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update settings");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>{field.label}</Label>
            {field.type === "boolean" ? (
              <div className="flex items-center space-x-2">
                <Switch
                  id={field.key}
                  checked={values[field.key] === "true"}
                  onCheckedChange={(checked: boolean) =>
                    handleChange(field.key, checked ? "true" : "false")
                  }
                />
                <span className="text-sm text-muted-foreground">
                  {values[field.key] === "true" ? "Enabled" : "Disabled"}
                </span>
              </div>
            ) : (
              <Input
                id={field.key}
                type={field.type}
                value={values[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
