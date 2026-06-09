/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Plus, 
  Trash2, 
  User, 
  Megaphone,
  FileText,
  UploadCloud,
  X,
  Film
} from 'lucide-react';
import { AuthUser, ActivityNews } from '../types';

interface NewsActivityProps {
  user: AuthUser | null;
  activities: ActivityNews[];
  onCreateNews: (news: { title: string; content: string; date: string; location: string; addedBy: string; mediaUrl?: string; mediaType?: 'image' | 'video' }) => Promise<any>;
  onDeleteNews: (id: string) => Promise<any>;
}

export default function NewsActivity({
  user,
  activities,
  onCreateNews,
  onDeleteNews
}: NewsActivityProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newLocation, setNewLocation] = useState('');

  // Media upload states
  const [mediaFileBase64, setMediaFileBase64] = useState<string>('');
  const [mediaFileType, setMediaFileType] = useState<'image' | 'video' | undefined>(undefined);
  const [mediaFileName, setMediaFileName] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);

  const handleFile = (file: File) => {
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      alert('Hanya diperbolehkan melampirkan berkas Foto (Image) atau Video.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert('Ukuran file maksimal adalah 15MB agar muatan data tidak terlalu padat.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaFileBase64(reader.result as string);
      setMediaFileType(isImage ? 'image' : 'video');
      setMediaFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClearFile = () => {
    setMediaFileBase64('');
    setMediaFileType(undefined);
    setMediaFileName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent || !newDate || !newLocation) {
      alert('Semua baris formulir wajib diisi.');
      return;
    }

    setLoadingAdd(true);
    try {
      await onCreateNews({
        title: newTitle,
        content: newContent,
        date: newDate,
        location: newLocation,
        addedBy: user?.name || 'Administrator',
        mediaUrl: mediaFileBase64 || undefined,
        mediaType: mediaFileType || undefined
      });
      alert('Kabar Kegiatan & Informasi Baru Berhasil Terunggah!');
      setShowAddForm(false);
      setNewTitle('');
      setNewContent('');
      setNewLocation('');
      handleClearFile();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan berita.');
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah bapak/ibu yakin ingin menghapus kabar kegiatan ini?')) return;
    setDeletingId(id);
    try {
      await onDeleteNews(id);
      alert('Berita terhapus.');
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus berita.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-slate-800">Kabar Kegiatan &amp; Informasi STM</h1>
          <p className="text-sm text-slate-500">
            Daftar laporan kegiatan takziah, penyerahan santunan duka, gotong-royong warga, serta agenda rapat terbaru Serikat.
          </p>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 self-start md:self-auto hover:shadow-lg"
          >
            <Plus size={15} />
            Posting Kabar Baru
          </button>
        )}
      </div>

      {/* --- ADD NEWS FORM --- */}
      {showAddForm && user?.role === 'admin' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs max-w-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
              <Megaphone size={16} className="text-indigo-600" />
              Tulis Publikasi Kegiatan
            </h3>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 text-xs hover:text-slate-600">Abaikan</button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Judul Kabar/Berita</label>
              <input 
                type="text" 
                placeholder="Contoh: Takziah &amp; Penyerahan Santunan Duka Almarhum Bp. Tarigan"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Narasi Lengkap Kegiatan</label>
              <textarea 
                placeholder="Tulis rincian bagaimana jalannya kegiatan sekalian pesan belasungkawa atau terima kasih warga..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={5}
                className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Tanggal Kegiatan</label>
              <input 
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2 text-sm font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Tempat/Lokasi Kegiatan (Kota/Kecamatan)</label>
              <input 
                type="text" 
                placeholder="Contoh: Rumah Duka RT 03 RW 15 Sleman"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Drag and Drop File Upload attachment (Photo / Video) */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-semibold text-slate-500">Lampirkan Foto atau Video Kegiatan (Opsional)</label>
              
              {!mediaFileBase64 ? (
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 transition flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/50 ${
                    dragActive 
                      ? "border-indigo-500 bg-indigo-50/35" 
                      : "border-slate-200 hover:border-slate-350 hover:bg-slate-50"
                  }`}
                  onClick={() => document.getElementById('news-file-upload')?.click()}
                >
                  <input
                    id="news-file-upload"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <div className="p-2.5 bg-white shadow-xs text-indigo-600 rounded-xl border border-slate-100">
                    <UploadCloud size={20} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-slate-755">Tarik &amp; lepas berkas di sini, atau <span className="text-indigo-600 underline">pilih berkas</span></p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Mendukung format foto (.png, .jpg, .jpeg) &amp; video (.mp4, .mov)</p>
                  </div>
                </div>
              ) : (
                <div className="relative border border-slate-200 rounded-xl p-4 bg-slate-50 flex items-center justify-between gap-3 animate-none">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {mediaFileType === 'image' ? (
                      <img src={mediaFileBase64} alt="Pratinjau" className="w-14 h-14 object-cover rounded-lg border border-slate-200" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-14 h-14 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-500">
                        <Film size={20} />
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-slate-700 truncate max-w-[250px] md:max-w-[400px]">{mediaFileName}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 uppercase tracking-wide mt-0.5">
                        {mediaFileType === 'image' ? '🖼️ Gambar Tersemat' : '🎥 Video Tersemat'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearFile}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Batal Lampirkan"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loadingAdd}
              className="md:col-span-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              {loadingAdd ? 'Menerbitkan...' : 'Terbitkan Berita Kegiatan'}
            </button>
          </form>
        </div>
      )}

      {/* Grid of news lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((act) => (
          <div key={act.id} className="bg-white rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between overflow-hidden">
            {/* Foto atau Video bukti kegiatan */}
            {act.mediaUrl && (
              <div className="w-full relative overflow-hidden bg-slate-100 border-b border-slate-200/60 aspect-video flex items-center justify-center">
                {act.mediaType === 'image' ? (
                  <img 
                    src={act.mediaUrl} 
                    alt={act.title} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <video 
                    src={act.mediaUrl} 
                    controls 
                    className="w-full h-full object-cover" 
                  />
                )}
              </div>
            )}
            <div className="p-5 md:p-6 space-y-3.5">
              <div className="flex justify-between items-start gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-slate-400 bg-slate-50 border border-slate-150 px-2.5 py-0.75 rounded-md">
                  <Calendar size={11} className="text-indigo-600" />
                  {act.date}
                </span>

                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleDelete(act.id)}
                    disabled={deletingId === act.id}
                    className="p-1 text-slate-300 hover:text-rose-600 rounded-lg transition hover:bg-rose-50"
                    title="Hapus Berita"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 md:max-h-[44px]">
                  {act.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-4">
                  {act.content}
                </p>
              </div>
            </div>

            {/* News footer metadata */}
            <div className="p-4 bg-slate-50 border-t border-slate-100/60 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1 font-medium">
                <MapPin size={11} className="text-rose-500" />
                {act.location}
              </span>
              <span className="flex items-center gap-0.5">
                <User size={10} />
                Penulis: {act.addedBy.split(' ')[0]}
              </span>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <p className="col-span-1 md:col-span-3 py-16 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-250">
            Belum ada dokumentasi publikasi kabar kegiatan STM terbit.
          </p>
        )}
      </div>
    </div>
  );
}
