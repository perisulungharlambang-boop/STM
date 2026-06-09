/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { 
  Phone, 
  Send, 
  Copy, 
  Check, 
  UserPlus, 
  HelpCircle, 
  AlertCircle 
} from 'lucide-react';

interface RegistrationWhatsAppProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function RegistrationWhatsApp({
  onSuccess,
  onCancel
}: RegistrationWhatsAppProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [familySize, setFamilySize] = useState('3');
  const [loading, setLoading] = useState(false);
  
  // Dynamic App Settings from config doc
  const [adminPhone, setAdminPhone] = useState('6281234567890');
  const [targetOrg, setTargetOrg] = useState('Serikat Tolong Menolong (STM)');

  // Link and draft templates
  const [waUrl, setWaUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [suggestedUser, setSuggestedUser] = useState('');

  // Fetch settings config on mount
  React.useEffect(() => {
    const loadRegSettings = async () => {
      try {
        const { getDoc, doc } = await import('firebase/firestore');
        const docRef = doc(db, 'settings', 'config');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.adminWhatsApp) setAdminPhone(data.adminWhatsApp);
          if (data.organizationName) setTargetOrg(data.organizationName);
        }
      } catch (err) {
        console.warn('Failed to load registration settings:', err);
      }
    };
    loadRegSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      alert('Nama, No WhatsApp, dan Alamat rumah wajib diisi untuk registrasi.');
      return;
    }

    setLoading(true);
    try {
      const newMemberId = 'member-' + Date.now();
      const lowerUsername = name.toLowerCase().split(' ')[0] + Math.floor(100 + Math.random() * 900);
      
      const newMember = {
        id: newMemberId,
        name,
        username: lowerUsername,
        phone,
        address,
        familySize: Number(familySize) || 1,
        role: 'member',
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'members', newMemberId), newMember);

      const waText = `Halo Admin ${targetOrg} 🤝,

Saya bermaksud mendaftar keanggotaan baru ${targetOrg} via Aplikasi Web:
*Nama*: ${name}
*No. HP/WA*: ${phone}
*Alamat Rumah*: ${address}
*Anggota Keluarga*: ${familySize} Orang

*Username Aplikasi yang diusulkan*: ${lowerUsername}
*Kata Kunci Default*: member

Mohon segera diverifikasi dan diaktifkan akun saya. Terima kasih banyak, Gotong Royong Selalu!`;

      const waLink = `https://api.whatsapp.com/send?phone=${adminPhone}&text=${encodeURIComponent(waText)}`;

      setWaUrl(waLink);
      setSuggestedUser(lowerUsername);
      setSuccessMsg(true);
    } catch (err) {
      console.error(err);
      alert('Pendaftaran gagal. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = () => {
    const textToCopy = `Halo Admin ${targetOrg} 🤝,

Saya bermaksud mendaftar keanggotaan baru ${targetOrg} via Aplikasi Web:
Nama: ${name}
No. HP/WA: ${phone}
Alamat Rumah: ${address}
Anggota Keluarga: ${familySize} Orang

Username Aplikasi yang diusulkan: ${suggestedUser}
Kata Kunci Default: member

Mohon segera diverifikasi dan diaktifkan akun saya. Terima kasih banyak, Gotong Royong Selalu!`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200/80 shadow-xl max-w-2xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-800 flex items-center justify-center shrink-0">
          <UserPlus size={22} className="text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-display font-bold text-slate-800">Daftar Anggota Baru Serikat</h2>
          <p className="text-xs text-slate-400 mt-0.5">Sistem integrasi satu sentuhan via formulir website &amp; WhatsApp.</p>
        </div>
      </div>

      {!successMsg ? (
        <form onSubmit={handleSubmit} className="space-y-4 font-display text-slate-700">
          <p className="text-xs text-slate-500 leading-relaxed bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/50 flex items-start gap-2">
            <HelpCircle size={20} className="text-indigo-600 shrink-0 mt-0.5" />
            <span>
              Pendaftaran anggota Serikat Tolong Menolong membutuhkan validasi nomor handphone WhatsApp aktif. Formulir ini akan mendaftarkan draf profil Anda pada aplikasi lalu merumuskan format pesan otomatis untuk dikirim ke WhatsApp koordinator pengurus.
            </span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Lengkap</label>
              <input 
                type="text" 
                placeholder="Contoh: Budi Santoso"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">No. HP / WhatsAppAktif</label>
              <input 
                type="tel" 
                placeholder="Contoh: 085712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Jumlah Anggota Keluarga (Jiwa)</label>
              <input 
                type="number" 
                min="1"
                placeholder="3"
                value={familySize}
                onChange={(e) => setFamilySize(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Alamat Rumah Lengkap (RT/RW)</label>
              <textarea 
                placeholder="Contoh: Perum Suka Damai, No 12, RT 02/RW 15, Sleman"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                rows={3}
                className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
               type="submit"
               disabled={loading}
               className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-100 flex items-center justify-center gap-1.5 disabled:opacity-50"
             >
               {loading ? 'Menyimpan Berkas...' : 'Ajukan Berkas & Mulai Pengiriman WA'}
               <Send size={15} />
             </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Sudah memiliki akun? Masuk Sekarang
              </button>
            )}
          </div>
        </form>
      ) : (
        <div className="space-y-5 text-center py-4 font-display">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-700 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            ✓
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-800">Berkas Draf Pendaftaran Tersimpan!</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Draf akun telah berhasil tersimpan di sistem kami dengan status <strong className="text-amber-600">Pending Approval</strong>. Langkah terakhir adalah mengaktifkannya dengan mengirim pesan konfirmasi otomatis ke administrator di bawah ini.
            </p>
          </div>

          {/* Action buttons (WhatsApp direct & Fail-safe manual clipboard copy) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-w-md mx-auto text-left space-y-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">1. Tindakan Cepat (Direct Tab)</span>
            <a 
              href={waUrl} 
              target="_blank" 
              rel="noreferrer"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Phone size={15} />
              Kirim Format Chat via WhatsApp
            </a>

            <div className="border-t border-slate-200/80 my-3 pt-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">2. Tindakan Cadangan (Copy Format)</span>
              <p className="text-[10px] text-slate-400 leading-snug mb-2">
                *Jika popup perambah diblokir, silakan salin format pesan di bawah secara manual lalu kirimkan ke nomor WhatsApp pengurus.
              </p>
              
              <button
                onClick={handleCopyText}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-medium transition flex items-center justify-center gap-1.5"
              >
                {copied ? <Check size={14} /> : <Copy size={13} />}
                {copied ? 'Tersalin ke Clipboard!' : 'Salin Format Pesan Registrasi'}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => { setSuccessMsg(false); onSuccess(); }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition"
            >
              ← Kembali ke Formulir Pendaftaran / Laman Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
