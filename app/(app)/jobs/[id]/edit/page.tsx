"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Customer, ServiceCategory, Job } from "@/types";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function EditJobPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", customer_id: "", category_id: "", description: "",
    scheduled_at: "", scheduled_end_at: "", address: "", notes: "", revenue: "",
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/jobs/${id}`).then(r => r.json()),
      fetch("/api/customers").then(r => r.json()),
      fetch("/api/categories").then(r => r.json()),
    ]).then(([job, c, cat]: [Job & { error?: string }, unknown, unknown]) => {
      setCustomers(Array.isArray(c) ? c as Customer[] : []);
      setCategories(Array.isArray(cat) ? cat as ServiceCategory[] : []);
      if (job && !job.error) {
        setForm({
          title:            job.title,
          customer_id:      job.customer_id ?? "",
          category_id:      job.category_id ?? "",
          description:      job.description ?? "",
          scheduled_at:     job.scheduled_at ? job.scheduled_at.slice(0, 16) : "",
          scheduled_end_at: job.scheduled_end_at ? job.scheduled_end_at.slice(0, 16) : "",
          address:          job.address ?? "",
          notes:            job.notes ?? "",
          revenue:          String(job.revenue ?? 0),
        });
      }
    }).catch(() => {});
  }, [id]);

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const body = {
      ...form,
      customer_id:  form.customer_id || null,
      category_id:  form.category_id || null,
      scheduled_at:     form.scheduled_at || null,
      scheduled_end_at: form.scheduled_end_at || null,
      revenue: parseFloat(form.revenue) || 0,
    };
    const res = await fetch(`/api/jobs/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { toast.success("Zapisano"); router.push(`/jobs/${id}`); }
    else { toast.error("Błąd zapisu"); setLoading(false); }
  }

  return (
    <div className="py-4">
      <form onSubmit={submit} className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <div><Label>Tytuł *</Label><Input value={form.title} onChange={e => set("title", e.target.value)} required /></div>
          <div>
            <Label>Klient</Label>
            <select value={form.customer_id} onChange={e => set("customer_id", e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">— wybierz klienta —</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>
          <div>
            <Label>Kategoria</Label>
            <select value={form.category_id} onChange={e => set("category_id", e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">— wybierz kategorię —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <div><Label>Data rozpoczęcia</Label><Input type="datetime-local" value={form.scheduled_at} onChange={e => set("scheduled_at", e.target.value)} /></div>
          <div><Label>Data zakończenia</Label><Input type="datetime-local" value={form.scheduled_end_at} onChange={e => set("scheduled_end_at", e.target.value)} /></div>
          <div><Label>Adres</Label><Input value={form.address} onChange={e => set("address", e.target.value)} /></div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <div><Label>Wartość (PLN)</Label><Input type="number" value={form.revenue} onChange={e => set("revenue", e.target.value)} step="0.01" /></div>
          <div><Label>Opis</Label><Textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)} /></div>
          <div><Label>Notatki</Label><Textarea rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} /></div>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? "Zapisywanie..." : "Zapisz zmiany"}</Button>
      </form>
    </div>
  );
}
