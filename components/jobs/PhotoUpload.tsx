"use client";

import { useState } from "react";
import { JobPhoto } from "@/types";
import { Camera, X } from "lucide-react";
import { toast } from "sonner";

type PhotoType = "before" | "after" | "other";

export function PhotoUpload({ jobId, photos: initial }: { jobId: string; photos: JobPhoto[] }) {
  const [photos, setPhotos] = useState(initial);
  const [activeTab, setActiveTab] = useState<PhotoType>("before");
  const [uploading, setUploading] = useState(false);
  const filtered = photos.filter(p => p.photo_type === activeTab);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploadRes = await fetch("/api/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId, fileName: file.name, contentType: file.type }) });
      const { uploadUrl, path, publicUrl } = await uploadRes.json();
      await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      const photoRes = await fetch(`/api/jobs/${jobId}/photos`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ storage_path: path, public_url: publicUrl, photo_type: activeTab }) });
      const photo = await photoRes.json();
      setPhotos(prev => [...prev, photo]);
      toast.success("Zdjęcie dodane");
    } catch { toast.error("Błąd uploadu"); }
    finally { setUploading(false); e.target.value = ""; }
  }

  async function deletePhoto(photoId: string) {
    const res = await fetch(`/api/jobs/${jobId}/photos?photoId=${photoId}`, { method: "DELETE" });
    if (res.ok) { setPhotos(prev => prev.filter(p => p.id !== photoId)); toast.success("Zdjęcie usunięte"); }
    else toast.error("Błąd usuwania");
  }

  const tabs: { label: string; value: PhotoType }[] = [{ label: "Przed", value: "before" }, { label: "Po", value: "after" }, { label: "Inne", value: "other" }];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold" style={{ color: "hsl(210 40% 98%)" }}>Zdjęcia</h4>
        <label className={`flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-opacity ${uploading ? "opacity-50 pointer-events-none" : ""}`} style={{ color: "hsl(217 91% 60%)" }}>
          <Camera size={14} /> {uploading ? "Uploading..." : "Dodaj"}
          <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
        </label>
      </div>
      <div className="flex gap-2 mb-3">
        {tabs.map(t => (
          <button key={t.value} onClick={() => setActiveTab(t.value)} className="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
            style={activeTab === t.value ? { background: "hsl(217 91% 60%)", borderColor: "hsl(217 91% 60%)", color: "hsl(222 47% 5%)" }
              : { background: "transparent", borderColor: "hsl(217 33% 20%)", color: "hsl(215 20% 55%)" }}>
            {t.label}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-center py-6" style={{ color: "hsl(215 20% 45%)" }}>Brak zdjęć</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {filtered.map(p => (
            <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden" style={{ background: "hsl(217 33% 12%)" }}>
              {p.public_url && <img src={p.public_url} alt={p.caption ?? ""} className="w-full h-full object-cover" />}
              <button onClick={() => deletePhoto(p.id)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"><X size={12} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
