"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/toast/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { createStore, getMyStore } from "@/lib/data/stores/client";
import { Store as StoreIcon, ArrowRight, User as UserIcon } from "lucide-react";

export default function StoreOnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const existing = await getMyStore();
        if (existing) {
          router.replace("/store/products");
        }
      } catch (err: any) {
        console.error("ONBOARDING_CHECK_STORE_ERROR", err);
        addToast("error", err?.message || "Failed to check existing store.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, router, addToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Store name is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    try {
      await createStore(name.trim(), description.trim() || undefined);
      addToast("success", "Store created successfully!");
      router.push("/store/products");
    } catch (error: any) {
      console.error("FAILED_TO_CREATE_STORE");
      console.error("Message:", error?.message);
      console.error("Details:", error?.details);
      console.error("Hint:", error?.hint);
      console.error("Code:", error?.code);
      console.error("Full error:", JSON.stringify(error, null, 2));
      addToast("error", error?.message || "Failed to create store. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16">
        <Card padding="lg">
          <p className="text-muted text-center">Loading...</p>
        </Card>
      </div>
    );
  }

  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.business_name || user?.email || "User";

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-primary-light items-center justify-center text-primary">
          <StoreIcon className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-dark">Create Your Store</h1>
        <p className="text-muted">Set up your personal online store and start selling your products.</p>
      </div>

      <Card padding="lg">
        {user && (
          <div className="flex items-center gap-3 pb-5 mb-5 border-b border-border">
            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-dark">{fullName}</p>
              <p className="text-xs text-muted">{user.email}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Store Name"
            placeholder="e.g. Acme Store"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            required
          />

          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Store Description (optional)</label>
            <textarea
              placeholder="What do you sell? Tell customers about your store."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          <Button type="submit" isLoading={submitting} className="w-full flex items-center justify-center gap-2">
            Create Store
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
