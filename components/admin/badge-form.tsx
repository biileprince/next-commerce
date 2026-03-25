"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBadge, updateBadge } from "@/lib/actions/badges";
import { toast } from "sonner";

interface BadgeFormProps {
  badge?: {
    id: string;
    name: string;
    label: string;
    color: string;
    textColor: string;
  };
}

export function BadgeForm({ badge }: BadgeFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!badge;

  const [formData, setFormData] = useState({
    name: badge?.name || "",
    label: badge?.label || "",
    color: badge?.color || "#000000",
    textColor: badge?.textColor || "#FFFFFF",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = new FormData();
    form.append("name", formData.name);
    form.append("label", formData.label);
    form.append("color", formData.color);
    form.append("textColor", formData.textColor);

    startTransition(async () => {
      const result = isEdit
        ? await updateBadge(badge.id, form)
        : await createBadge(form);

      if (result.success) {
        toast.success(`Badge ${isEdit ? "updated" : "created"} successfully`);
        router.push("/admin/badges");
        router.refresh();
      } else {
        toast.error(
          result.error || `Failed to ${isEdit ? "update" : "create"} badge`,
        );
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Preview */}
      <div className="rounded-lg border p-4">
        <Label className="mb-2 block">Preview</Label>
        <div className="flex items-center gap-4">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold"
            style={{
              backgroundColor: formData.color,
              color: formData.textColor,
            }}
          >
            {formData.label || "Badge Label"}
          </span>
          <span className="text-sm text-muted-foreground">
            This is how the badge will appear on products
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Badge Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., bestseller"
            disabled={isEdit}
            required
          />
          <p className="text-xs text-muted-foreground">
            Unique identifier (lowercase, no spaces)
          </p>
        </div>

        {/* Label */}
        <div className="space-y-2">
          <Label htmlFor="label">
            Display Label <span className="text-destructive">*</span>
          </Label>
          <Input
            id="label"
            value={formData.label}
            onChange={(e) =>
              setFormData({ ...formData, label: e.target.value })
            }
            placeholder="e.g., Best Seller"
            required
          />
          <p className="text-xs text-muted-foreground">
            Text shown on the badge
          </p>
        </div>

        {/* Background Color */}
        <div className="space-y-2">
          <Label htmlFor="color">Background Color</Label>
          <div className="flex gap-2">
            <Input
              id="color"
              type="color"
              value={formData.color}
              onChange={(e) =>
                setFormData({ ...formData, color: e.target.value })
              }
              className="h-10 w-20 cursor-pointer p-1"
            />
            <Input
              value={formData.color}
              onChange={(e) =>
                setFormData({ ...formData, color: e.target.value })
              }
              placeholder="#000000"
              className="flex-1"
            />
          </div>
        </div>

        {/* Text Color */}
        <div className="space-y-2">
          <Label htmlFor="textColor">Text Color</Label>
          <div className="flex gap-2">
            <Input
              id="textColor"
              type="color"
              value={formData.textColor}
              onChange={(e) =>
                setFormData({ ...formData, textColor: e.target.value })
              }
              className="h-10 w-20 cursor-pointer p-1"
            />
            <Input
              value={formData.textColor}
              onChange={(e) =>
                setFormData({ ...formData, textColor: e.target.value })
              }
              placeholder="#FFFFFF"
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isEdit ? "Update Badge" : "Create Badge"}
        </Button>
      </div>
    </form>
  );
}
