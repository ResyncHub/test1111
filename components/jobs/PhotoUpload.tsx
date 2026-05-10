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
      // 1. Get signed upload URL
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, fileName: file.name, contentType: file.type }),
      });
      const { uploadUrl, path, publicUrl } = await uploadRes.json();

      // 2. Upload directly to Supabase Storage
      await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });

      // 3. Save record in DB
      const photoRes = await fetch(`/api/jobs/${jobId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storage_path: path, public_url: publicUrl, photo_type: activeTab }),
      });
      const photo = await photoRes.json();
      setPhotos(prev => [...prev, photo]);
      toast.success("Zdjęcie dodane");
    } catch {
      toast.error("Błąd uploadu");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function deletePhoto(photoId: string) {
    const res = await fetch(`/api/jobs/${jobId}/photos?photoId=${photoId}`, { method: "DELETE" });
    if (res.ok) { setPhotos(prev => prev.filter(p => p.id !== photoId)); toast.success("Zdjęcie usunięte"); }
    else toast.error("Błąd usuwania");
  }

  const tabs: { label: string; value: PhotoType }[] = [
    { label: "Przed", value: "before" },
    { label: "Po", value: "after" },
    { label: "Inne", value: "other" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700">Zdjęcia</h4>
        <label className={`flex items-center gap-1.5 text-xs font-medium text-primary cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
          <Camera size={14} /> {uploading ? "Uploading..." : "Dodaj"}
          <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
        </label>
      </div>

      <div className="flex gap-2 mb-3">
        {tabs.map(t => (
          <button key={t.value} onClick={() => setActiveTab(t.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${activeTab === t.value ? "bg-primary text-white border-primary" : "border-gray-200 text-gray-500"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">Brak zdjęć</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {filtered.map(p => (
            <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              {p.public_url && <img src={p.public_url} alt={p.caption ?? ""} className="w-full h-full object-cover" />}
              <button onClick={() => deletePhoto(p.id)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
