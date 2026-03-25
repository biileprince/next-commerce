"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { seedDefaultBadges } from "@/lib/actions/badges";
import { toast } from "sonner";

export function SeedBadgesButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSeed = () => {
    startTransition(async () => {
      const result = await seedDefaultBadges();
      if (result.success) {
        toast.success("Default badges created successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create default badges");
      }
    });
  };

  return (
    <Button variant="outline" onClick={handleSeed} disabled={isPending}>
      <Sparkles className="mr-2 size-4" />
      {isPending ? "Creating..." : "Add Default Badges"}
    </Button>
  );
}
