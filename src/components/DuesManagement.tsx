/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  Check, 
  Clock, 
  HelpCircle, 
  FileText, 
  QrCode, 
  Smartphone, 
  Coins,
  Send,
  User,
  Users,
  Eye,
  AlertCircle,
  Edit2,
  Trash2
} from 'lucide-react';
import { AuthUser, Bill, BillStatus, Member, MemberStatus } from '../types';

interface DuesManagementProps {
  user: AuthUser | null;
  bills: Bill[];
  members: Member[];
  onCreateBill: (billData: { title: string; description: string; amount: number; dueDate: string; forAll: boolean; memberId?: string }) => Promise<any>;
  onPayBill: (id: string, paymentMethod: string, paymentProof: string) => Promise<any>;
  onApproveBill: (id: string, approvedBy: string) => Promise<any>;
  onDeleteBill?: (id: string) => Promise<void>;
  onEditBill?: (id: string, updatedFields: Partial<Bill>) => Promise<void>;
}

export default function DuesManagement({
  user,
  bills,
  members,
  onCreateBill,
  onPayBill,
  onApproveBill,
  onDeleteBill,
  onEditBill
}: DuesManagementProps) {
  // Common states
  const [activeTab, setActiveTab] = useState<'member-bills' | 'admin-create' | 'admin-pending'>(
    user?.role === 'admin' ? 'admin-pending' : 'member-bills'
  );

  // Form states (Admin Create Bill)
  const [billTitle, setBillTitle] = useState('');
  const [billDesc, setBillDesc] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDueDate, setBillDueDate] = useState('2026-06-30');
  const [billTargetAll, setBillTargetAll] = useState(true);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [loadingCreate, setLoadingCreate] = useState(false);

  // Payment states (Member Pay Bill)
  const [payingBill, setPayingBill] = useState<Bill | null>(null);
  const [payMethod, setPayMethod] = useState<'qris' | 'bank' | 'wallet'>('qris');
  const [payDetail, setPayDetail] = useState('');
  const [payProofText, setPayProofText] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // View slip states
  const [viewingBillSlip, setViewingBillSlip] = useState<Bill | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Edit & Delete states (Admin)
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editStatus, setEditStatus] = useState<BillStatus>(BillStatus.UNPAID);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenEdit = (bill: Bill) => {
    setEditingBill(bill);
    setEditTitle(bill.title);
    setEditDesc(bill.description);
    setEditAmount(bill.amount.toString());
    setEditDueDate(bill.dueDate);
    setEditStatus(bill.status);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBill || !onEditBill) return;

    if (!editTitle.trim() || !editAmount.trim() || !editDueDate.trim()) {
      alert('Mohon lengkapi semua isian wajib (Judul, Nominal, dan Tanggal Jatuh Tempo).');
      return;
    }

    setIsSavingEdit(true);
    try {
      await onEditBill(editingBill.id, {
        title: editTitle.trim(),
        description: editDesc.trim(),
        amount: Number(editAmount),
        dueDate: editDueDate,
        status: editStatus
      });
      setEditingBill(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteClick = async (bill: Bill) => {
    if (!onDeleteBill) return;
    const isConfirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus tagihan "${bill.title}" untuk anggota ${bill.memberName} secara permanen?`
    );
    if (!isConfirmed) return;

    setDeletingId(bill.id);
    try {
      await onDeleteBill(bill.id);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  // Filters for lists
  const approvedMembersOnly = members.filter(m => m.status === MemberStatus.APPROVED && m.role !== 'admin');
  
  // Specific list counts
  const userBillsList = user ? bills.filter(b => b.memberId === user.id) : [];
  const allPendingPayments = bills.filter(b => b.status === BillStatus.PENDING_PAYMENT);

  const handleCreateBillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billTitle || !billAmount || !billDueDate) {
      alert('Judul, nominal, dan tanggal jatuh tempo wajib diisi.');
      return;
    }
    if (!billTargetAll && !selectedMemberId) {
      alert('Silakan pilih salah satu anggota target.');
      return;
    }

    setLoadingCreate(true);
    try {
      await onCreateBill({
        title: billTitle,
        description: billDesc,
        amount: Number(billAmount),
        dueDate: billDueDate,
        forAll: billTargetAll,
        memberId: billTargetAll ? undefined : selectedMemberId
      });
      // reset form
      setBillTitle('');
      setBillDesc('');
      setBillAmount('');
      setBillTargetAll(true);
      setSelectedMemberId('');
      alert('Tagihan iuran bermutan berhasil dibuat & disebarkan!');
      if (user?.role === 'admin') setActiveTab('admin-pending');
    } catch (err) {
      console.error(err);
      alert('Gagal membuat tagihan.');
    } finally {
      setLoadingCreate(false);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!payingBill) return;
    if (!payProofText) {
      alert('Silakan ketikan keterangan konfirmasi pembayaran atau unggah referensi.');
      return;
    }

    setSubmittingPayment(true);
    try {
      const displayMethodStr = payMethod === 'qris' 
        ? 'QRIS E-Wallet' 
        : payMethod === 'bank' 
        ? `Transfer Bank (${payDetail || 'BCA/Mandiri'})` 
        : `Dompet Digital (${payDetail || 'OVO/GoPay'})`;

      await onPayBill(payingBill.id, displayMethodStr, payProofText);
      alert('Konfirmasi pembayaran terkirim! Menunggu verifikasi administrator.');
      setPayingBill(null);
      setPayProofText('');
    } catch (err) {
      console.error(err);
      alert('Gagal mengirimkan pembayaran.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleApprovePayment = async (billId: string) => {
    setApprovingId(billId);
    try {
      await onApproveBill(billId, user?.name || 'Administrator');
      alert('Pembayaran iuran berhasil disahkan! Laporan Kas Masuk telah terdata otomatis.');
    } catch (err) {
      console.error(err);
      alert('Gagal memverifikasi pendaftaran.');
    } finally {
      setApprovingId(null);
      setViewingBillSlip(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upper Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div>
          <h1 className="text-2xl font-display font-semibold text-slate-800">Iuran &amp; Keuangan Anggota</h1>
          <p className="text-sm text-slate-500">
            Bayar iuran wajib/sukarela secara instan dengan QRIS, bank transfer, atau dompet digital.
          </p>
        </div>

        {/* Tab options */}
        <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => setActiveTab('admin-pending')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'admin-pending' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Clock size={14} />
                Persetujuan Bayar ({allPendingPayments.length})
              </button>
              <button
                onClick={() => setActiveTab('admin-create')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'admin-create' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Plus size={14} />
                Buat Instansi Tagihan
              </button>
            </>
          )}
          <button
            onClick={() => setActiveTab('member-bills')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'member-bills' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <CreditCard size={14} />
            {user?.role === 'admin' ? 'Semua Tagihan' : 'Iuran Saya'}
          </button>
        </div>
      </div>

      {/* --- ADMIN: CREATE MEMB BIL PANEL --- */}
      {activeTab === 'admin-create' && user?.role === 'admin' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs space-y-4 max-w-3xl">
          <div className="flex items-center gap-2 text-indigo-700">
            <Plus size={20} />
            <h2 className="text-base font-display font-semibold">Terbitkan Tagihan Iuran Baru</h2>
          </div>

          <form onSubmit={handleCreateBillSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Judul Tagihan</label>
              <input 
                type="text" 
                placeholder="Contoh: Iuran Kas Wajib Melati Juni 2026"
                value={billTitle}
                onChange={(e) => setBillTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none animate-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Deskripsi / Penjelasan Singkat</label>
              <textarea 
                placeholder="Penjelasan rincian pemakaian dana atau landasan duka cita..."
                value={billDesc}
                onChange={(e) => setBillDesc(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Nominal Iuran (IDR)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">Rp</span>
                <input 
                  type="number" 
                  placeholder="25000"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-150 rounded-xl pl-10 pr-4 py-2 text-sm font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Tanggal Jatuh Tempo</label>
              <input 
                type="date"
                value={billDueDate}
                onChange={(e) => setBillDueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2 text-sm font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2 space-y-2 py-2">
              <span className="block text-xs font-medium text-slate-500">Target Anggota</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={billTargetAll} 
                    onChange={() => setBillTargetAll(true)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  Bagikan ke Semua Anggota ({approvedMembersOnly.length} Orang)
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={!billTargetAll}
                    onChange={() => setBillTargetAll(false)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  Target Anggota Spesifik
                </label>
              </div>
            </div>

            {!billTargetAll && (
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">Pilih Anggota Penerima</label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Pilih Salah Satu Anggota --</option>
                  {approvedMembersOnly.map(m => (
                    <option key={m.id} value={m.id}>{m.name} (@{m.username})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={loadingCreate}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition disabled:opacity-50"
              >
                {loadingCreate ? 'Memproses...' : 'Terbitkan Tagihan Iuran'}
                <Plus size={14} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- ADMIN: PERSATUAN PERSERTUJUAN PEMBYARAN --- */}
      {activeTab === 'admin-pending' && user?.role === 'admin' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-display font-semibold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Menunggu Pengesahan Pembayaran ({allPendingPayments.length})
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3 px-4">Anggota</th>
                    <th className="py-3 px-4">Tagihan</th>
                    <th className="py-3 px-4">Nominal</th>
                    <th className="py-3 px-4">Metode Bayar</th>
                    <th className="py-3 px-4 text-center">Aksi Slip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {allPendingPayments.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-4 font-semibold text-slate-800">{b.memberName}</td>
                      <td className="py-4 px-4">
                        <div className="text-xs font-semibold text-slate-700">{b.title}</div>
                        <div className="text-[11px] text-slate-400">Tempo: {b.dueDate}</div>
                      </td>
                      <td className="py-4 px-4 font-mono font-semibold text-slate-700">Rp {b.amount.toLocaleString('id-ID')}</td>
                      <td className="py-4 px-4">
                        <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-lg font-medium">
                          {b.paymentMethod}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => setViewingBillSlip(b)}
                          className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1 hover:bg-slate-800 transition"
                        >
                          <Eye size={12} />
                          Periksa Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                  {allPendingPayments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                        Luar biasa! Tidak ada pembayaran yang butuh persetujuan saat ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- ALL / MEMBER BILLS LISTS --- */}
      {activeTab === 'member-bills' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-display font-semibold text-slate-800">
              {user?.role === 'admin' ? 'Monitoring Keuangan Tagihan Warga' : 'Kewajiban Iuran Keanggotaan'}
            </h2>
            <div className="text-xs text-slate-400 font-medium font-mono">
              Total {user?.role === 'admin' ? bills.length : userBillsList.length} Pencatatan
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  {user?.role === 'admin' && <th className="py-3 px-4">Nama Penerima</th>}
                  <th className="py-3 px-4">Rincian Iuran</th>
                  <th className="py-3 px-4">Tarif</th>
                  <th className="py-3 px-4">Jatuh Tempo</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi Pembayaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {(user?.role === 'admin' ? bills : userBillsList).map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition">
                    {user?.role === 'admin' && (
                      <td className="py-4 px-4 font-semibold text-slate-800">{b.memberName}</td>
                    )}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-700 leading-snug">{b.title}</div>
                      <div className="text-xs text-slate-400 line-clamp-1">{b.description}</div>
                    </td>
                    <td className="py-4 px-4 font-mono font-semibold text-slate-700">Rp {b.amount.toLocaleString('id-ID')}</td>
                    <td className="py-4 px-4 font-mono text-xs text-slate-500">{b.dueDate}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${
                        b.status === BillStatus.PAID 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : b.status === BillStatus.PENDING_PAYMENT 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {b.status === BillStatus.PAID ? 'LUNAS' : b.status === BillStatus.PENDING_PAYMENT ? 'DIVERIFIKASI' : 'BELUM LUNAS'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right col-span-1">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {user?.role === 'admin' && (
                          <>
                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenEdit(b)}
                              disabled={deletingId !== null}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
                              title="Ubah Tagihan"
                            >
                              <Edit2 size={13} />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteClick(b)}
                              disabled={deletingId !== null}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                              title="Hapus Tagihan"
                            >
                              <Trash2 size={13} />
                            </button>
                            <span className="text-slate-200 text-xs px-0.5">|</span>
                          </>
                        )}

                        {b.status === BillStatus.UNPAID && user?.role !== 'admin' && (
                          <button
                            onClick={() => setPayingBill(b)}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
                          >
                            Bayar Sekarang
                          </button>
                        )}
                        {b.status === BillStatus.PENDING_PAYMENT && user?.role !== 'admin' && (
                          <span className="text-xs text-amber-600 italic">Menunggu konfirmasi Admin</span>
                        )}
                        {b.status === BillStatus.PAID && (
                          <span className="text-xs text-emerald-600 font-semibold inline-flex items-center gap-0.5" title={`${b.paymentMethod} - Lunas`}>
                            <Check size={14} /> Terverifikasi
                          </span>
                        )}
                        {user?.role === 'admin' && b.status === BillStatus.PENDING_PAYMENT && (
                          <button
                            onClick={() => setViewingBillSlip(b)}
                            disabled={deletingId !== null}
                            className="px-3 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 text-xs font-semibold rounded-xl transition"
                          >
                            Tinjau Slip
                          </button>
                        )}
                        {user?.role === 'admin' && b.status === BillStatus.UNPAID && (
                          <span className="text-[11px] text-rose-500 font-medium bg-rose-50 border border-rose-100/50 px-2 py-0.5 rounded">Belum Bayar</span>
                        )}
                        {user?.role === 'admin' && b.status === BillStatus.PAID && (
                          <span className="text-xs text-emerald-600 font-semibold inline-flex items-center gap-0.5">
                            <Check size={14} /> Terverifikasi
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {(user?.role === 'admin' ? bills : userBillsList).length === 0 && (
                  <tr>
                    <td colSpan={user?.role === 'admin' ? 6 : 5} className="py-12 text-center text-slate-400 text-xs">
                      Tidak ada catatan tagihan iuran yang tersedia.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- PAYMENT MODAL (SCAN QRIS OR BANK SIMULATION) --- */}
      {payingBill && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-display font-semibold text-slate-800">Pembayaran Iuran Sosial</h3>
                <p className="text-xs text-slate-400 mt-1">Pembayaran mudah, transparan, dan realtime.</p>
              </div>
              <button 
                onClick={() => setPayingBill(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
              >
                ✕
              </button>
            </div>

            {/* Bill Summary Alert */}
            <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/50 flex justify-between items-center text-indigo-950">
              <div>
                <span className="text-[11px] font-semibold tracking-wide uppercase text-indigo-500 block">Judul Kewajiban</span>
                <span className="text-sm font-semibold">{payingBill.title}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold tracking-wide uppercase text-indigo-500 block">Tagihan</span>
                <span className="text-base font-bold font-mono">Rp {payingBill.amount.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Selector of payment option */}
            <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setPayMethod('qris')}
                className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                  payMethod === 'qris' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                <QrCode size={14} />
                QRIS Instan
              </button>
              <button
                type="button"
                onClick={() => setPayMethod('bank')}
                className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                  payMethod === 'bank' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                <Smartphone size={14} />
                Bank Transfer
              </button>
              <button
                type="button"
                onClick={() => setPayMethod('wallet')}
                className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                  payMethod === 'wallet' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                <Coins size={14} />
                E-Wallet
              </button>
            </div>

            {/* Details corresponding to selected tab */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              {payMethod === 'qris' && (
                <div className="flex flex-col items-center text-center space-y-3">
                  <span className="text-xs font-bold text-slate-700 bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1 rounded-full">
                    Satu QRIS untuk semua E-Wallet / Mobile Banking
                  </span>
                  
                  {/* Clean Geometric Vector QRIS */}
                  <div className="w-52 h-52 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-inner relative flex items-center justify-center">
                    {/* SVG representation of standard QRIS code */}
                    <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                      {/* Corner Positioners */}
                      <path d="M0,0 h25 v7 h-18 v18 h-7 z M0,0" />
                      <path d="M100,0 h-25 v7 h18 v18 h7 z M100,0" />
                      <path d="M0,100 h25 v-7 h-18 v-18 h-7 z M0,100" />
                      <path d="M100,100 h-25 v-7 h18 v-18 h7 z M100,100" />
                      
                      {/* Standard nested square position indicators */}
                      <rect x="10" y="10" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="4" />
                      <rect x="16" y="16" width="10" height="10" />
                      
                      <rect x="68" y="10" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="4" />
                      <rect x="74" y="16" width="10" height="10" />
                      
                      <rect x="10" y="68" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="4" />
                      <rect x="16" y="74" width="10" height="10" />

                      {/* Fake center logo placeholder for 'STM' */}
                      <rect x="42" y="42" width="16" height="16" rx="4" fill="#047857" />
                      <text x="50" y="52" fill="white" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">STM</text>

                      {/* Random abstract QR noise */}
                      <rect x="36" y="10" width="4" height="4" />
                      <rect x="44" y="14" width="8" height="4" />
                      <rect x="56" y="10" width="4" height="8" />
                      <rect x="36" y="24" width="12" height="4" />
                      <rect x="52" y="22" width="4" height="4" />

                      <rect x="10" y="36" width="8" height="4" />
                      <rect x="22" y="36" width="4" height="12" />
                      <rect x="10" y="48" width="4" height="4" />
                      <rect x="18" y="52" width="12" height="4" />

                      <rect x="74" y="36" width="16" height="4" />
                      <rect x="68" y="44" width="4" height="8" />
                      <rect x="78" y="48" width="12" height="4" />
                      <rect x="74" y="56" width="4" height="8" />

                      <rect x="36" y="68" width="4" height="16" />
                      <rect x="44" y="74" width="16" height="4" />
                      <rect x="56" y="68" width="4" height="4" />
                      <rect x="52" y="80" width="12" height="4" />

                      <rect x="68" y="68" width="12" height="4" />
                      <rect x="84" y="74" width="6" height="8" />
                      <rect x="68" y="80" width="8" height="4" />
                      <rect x="80" y="88" width="10" height="4" />
                    </svg>
                  </div>
                  <div className="text-xs text-slate-400">
                    Pindai kode QR di atas di ponsel Anda, lalu bayar menggunakan GoPay, OVO, ShopeePay, LinkAja, atau m-Banking Anda.
                  </div>
                </div>
              )}

              {payMethod === 'bank' && (
                <div className="space-y-3 font-display">
                  <div className="p-3 bg-white rounded-xl border border-slate-150 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block font-mono">Bank Central Asia (BCA)</span>
                      <strong className="text-sm tracking-wide text-slate-800 font-mono">842-1082-901</strong>
                      <span className="text-slate-400 block mt-0.5">a/n Yayasan Serikat Tolong Menolong</span>
                    </div>
                    <button 
                      onClick={() => { navigator.clipboard.writeText('8421082901'); alert('Nomor Rekening BCA Berhasil disalin!'); }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[11px] font-bold rounded-lg transition"
                    >
                      Salin Rek
                    </button>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-150 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block font-mono">Bank Mandiri Syariah</span>
                      <strong className="text-sm tracking-wide text-slate-800 font-mono">137-0099-28-09</strong>
                      <span className="text-slate-400 block mt-0.5">a/n Yayasan Serikat Tolong Menolong</span>
                    </div>
                    <button 
                      onClick={() => { navigator.clipboard.writeText('13700992809'); alert('Nomor Rekening Mandiri Berhasil disalin!'); }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[11px] font-bold rounded-lg transition"
                    >
                      Salin Rek
                    </button>
                  </div>
                </div>
              )}

              {payMethod === 'wallet' && (
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-150 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block font-semibold">OVO / DANA / GOPAY</span>
                      <strong className="text-sm text-slate-800 font-mono">0812-3456-7890</strong>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded text-[10px]">Aktif</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed text-center">
                    Transfer langsung ke dompet digital sekretaris STM di atas, lampirkan nama pengirim di deskripsi transfer dompet Anda.
                  </p>
                </div>
              )}
            </div>

            {/* Proof text */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600">
                Pernyataan / Referensi Slip Pembayaran (Wajib)
              </label>
              <textarea 
                placeholder="Contoh: Pembayaran iuran lewat Bank Mandiri a/n Budi Santoso tuntas tanggal 2 Juni jam 14:00. Nomor Transaksi: 98127391."
                value={payProofText}
                onChange={(e) => setPayProofText(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <AlertCircle size={12} className="text-indigo-600 shrink-0" />
                <span>Format bukti rincian transfer digunakan administrator untuk audit digital kas.</span>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setPayingBill(null)}
                className="flex-1 py-2.5 bg-slate-150 text-slate-600 font-semibold text-xs rounded-xl hover:bg-slate-200 transition"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handlePaymentSubmit}
                disabled={submittingPayment}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1"
              >
                {submittingPayment ? 'Memproses...' : 'Kirim Konfirmasi'}
                <Send size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DETAILED SLIP MODAL FOR ADM TO VERIFY --- */}
      {viewingBillSlip && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xl max-w-md w-full space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-display font-semibold text-slate-800">Tinjau Bukti Bayar Iuran</h3>
                <p className="text-xs text-slate-400 mt-0.5">Konfirmasi transfer dana dari anggota sebelum dicatatkan otomatis.</p>
              </div>
              <button onClick={() => setViewingBillSlip(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3.5 bd bg-slate-50 p-4 rounded-xl border border-slate-150 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Anggota Pengirim:</span>
                <strong className="text-slate-800">{viewingBillSlip.memberName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Judul Kewajiban:</span>
                <strong className="text-slate-800">{viewingBillSlip.title}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nominal Tagihan:</span>
                <strong className="text-indigo-600 font-mono font-bold">Rp {viewingBillSlip.amount.toLocaleString('id-ID')}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Metode Pengiriman:</span>
                <span className="bg-indigo-150 text-indigo-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                  {viewingBillSlip.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tanggal Bayar (Sistem):</span>
                <span className="text-slate-600">{viewingBillSlip.paidAt ? new Date(viewingBillSlip.paidAt).toLocaleDateString('id-ID') : '-'}</span>
              </div>

              <div className="border-t border-slate-200/60 pt-3 mt-3">
                <span className="text-slate-400 block mb-1">Catatan/Pernyataan Bayar Dari Anggota:</span>
                <blockquote className="p-3 bg-white rounded-xl border border-slate-155 text-slate-600 leading-relaxed font-mono text-[11px]">
                  "{viewingBillSlip.paymentProof}"
                </blockquote>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setViewingBillSlip(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition"
              >
                Tutup
              </button>
              <button
                onClick={() => handleApprovePayment(viewingBillSlip.id)}
                disabled={approvingId !== null}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-lg transition flex items-center justify-center gap-1"
              >
                {approvingId ? 'Mengesahkan...' : 'Sahkan Lunas & Catat Kas'}
                <Check size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Bill Modal Overlay */}
      {editingBill && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800 text-base">Ubah Data Tagihan</h3>
                <p className="text-xs text-slate-400 mt-0.5">Edit detail rincian tagihan iuran warga.</p>
              </div>
              <button 
                onClick={() => setEditingBill(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Judul Tagihan *</label>
                <input 
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Deskripsi / Penjelasan Singkat</label>
                <textarea 
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Nominal Iuran (Rp) *</label>
                  <input 
                    type="number"
                    required
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Tanggal Jatuh Tempo *</label>
                  <input 
                    type="date"
                    required
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Status Tagihan</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as BillStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                >
                  <option value={BillStatus.UNPAID}>Belum Lunas (Unpaid)</option>
                  <option value={BillStatus.PENDING_PAYMENT}>Menunggu Verifikasi (Pending)</option>
                  <option value={BillStatus.PAID}>Lunas Terverifikasi (Paid)</option>
                </select>
              </div>

              {/* Action Buttons inside Form Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-white">
                <button
                  type="button"
                  onClick={() => setEditingBill(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold border border-slate-200 transition"
                  disabled={isSavingEdit}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition"
                  disabled={isSavingEdit}
                >
                  {isSavingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
