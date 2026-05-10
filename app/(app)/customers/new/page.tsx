"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function NewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", address: "", city: "", notes: "" });
  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name) { toast.error("Imię i nazwisko jest wymagane"); return; }
    setLoading(true);
    const res = await fetch("/api/customers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { const c = await res.json(); toast.success("Klient dodany"); router.push(`/customers/${c.id}`); }
    else { toast.error("Błąd tworzenia klienta"); setLoading(false); }
  }

  return (
    <div className="py-4">
      <form onSubmit={submit} className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <div><Label>Imię i nazwisko *</Label><Input value={form.full_name} onChange={e => set("full_name", e.target.value)} placeholder="Jan Kowalski" required /></div>
          <div><Label>Telefon</Label><Input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="500 100 200" /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="jan@email.pl" /></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <div><Label>Adres</Label><Input value={form.address} onChange={e => set("address", e.target.value)} placeholder="ul. Przykładowa 1" /></div>
          <div><Label>Miasto</Label><Input value={form.city} onChange={e => set("city", e.target.value)} placeholder="Kraków" /></div>
          <div><Label>Notatki</Label><Textarea rows={3} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Dodatkowe informacje o kliencie..." /></div>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? "Zapisywanie..." : "Dodaj klienta"}</Button>
      </form>
    </div>
  );
}
