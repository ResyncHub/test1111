"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Customer, ServiceCategory } from "@/types";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const selectStyle: React.CSSProperties = {
  background: "hsl(217 33% 9%)",
  borderColor: "hsl(217 33% 18%)",
  color: "hsl(210 40% 98%)",
};

export default function NewJobPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "", customer_id: "", category_id: "", description: "",
    scheduled_at: "", scheduled_end_at: "", address: "", notes: "", revenue: "",
  });

  useEffect(() => {
    Promise.all([fetch("/api/customers").then(r => r.json()), fetch("/api/categories").then(r => r.json())])
      .then(([c, cat]) => { setCustomers(Array.isArray(c) ? c : []); setCategories(Array.isArray(cat) ? cat : []); })
      .catch(() => {});
  }, []);

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) { toast.error("Tytuł jest wymagany"); return; }
    setLoading(true);
    const body = {
      ...form,
      customer_id:  form.customer_id || null,
      category_id:  form.category_id || null,
      scheduled_at:     form.scheduled_at || null,
      scheduled_end_at: form.scheduled_end_at || null,
      revenue: parseFloat(form.revenue) || 0,
    };
    const res = await fetch("/api/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { const job = await res.json(); toast.success("Zlecenie dodane"); router.push(`/jobs/${job.id}`); }
    else { toast.error("Błąd tworzenia zlecenia"); setLoading(false); }
  }

  return (
    <div className="py-4">
      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-xl border p-4 space-y-3" style={{ background: "hsl(222 47% 7%)", borderColor: "hsl(217 33% 15%)" }}>
          <div>
            <Label>Tytuł zlecenia *</Label>
            <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="np. Montaż okna balkonowego" required />
          </div>
          <div>
            <Label>Klient</Label>
            <select
              value={form.customer_id}
              onChange={e => set("customer_id", e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm border focus:outline-none"
              style={selectStyle}
            >
              <option value="">— wybierz klienta —</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} {c.city ? `(${c.city})` : ""}</option>)}
            </select>
          </div>
          <div>
            <Label>Kategoria usługi</Label>
            <select
              value={form.category_id}
              onChange={e => set("category_id", e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm border focus:outline-none"
              style={selectStyle}
            >
              <option value="">— wybierz kategorię —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}{c.base_price ? ` (od ${c.base_price} PLN)` : ""}</option>)}
            </select>
          </div>
        </div>

        <div className="rounded-xl border p-4 space-y-3" style={{ background: "hsl(222 47% 7%)", borderColor: "hsl(217 33% 15%)" }}>
          <div>
            <Label>Data i godzina rozpoczęcia</Label>
            <Input type="datetime-local" value={form.scheduled_at} onChange={e => set("scheduled_at", e.target.value)} />
          </div>
          <div>
            <Label>Data i godzina zakończenia</Label>
            <Input type="datetime-local" value={form.scheduled_end_at} onChange={e => set("scheduled_end_at", e.target.value)} />
          </div>
          <div>
            <Label>Adres realizacji</Label>
            <Input value={form.address} onChange={e => set("address", e.target.value)} placeholder="ul. Przykładowa 1, Kraków" />
          </div>
        </div>

        <div className="rounded-xl border p-4 space-y-3" style={{ background: "hsl(222 47% 7%)", borderColor: "hsl(217 33% 15%)" }}>
          <div>
            <Label>Wartość zlecenia (PLN)</Label>
            <Input type="number" value={form.revenue} onChange={e => set("revenue", e.target.value)} placeholder="0.00" step="0.01" />
          </div>
          <div>
            <Label>Opis</Label>
            <Textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Szczegóły zlecenia..." />
          </div>
          <div>
            <Label>Notatki wewnętrzne</Label>
            <Textarea rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Notatki dla siebie..." />
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Zapisywanie..." : "Utwórz zlecenie"}
        </Button>
      </form>
    </div>
  );
}
