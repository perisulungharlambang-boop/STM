/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Shield, 
  Users, 
  Save, 
  CheckCircle, 
  RefreshCw, 
  AlertTriangle, 
  Phone, 
  Coins, 
  Search,
  UserCheck,
  UserX,
  Trash2
} from 'lucide-react';
import { AuthUser, Member, MemberRole } from '../types';
import { db, handleFirestoreError, resetDatabaseAllData } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AppSettingsProps {
  user: AuthUser | null;
  members: Member[];
  onUpdateMemberRole: (id: string, role: MemberRole) => Promise<void>;
  onUpdateMemberJabatan: (id: string, jabatan: string) => Promise<void>;
}

interface EditableJabatanProps {
  memberId: string;
  initialValue: string;
  onSave: (id: string, value: string) => Promise<void>;
}

function EditableJabatan({ memberId, initialValue, onSave }: EditableJabatanProps) {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSave = async (newValue: string) => {
    const trimmed = newValue.trim();
    if (trimmed === initialValue) return;
    
    setSaving(true);
    try {
      await onSave(memberId, trimmed);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Error saving jabatan:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative flex items-center gap-1 min-w-[130px]">
      <input
        type="text"
        value={value}
        list="jabatan-list"
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => handleSave(value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSave(value);
            (e.target as any).blur();
          }
        }}
        placeholder="Anggota Biasa"
        className="w-full pl-2 pr-6 py-1 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-150 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition font-medium"
      />
      <div className="absolute right-1.5 flex items-center justify-center">
        {saving ? (
          <RefreshCw size={10} className="animate-spin text-indigo-500" />
        ) : saved ? (
          <CheckCircle size={10} className="text-emerald-500" />
        ) : null}
      </div>
    </div>
  );
}

