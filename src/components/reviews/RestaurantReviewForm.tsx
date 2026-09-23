"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitRestaurantReview, type ReviewOrderContext } from "@/lib/actions/reviews";
import { Button, ErrorMessage, Input, SuccessMessage } from "@/components/ui";

function Stars({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          onClick={() => onChange(n)}
          className={`text-3xl leading-none transition-transform hover:scale-110 ${
            n <= value ? "text-[var(--geaux-yellow)]" : "text-slate-300"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function RestaurantReviewForm({ context }: { context: ReviewOrderContext }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (context.alreadyReviewed) {
    return (
      <SuccessMessage message="Thanks — you already left a review for this lunch order." />
    );
  }

  if (!context.canReview) {
    return (
      <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        Reviews open after your lunch is delivered
        {context.reviewOpensAtLabel ? (
          <>
            {" "}
            (about <strong>{context.reviewOpensAtLabel}</strong>)
          </>
        ) : null}
        . We&apos;ll also email you a link when it&apos;s time.
      </p>
    );
  }

  if (done) {
    return (
      <SuccessMessage message="Thank you! Your feedback helps us and the restaurant improve." />
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (rating < 1) {
      setError("Please select a star rating.");
      return;
    }

    startTransition(async () => {
      const result = await submitRestaurantReview({
        orderId: context.orderId,
        rating,
        comment: comment.trim() || undefined,
        emailConfirm: context.requiresEmailConfirm ? emailConfirm : undefined,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setDone(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? <ErrorMessage message={error} /> : null}
      <div>
        <p className="mb-2 text-sm font-medium text-slate-800">How was {context.restaurantName}?</p>
        <Stars value={rating} onChange={setRating} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Comments (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Food quality, portions, timing, favorite item…"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      {context.requiresEmailConfirm ? (
        <Input
          label="Confirm your order email"
          type="email"
          required
          value={emailConfirm}
          onChange={(e) => setEmailConfirm(e.target.value)}
          placeholder="Same email used at checkout"
        />
      ) : null}
      <Button type="submit" loading={isPending} disabled={rating < 1}>
        Submit review
      </Button>
    </form>
  );
}
