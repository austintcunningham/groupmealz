"use client";

import { useTransition } from "react";
import { deleteSavedPaymentMethod } from "@/lib/actions/orders";
import { Button, Card } from "@/components/ui";
import type { SavedPaymentMethod } from "@/types/database";

function formatBrand(brand: string) {
  return brand.charAt(0).toUpperCase() + brand.slice(1);
}

export function SavedPaymentMethods({ methods }: { methods: SavedPaymentMethod[] }) {
  const [isPending, startTransition] = useTransition();

  function handleRemove(id: string) {
    startTransition(async () => {
      await deleteSavedPaymentMethod(id);
      window.location.reload();
    });
  }

  return (
    <Card title="Saved payment methods">
      {methods.length === 0 ? (
        <p className="text-sm text-slate-600">
          No saved cards yet. Check &quot;Save card for future orders&quot; when you pay at checkout.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {methods.map((method) => (
            <li key={method.id} className="flex items-center justify-between gap-4 py-3">
              <div className="text-sm">
                <p className="font-medium">
                  {formatBrand(method.card_brand ?? "card")} •••• {method.card_last4}
                  {method.is_default ? (
                    <span className="ml-2 rounded bg-[var(--geaux-yellow-light)] px-2 py-0.5 text-xs font-semibold text-[var(--geaux-charcoal)]">
                      Default
                    </span>
                  ) : null}
                </p>
                <p className="text-slate-500">
                  Expires {String(method.exp_month).padStart(2, "0")}/{method.exp_year}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                loading={isPending}
                onClick={() => handleRemove(method.id)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