export default function AppSettings({
  user,
  members,
  onUpdateMemberRole,
  onUpdateMemberJabatan
}: AppSettingsProps) {
  // Application config states
  const [orgName, setOrgName] = useState('Yayasan Serikat Tolong Menolong (STM)');
  const [tagline, setTagline] = useState('Guyub Rukun Gotong Royong');
  const [adminWA, setAdminWA] = useState('6281234567890');
  const [defaultDues, setDefaultDues] = useState('50000');
  
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Search members state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'member'>('all');
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);

  // Reset database states
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [reseedAfterReset, setReseedAfterReset] = useState(true);

  const handleResetDatabase = async () => {
    if (resetConfirmText !== 'HAPUS') {
      alert('Silakan ketik kata "HAPUS" di kolom konfirmasi untuk memvalidasi operasi reset data.');
      return;
    }

    const modeText = reseedAfterReset
      ? 'Hapus seluruh data saat ini, lalu memulihkan data sampel default (berita, tagihan, kas kuangan, dll).'
      : 'Hapus seluruh database secara total dan permanen (Hanya menyisakan profil pengurus aktif saja agar tetap login).';

    if (!window.confirm(`PERINGATAN KERAS!\n\n${modeText}\n\nApakah Anda benar-benar yakin ingin melanjutkan? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    setIsResetting(true);
    try {
      await resetDatabaseAllData(reseedAfterReset);
      alert(reseedAfterReset 
        ? 'Sukses! Database telah direset dan diisi kembali dengan templat bawaan.' 
        : 'Sukses! Seluruh data di database telah dikosongkan secara total.'
      );
      setResetConfirmText('');
      
      // Force reload page to refresh the state from clean server database
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Gagal mengatur ulang database. Silakan coba lagi beberapa saat.');
    } finally {
      setIsResetting(false);
    }
  };

  // Load configuration from settings/config
  const fetchSettings = async () => {
    setLoadingConfig(true);
    try {
      const docRef = doc(db, 'settings', 'config');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.organizationName) setOrgName(data.organizationName);
        if (data.tagline) setTagline(data.tagline);
        if (data.adminWhatsApp) setAdminWA(data.adminWhatsApp);
        if (data.defaultDuesAmount !== undefined) setDefaultDues(String(data.defaultDuesAmount));
      } else {
        // Create initial default document if missing
        await setDoc(docRef, {
          id: 'config',
          organizationName: orgName,
          tagline: tagline,
          adminWhatsApp: adminWA,
          defaultDuesAmount: Number(defaultDues)
        });
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !tagline.trim() || !adminWA.trim() || !defaultDues) {
      alert('Semua isian formulir preferensi wajib dilengkapi.');
      return;
    }

    setSavingConfig(true);
    setSaveSuccess(false);
    try {
      const docRef = doc(db, 'settings', 'config');
      await setDoc(docRef, {
        id: 'config',
        organizationName: orgName,
        tagline: tagline,
        adminWhatsApp: adminWA,
        defaultDuesAmount: Number(defaultDues)
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
      // Trigger a local storage event or state dispatch if necessary (optional)
      // For immediate updates we can refresh
      window.dispatchEvent(new Event('app-settings-changed'));
    } catch (err) {
      handleFirestoreError(err, 'write', 'settings/config');
      alert('Gagal menyimpan preferensi aplikasi.');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleRoleToggle = async (member: Member) => {
    if (member.id === user?.id) {
      alert('Anda tidak bisa mencabut hak administrator Anda sendiri demi keamanan sistem.');
      return;
    }

    const newRole = member.role === MemberRole.ADMIN ? MemberRole.MEMBER : MemberRole.ADMIN;
    const confirmMsg = newRole === MemberRole.ADMIN 
      ? `Apakah Anda yakin ingin mempromosikan ${member.name} menjadi Administrator?\nAkun ini akan memiliki kendali penuh terhadap laporan, kas, dan keanggotaan.`
      : `Apakah Anda yakin ingin menurunkan hak akses administrator ${member.name} kembali menjadi Anggota biasa?`;

    if (!window.confirm(confirmMsg)) return;

    setUpdatingMemberId(member.id);
    try {
      await onUpdateMemberRole(member.id, newRole);
    } catch (err) {
      console.error(err);
      alert('Gagal memperbarui hak akses keanggotaan.');
    } finally {
      setUpdatingMemberId(null);
    }
  };

  // Only display active approved members for role management
  const filteredMembers = members.filter(m => {
    const isApproved = m.status === 'approved';
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.phone.includes(searchTerm);
    const matchesRole = filterRole === 'all' || m.role === filterRole;

    return isApproved && matchesSearch && matchesRole;
  });

  const adminsCount = members.filter(m => m.status === 'approved' && m.role === MemberRole.ADMIN).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-semibold text-slate-800 flex items-center gap-2">
          <Settings className="text-indigo-600" />
          Pengaturan Aplikasi &amp; Otorisasi
        </h1>
        <p className="text-sm text-slate-500">
          Ubah informasi umum yayasan STM dan kelola siapa saja yang berhak mengakses konsol pengurus (administrator).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Hand: General Settings Form and Danger Zone (5 columns stacked) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200/85 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Settings size={18} className="text-slate-500" />
              <h2 className="font-semibold text-slate-800 text-sm">Konfigurasi Pengenal Yayasan</h2>
            </div>

            {loadingConfig ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                <RefreshCw className="animate-spin text-indigo-500" size={24} />
                <span className="text-xs">Memuat konfigurasi...</span>
              </div>
            ) : (
              <form onSubmit={handleSaveConfig} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Nama Organisasi / Yayasan
                  </label>
                  <input 
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-150 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Mis: Serikat Tolong Menolong (STM)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Slogan / Tagline Komunitas
                  </label>
                  <input 
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-150 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Mis: Guyub Rukun Gotong Royong"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Phone size={12} className="text-indigo-500" />
                    No. WhatsApp Admin Notifikasi
                  </label>
                  <input 
                    type="text"
                    value={adminWA}
                    onChange={(e) => setAdminWA(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-150 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    placeholder="Format: 628xxxxxxxx (Kode negara aktif)"
                    required
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Digunakan sebagai tujuan pengiriman format bukti daftar WhatsApp milik pendaftar baru.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Coins size={12} className="text-amber-500" />
                    Nilai Iuran Bulanan Default (Rp)
                  </label>
                  <input 
                    type="number"
                    value={defaultDues}
                    onChange={(e) => setDefaultDues(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-150 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-700"
                    placeholder="Mis: 50000"
                    required
                  />
                </div>

                {saveSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl flex items-center gap-2 text-xs">
                    <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                    <span>Preferensi berhasil dimutakhirkan secara real-time!</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={savingConfig}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  {savingConfig ? (
                    <RefreshCw className="animate-spin" size={14} />
                  ) : (
                    <Save size={14} />
                  )}
                  Simpan Preferensi Aplikasi
                </button>
              </form>
            )}
          </div>

          {/* Danger Zone Card */}
          <div className="bg-white p-5 rounded-xl border border-rose-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-rose-100">
              <Trash2 size={18} className="text-rose-500" />
              <h2 className="font-semibold text-rose-850 text-sm">Zona Bahaya (Danger Zone)</h2>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100/70 text-xs text-rose-800 leading-normal flex gap-2">
              <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Perhatian Keras!</span> Menghapus seluruh data adalah tindakan permanen. Data iuran, donasi, kas keuangan, diskusi, berita kegiatan, dan keanggotaan warga aktif yang dihapus tidak dapat dipulihkan kembali.
              </div>
            </div>

            <div className="space-y-3.5 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Metode Mengatur Ulang
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setReseedAfterReset(true)}
                    className={`flex flex-col text-left p-3 rounded-xl border text-xs transition ${
                      reseedAfterReset
                        ? 'bg-indigo-50/50 border-indigo-200 text-indigo-950 ring-1 ring-indigo-200'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/50'
                    }`}
                  >
                    <span className="font-bold text-indigo-900">1. Memulihkan Data Sampel Bawaan</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                      Database akan dikosongkan terlebih dahulu lalu diisi ulang otomatis dengan data simulasi default (60 anggota, kas awal, kampanye stroke, dll). Sangat disarankan untuk demo uji coba.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReseedAfterReset(false)}
                    className={`flex flex-col text-left p-3 rounded-xl border text-xs transition ${
                      !reseedAfterReset
                        ? 'bg-rose-50/40 border-rose-200 text-rose-950 ring-1 ring-rose-200'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/50'
                    }`}
                  >
                    <span className="font-bold text-rose-800">2. Kosongkan Total (Wipeout)</span>
                    <span className="text-[10px] text-slate-450 mt-0.5 leading-relaxed">
                      Database duka, iuran, kas, dan diskusi dibersihkan total secara permanen. Hanya menyisakan profil pengurus Anda saat ini agar sesi login simulasi tidak terputus.
                    </span>
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Ketik kata <span className="text-rose-600 font-extrabold">"HAPUS"</span> untuk validasi keamanan:
                </label>
                <input
                  type="text"
                  value={resetConfirmText}
                  onChange={(e) => setResetConfirmText(e.target.value)}
                  placeholder="Ketik HAPUS di sini..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 text-center font-bold text-rose-600 tracking-wider placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-350"
                />
              </div>

              <button
                type="button"
                disabled={resetConfirmText !== 'HAPUS' || isResetting}
                onClick={handleResetDatabase}
                className={`w-full py-2.5 px-4 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 ${
                  resetConfirmText === 'HAPUS' && !isResetting
                    ? 'bg-rose-600 hover:bg-rose-700 cursor-pointer shadow-sm hover:shadow-md'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                }`}
              >
                {isResetting ? (
                  <RefreshCw className="animate-spin" size={14} />
                ) : (
                  <Trash2 size={14} />
                )}
                {isResetting ? 'Sedang Memproses Reset...' : reseedAfterReset ? 'Mulai Reset & Muat Ulang Templat' : 'Kosongkan Semua Data Sekarang'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Hand: Access Control list (7 columns) */}
        <div className="lg:col-span-12 xl:col-span-7 bg-white p-5 rounded-xl border border-slate-200/85 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-indigo-600" />
              <h2 className="font-semibold text-slate-800 text-sm">Otoritas Akses Dashboard Pengurus</h2>
            </div>
            <span className="px-2.5 py-1 bg-indigo-50 rounded-lg text-[11px] text-indigo-700 font-semibold border border-indigo-100 self-start sm:self-auto">
              Total Pengurus Aktif: {adminsCount} orang
            </span>
          </div>

          <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-100/70 text-xs text-amber-800 leading-normal flex gap-2">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Perhatian Keamanan!</span> Hanya akun berstatus <span className="font-semibold">Aktif (Approved)</span> yang dapat dipromosikan sebagai Pengurus. Pengurus admin memiliki wewenang mengesahkan pendaftaran warga, membuat tagihan kas bulanan, menyalurkan kas sosial, dan mempublikasikan info kegiatan.
            </div>
          </div>

          {/* Table control filtering & search */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Cari warga aktif..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-150 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-1">
              {[
                { id: 'all', name: 'Semua' },
                { id: 'admin', name: 'Pengurus Only' },
                { id: 'member', name: 'Anggota Biasa' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFilterRole(opt.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition whitespace-nowrap ${
                    filterRole === opt.id 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>

          {/* Members Table */}
          <div className="border border-slate-100 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100 uppercase tracking-wider">
                    <th className="py-2.5 px-4">Nama &amp; Akun</th>
                    <th className="py-2.5 px-4">Kontak</th>
                    <th className="py-2.5 px-4">Jabatan / Posisi</th>
                    <th className="py-2.5 px-4">Status Akses</th>
                    <th className="py-2.5 px-4 text-right">Opsi Otoritas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((m) => {
                    const isAdmin = m.role === MemberRole.ADMIN;
                    const isSelf = m.id === user?.id;

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            {m.name}
                            {isSelf && (
                              <span className="px-1.5 py-0.25 bg-blue-100 text-[10px] text-blue-700 font-semibold rounded">
                                Saya (Aktif)
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">@{m.username}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {m.phone}
                        </td>
                        <td className="py-3 px-4">
                          <EditableJabatan 
                            memberId={m.id} 
                            initialValue={m.jabatan || ''} 
                            onSave={onUpdateMemberJabatan} 
                          />
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isAdmin 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-indigo-50 text-indigo-700'
                          }`}>
                            <Shield size={10} />
                            {isAdmin ? 'Pengurus (Admin)' : 'Anggota Biasa'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleRoleToggle(m)}
                            disabled={isSelf || updatingMemberId === m.id}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 ml-auto transition ${
                              isAdmin 
                                ? 'bg-slate-150 hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-200' 
                                : 'bg-purple-600 hover:bg-purple-700 text-white'
                            } disabled:opacity-50 disabled:hover:bg-slate-150 disabled:hover:text-slate-600`}
                          >
                            {updatingMemberId === m.id ? (
                              <RefreshCw size={10} className="animate-spin" />
                            ) : isAdmin ? (
                              <>
                                <UserX size={10} />
                                Turunkan Otoritas
                              </>
                            ) : (
                              <>
                                <UserCheck size={10} />
                                Jadikan Admin
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredMembers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Tidak ada warga aktif yang sesuai dengan kriteria filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <datalist id="jabatan-list">
                <option value="Ketua Yayasan" />
                <option value="Wakil Ketua Yayasan" />
                <option value="Sekretaris Yayasan" />
                <option value="Bendahara Yayasan" />
                <option value="Ketua STM" />
                <option value="Wakil Ketua STM" />
                <option value="Sekretaris STM" />
                <option value="Bendahara STM" />
                <option value="Penasihat STM" />
                <option value="Humas Komunitas" />
                <option value="Seksi Sosial &amp; Takziyah" />
                <option value="Seksi Perlengkapan" />
                <option value="Anggota Biasa" />
              </datalist>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
