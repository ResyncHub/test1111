"use client";

import { useState } from "react";
import { JobCost } from "@/types";
import { formatPLN } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export function CostsList({ jobId, costs: initial }: { jobId: string; costs: JobCost[] }) {
  const [costs, setCosts] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");

  const total = costs.reduce((s, c) => s + Number(c.amount), 0);

  async function addCost() {
    if (!desc || !amount) return;
    const res = await fetch(`/api/jobs/${jobId}/costs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: desc, amount: parseFloat(amount) }),
    });
    if (res.ok) {
      const cost = await res.json();
      setCosts(prev => [...prev, cost]);
      setDesc(""); setAmount(""); setAdding(false);
      toast.success("Koszt dodany");
    } else toast.error("Błąd dodawania kosztu");
  }

  async function deleteCost(costId: string) {
    const res = await fetch(`/api/jobs/${jobId}/costs?costId=${costId}`, { method: "DELETE" });
    if (res.ok) { setCosts(prev => prev.filter(c => c.id !== costId)); toast.success("Koszt usunięty"); }
    else toast.error("Błąd usuwania");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700">Koszty</h4>
        <Button size="sm" variant="outline" onClick={() => setAdding(v => !v)}>
          <Plus size={14} /> Dodaj
        </Button>
      </div>

      {adding && (
        <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
          <div>
            <Label>Opis</Label>
            <Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="np. Uszczelka 5mb" />
          </div>
          <div>
            <Label>Kwota (PLN)</Label>
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={addCost}>Zapisz</Button>
            <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Anuluj</Button>
          </div>
        </div>
      )}

      {costs.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Brak kosztów</p>
      ) : (
        <div className="space-y-2">
          {costs.map(cost => (
            <div key={cost.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <div>
                <p className="text-sm text-gray-800">{cost.description}</p>
                <p className="text-xs text-gray-400">{cost.cost_date}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-red-600">{formatPLN(Number(cost.amount))}</span>
                <button onClick={() => deleteCost(cost.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-between px-3 py-2 border-t border-gray-200">
            <span className="text-sm font-semibold text-gray-700">Łączne koszty</span>
            <span className="text-sm font-bold text-red-600">{formatPLN(total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
