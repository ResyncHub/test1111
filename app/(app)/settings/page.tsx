"use client";

import { useEffect, useState } from "react";
import { ServiceCategory } from "@/types";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { formatPLN } from "@/lib/utils";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [settings, setSettings] = useState({ business_name: "", owner_name: "" });
  const [newCat, setNewCat] = useState({ name: "", base_price: "" });

  useEffect(() => {
    Promise.all([fetch("/api/categories").then(r => r.json()), fetch("/api/settings").then(r => r.json())])
      .then(([cats, s]) => { setCategories(cats); setSettings({ business_name: s.business_name ?? "", owner_name: s.owner_name ?? "" }); });
  }, []);

  async function saveSettings() {
    await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    toast.success("Ustawienia zapisane");
  }

  async function addCategory() {
    if (!newCat.name) return;
    const res = await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newCat.name, base_price: parseFloat(newCat.base_price) || null }) });
    if (res.ok) { const cat = await res.json(); setCategories(prev => [...prev, cat]); setNewCat({ name: "", base_price: "" }); toast.success("Kategoria dodana"); }
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="py-4 space-y-4">
      {/* Firma */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Dane firmy</h3>
        <div><Label>Nazwa firmy</Label><Input value={settings.business_name} onChange={e => setSettings(p => ({ ...p, business_name: e.target.value }))} /></div>
        <div><Label>Imię i nazwisko</Label><Input value={settings.owner_name} onChange={e => setSettings(p => ({ ...p, owner_name: e.target.value }))} /></div>
        <Button onClick={saveSettings}>Zapisz</Button>
      </div>

      {/* Kategorie */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Kategorie usług</h3>
        <div className="space-y-2 mb-3">
          {categories.map(c => (
            <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-800">{c.name}</span>
              {c.base_price && <span className="text-xs text-emerald-600 font-medium">od {formatPLN(c.base_price)}</span>}
            </div>
          ))}
        </div>
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div><Label>Nowa kategoria</Label><Input value={newCat.name} onChange={e => setNewCat(p => ({ ...p, name: e.target.value }))} placeholder="np. Naprawa rolety" /></div>
          <div><Label>Cena bazowa (PLN)</Label><Input type="number" value={newCat.base_price} onChange={e => setNewCat(p => ({ ...p, base_price: e.target.value }))} placeholder="0.00" /></div>
          <Button size="sm" onClick={addCategory}>Dodaj kategorię</Button>
        </div>
      </div>

      {/* Wyloguj */}
      <Button variant="outline" className="w-full text-red-500 border-red-200" onClick={logout}>
        <LogOut size={16} /> Wyloguj się
      </Button>
    </div>
  );
}
