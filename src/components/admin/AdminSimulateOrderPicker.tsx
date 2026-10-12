"use client";

import { useRouter } from "next/navigation";
import { Button, Select } from "@/components/ui";

export function AdminSimulateOrderPicker({
  restaurants,
  offices,
  defaultRestaurant,
  defaultOffice,
}: {
  restaurants: { slug: string; name: string }[];
  offices: { slug: string; name: string }[];
  defaultRestaurant: string;
  defaultOffice: string;
}) {
  const router = useRouter();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const slug = String(fd.get("restaurant") ?? "");
    const office = String(fd.get("office") ?? "").trim();
    if (!slug) return;
    const q = office ? `?office=${encodeURIComponent(office)}` : "";
    router.push(`/admin/simulate-order/${encodeURIComponent(slug)}${q}`);
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <Select name="restaurant" label="Restaurant" defaultValue={defaultRestaurant} required>
        {restaurants.map((r) => (
          <option key={r.slug} value={r.slug}>
            {r.name}
          </option>
        ))}
      </Select>
      <Select name="office" label="Office context" defaultValue={defaultOffice}>
        <option value="">Default office</option>
        {offices.map((o) => (
          <option key={o.slug} value={o.slug}>
            {o.name}
          </option>
        ))}
      </Select>
      <Button type="submit">Open simulation</Button>
    </form>
  );
}
