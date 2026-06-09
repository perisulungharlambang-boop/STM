/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Target, 
  Calendar, 
  Plus, 
  Check, 
  User, 
  MessageCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import { AuthUser, DonationCampaign } from '../types';

interface DonationCrowdfundingProps {
  user: AuthUser | null;
  donations: DonationCampaign[];
  onCreateCampaign: (campaign: { title: string; description: string; targetAmount: number; deadline: string; creator: string }) => Promise<any>;
  onContribute: (campaignId: string, contribution: { donorName: string; amount: number; message?: string }) => Promise<any>;
}

export default function DonationCrowdfunding({
  user,
  donations,
  onCreateCampaign,
  onContribute
}: DonationCrowdfundingProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState<DonationCampaign | null>(null);
  
  // Create Campaign Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newDeadline, setNewDeadline] = useState('2026-07-31');
  const [loadingCreate, setLoadingCreate] = useState(false);

  // Contribute Form State
  const [donorName, setDonorName] = useState(user?.name || '');
  const [donAmount, setDonAmount] = useState('');
  const [donMessage, setDonMessage] = useState('');
  const [loadingContribute, setLoadingContribute] = useState(false);

  const handleCreateCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newTarget || !newDeadline) {
      alert('Judul, target dana, dan tenggat waktu wajib diisi.');
      return;
    }

    setLoadingCreate(true);
    try {
      await onCreateCampaign({
        title: newTitle,
        description: newDesc,
        targetAmount: Number(newTarget),
        deadline: newDeadline,
        creator: user?.name || 'Pengurus STM'
      });
      alert('Kampanye Penggalangan Dana Gotong Royong Berhasil Diterbitkan!');
      setShowCreateForm(false);
      setNewTitle('');
      setNewDesc('');
      setNewTarget('');
    } catch (err) {
      console.error(err);
      alert('Gagal meluncurkan program donasi.');
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleContributeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCampaign) return;
    if (!donorName || !donAmount) {
      alert('Nama donatur dan nominal donasi wajib diisi.');
      return;
    }

    setLoadingContribute(true);
    try {
      await onContribute(activeCampaign.id, {
        donorName,
        amount: Number(donAmount),
        message: donMessage
      });
      
      alert(`Terima kasih banyak atas donasi Anda! Dana Rp ${Number(donAmount).toLocaleString('id-ID')} telah tercatat di dalam kampanye.`);
      setDonAmount('');
      setDonMessage('');
      
      // Update local state viewing campaign to reflect donation natively
      const freshCamp = donations.find(d => d.id === activeCampaign.id);
      if (freshCamp) {
        setActiveCampaign(freshCamp);
      } else {
        setActiveCampaign(null);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mendata donasi Anda.');
    } finally {
      setLoadingContribute(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Call to Act */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-slate-800">Penggalangan Dana Sosio-Warga</h1>
          <p className="text-sm text-slate-500">
            Saluran bantuan gotong-royong kekeluargaan untuk meringankan beban musibah, kesehatan, dan perbaikan sarana sosial warga.
          </p>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={() => { setShowCreateForm(!showCreateForm); setActiveCampaign(null); }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 self-start md:self-auto"
          >
            <Plus size={15} />
            Buka Penggalangan Baru
          </button>
        )}
      </div>

      {/* --- FORM TO CREATE NEW DONATION CAMPAIGN (ADMIN) --- */}
      {showCreateForm && user?.role === 'admin' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs max-w-2xl space-y-4">
          <h3 className="text-base font-display font-bold text-slate-800">Formulir Peluncuran Program Donasi</h3>
          <form onSubmit={handleCreateCampaignSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Judul Kampanye Donasi</label>
              <input 
                type="text" 
                placeholder="Contoh: Gotong Royong Biaya Pendidikan Yatim Sdr. Alm. Agus"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Narasi Deskripsi Kasus</label>
              <textarea 
                placeholder="Tuliskan cerita kondisi warga, seberapa mendesak bantuan ini, serta rencana penyaluran dana..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Target Dana Dibutuhkan (IDR)</label>
              <input 
                type="number" 
                placeholder="Rekomendasi contoh: 10000000"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-mono focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Batas Akhir Pencarian Dana</label>
              <input 
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-mono focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loadingCreate}
              className="md:col-span-2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              {loadingCreate ? 'Menerbitkan...' : 'Sebarkan Ajakan Donasi'}
            </button>
          </form>
        </div>
      )}

      {/* Grid of donation programs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {donations.map((camp) => {
          const ratio = Math.min((camp.currentAmount / camp.targetAmount) * 100, 100);
          const isCompleted = camp.currentAmount >= camp.targetAmount || camp.status === 'completed';

          return (
            <div 
              key={camp.id} 
              className={`bg-white rounded-xl border shadow-xs overflow-hidden flex flex-col justify-between ${
                activeCampaign?.id === camp.id ? 'border-rose-350 ring-1 ring-rose-150' : 'border-slate-200/80'
              }`}
            >
              {/* Campaign header visual status */}
              <div className="p-5 md:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                    isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-50 text-rose-700 animate-pulse'
                  }`}>
                    {isCompleted ? 'Target Tercapai' : 'Donasi Terbuka'}
                  </span>
                  
                  <span className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                    <Calendar size={12} />
                    Hingga: {camp.deadline}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-display font-bold text-slate-800 leading-tight">
                    {camp.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {camp.description}
                  </p>
                </div>

                {/* Progress bar and details */}
                <div className="space-y-2 pt-2">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${ratio}%` }} 
                      className={`h-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-xs font-medium">
                    <div className="text-slate-500">
                      Terkumpul: <strong className="text-slate-800">Rp {camp.currentAmount.toLocaleString('id-ID')}</strong>
                    </div>
                    <div className="text-slate-400">
                      Target: <span className="font-mono">{ratio.toFixed(0)}%</span> Dari <span className="text-slate-700 font-mono">Rp {camp.targetAmount.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer action */}
              <div className="bg-slate-50 border-t border-slate-100 p-4 md:px-6 flex items-center justify-between gap-3">
                <span className="text-[10px] text-slate-400 font-medium">Melalui: {camp.creator}</span>
                <button
                  onClick={() => {
                    setActiveCampaign(activeCampaign?.id === camp.id ? null : camp);
                    setDonorName(user?.name || '');
                  }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition ${
                    isCompleted && activeCampaign?.id !== camp.id
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800' 
                      : 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                  }`}
                >
                  {activeCampaign?.id === camp.id ? 'Tutup Detail' : isCompleted ? 'Tinjau Rincian Donatur' : 'Donasi Sekarang'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- ACTIVE CAMPAIGN DETAIL & CONTRIBUTION PANEL (SUBBED VIEW) --- */}
      {activeCampaign && (
        <div className="bg-white rounded-xl border border-rose-150 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-y-6">
          {/* Donation History / Donors List (7 Cols) */}
          <div className="p-6 md:p-8 md:col-span-7 space-y-5">
            <div className="flex items-center gap-2">
              <Award size={20} className="text-rose-600" />
              <h3 className="text-base font-display font-semibold text-slate-800">
                Pencatatan Donatur ({activeCampaign.contributions.length} Orang)
              </h3>
            </div>

            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-2">
              {activeCampaign.contributions.map((cont) => (
                <div key={cont.id} className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100 flex items-start gap-3.5 text-xs">
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0">
                    {cont.donorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-800">{cont.donorName}</span>
                      <strong className="text-rose-700 font-mono">Rp {cont.amount.toLocaleString('id-ID')}</strong>
                    </div>
                    {cont.message && (
                      <p className="text-slate-500 leading-relaxed italic">
                        "{cont.message}"
                      </p>
                    )}
                    <span className="text-[10px] text-slate-400 block pt-1">{cont.date}</span>
                  </div>
                </div>
              ))}
              {activeCampaign.contributions.length === 0 && (
                <p className="text-slate-400 py-6 text-center text-xs">Jadilah donatur pertama untuk menginspirasi gotong royong ini!</p>
              )}
            </div>
          </div>

          {/* Form to donate / Submit contribution (5 Cols) */}
          <div className="p-6 md:p-8 md:col-span-5 bg-rose-50/35 border-t md:border-t-0 md:border-l border-rose-100 space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Ambil Bagian &amp; Donasi</h3>
              <p className="text-xs text-slate-500">Salurkan kepedulian Anda secara langsung melalui formulir otomatis ini.</p>
            </div>

            <form onSubmit={handleContributeSubmit} className="space-y-3 font-display">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Nama Donatur (Simulasi)</label>
                <input 
                  type="text" 
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Isi nama Anda (atau Hamba Allah)"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Nominal Donasi (IDR)</label>
                <input 
                  type="number" 
                  value={donAmount}
                  onChange={(e) => setDonAmount(e.target.value)}
                  placeholder="Nominal (Contoh: 150000)"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono focus:ring-1 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Pesan Doa / Harapan Kehangatan (Opsional)</label>
                <textarea 
                  value={donMessage}
                  onChange={(e) => setDonMessage(e.target.value)}
                  placeholder="Semoga lekas diangkat penyakitnya..."
                  rows={2}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loadingContribute}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-200 disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {loadingContribute ? 'Mengirim Donasi...' : 'Kirim Sumbangan Gotong Royong'}
                <HeartHandshake size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
