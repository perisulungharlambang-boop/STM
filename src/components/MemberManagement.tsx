/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Check, 
  X, 
  Shield, 
  Clock, 
  Phone, 
  MapPin, 
  UserPlus,
  Edit2,
  Trash2
} from 'lucide-react';
import { Member, MemberStatus, MemberRole } from '../types';

interface MemberManagementProps {
  members: Member[];
  onUpdateStatus: (id: string, status: MemberStatus) => void;
  onRefresh: () => void;
  onDeleteMember: (id: string) => Promise<void>;
  onEditMember: (id: string, updatedFields: Partial<Member>) => Promise<void>;
}

export default function MemberManagement({
  members,
  onUpdateStatus,
  onRefresh,
  onDeleteMember,
  onEditMember
}: MemberManagementProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  // Edit & Delete states
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editFamilySize, setEditFamilySize] = useState(1);
  const [editRole, setEditRole] = useState<MemberRole>(MemberRole.MEMBER);
  const [editStatus, setEditStatus] = useState<MemberStatus>(MemberStatus.PENDING);
  const [editJabatan, setEditJabatan] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenEdit = (member: Member) => {
    setEditingMember(member);
    setEditName(member.name);
    setEditUsername(member.username);
    setEditPhone(member.phone);
    setEditAddress(member.address);
    setEditFamilySize(member.familySize);
    setEditRole(member.role);
    setEditStatus(member.status);
    setEditJabatan(member.jabatan || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    if (!editName.trim() || !editUsername.trim() || !editPhone.trim() || !editAddress.trim()) {
      alert('Mohon lengkapi semua isian wajib (Nama, Username, No. HP, dan Alamat).');
      return;
    }

    setIsSavingEdit(true);
    try {
      await onEditMember(editingMember.id, {
        name: editName.trim(),
        username: editUsername.trim().toLowerCase(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
        familySize: Number(editFamilySize),
        role: editRole,
        status: editStatus,
        jabatan: editJabatan.trim() || undefined
      });
      setEditingMember(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteClick = async (member: Member) => {
    const isConfirmed = window.confirm(
      `PERINGATAN!\n\nApakah Anda yakin ingin menghapus data anggota "${member.name}" secara permanen? Seluruh riwayat transaksi duka atau tagihan tidak akan terhapus namun profil keanggotaannya akan hilang.`
    );
    if (!isConfirmed) return;

    setDeletingId(member.id);
    try {
      await onDeleteMember(member.id);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  // Stats
  const totalApproved = members.filter(m => m.status === MemberStatus.APPROVED).length;
  const totalPending = members.filter(m => m.status === MemberStatus.PENDING).length;
  const totalRejected = members.filter(m => m.status === MemberStatus.REJECTED).length;

  const handleStatusChange = async (memberId: string, status: MemberStatus) => {
    setSubmittingId(memberId);
    try {
      await onUpdateStatus(memberId, status);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingId(null);
    }
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.phone.includes(searchTerm) || 
                          m.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && m.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header and Counters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-slate-800">Manajemen Anggota STM</h1>
          <p className="text-sm text-slate-500">
            Setujui pendaftaran baru dari WhatsApp dan kelola status keanggotaan warga serikat.
          </p>
        </div>
        
        {/* Simple badge statistics */}
        <div className="flex gap-2.5 flex-wrap">
          <div className="px-3.5 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-indigo-100">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Disetujui: {totalApproved}
          </div>
          {totalPending > 0 ? (
            <div className="px-3.5 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-amber-100 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
              Menunggu: {totalPending}
            </div>
          ) : (
            <div className="px-3.5 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-100">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              Menunggu: {totalPending}
            </div>
          )}
          <div className="px-3.5 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-100">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            Ditolak: {totalRejected}
          </div>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari anggota (Nama, HP, Username, Alamat)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-150 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((stat) => (
            <button
              key={stat}
              onClick={() => setFilterStatus(stat)}
              className={`px-4 py-2 rounded-xl text-xs font-medium capitalize border transition ${
                filterStatus === stat 
                  ? 'bg-slate-900 border-slate-900 text-white' 
                  : 'bg-white border-slate-150 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {stat === 'all' ? 'Semua' : stat === 'pending' ? 'Menunggu' : stat === 'approved' ? 'Aktif' : 'Ditolak'}
            </button>
          ))}
        </div>
      </div>

      {/* Member list section */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-4 px-6">Informasi Anggota</th>
                <th className="py-4 px-6">Alamat Rumah</th>
                <th className="py-4 px-6">Anggota Kel.</th>
                <th className="py-4 px-6">Status Akun</th>
                <th className="py-4 px-6 text-right">Aksi Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/40 transition">
                  {/* Info and phone */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        member.role === MemberRole.ADMIN 
                        ? 'bg-purple-50 text-purple-600' 
                        : member.status === MemberStatus.PENDING 
                        ? 'bg-amber-50 text-amber-600 animate-pulse'
                        : 'bg-indigo-50 text-indigo-600'
                      }`}>
                        {member.role === MemberRole.ADMIN ? <Shield size={18} /> : <Users size={18} />}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          {member.name}
                          {member.role === MemberRole.ADMIN && (
                            <span className="px-1.5 py-0.25 bg-purple-100 text-[10px] text-purple-700 font-medium rounded">
                              Admin ok
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>@{member.username}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Phone size={10} />
                            {member.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Address */}
                  <td className="py-4 px-6 max-w-[240px]">
                    <div className="text-xs font-medium text-slate-600 flex items-start gap-1">
                      <MapPin size={12} className="text-slate-400 mt-0.5 shrink-0" />
                      <span className="line-clamp-2 leading-snug">{member.address}</span>
                    </div>
                  </td>

                  {/* Family size */}
                  <td className="py-4 px-6">
                    <div className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg inline-block">
                      {member.familySize} Jiwa
                    </div>
                  </td>

                  {/* Current Status */}
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      member.status === MemberStatus.APPROVED 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : member.status === MemberStatus.PENDING 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {member.status === MemberStatus.PENDING && <Clock size={12} className="animate-spin" />}
                      {member.status === MemberStatus.APPROVED ? 'Aktif' : member.status === MemberStatus.PENDING ? 'Menunggu' : 'Ditolak'}
                    </span>
                  </td>                   {/* Actions buttons */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(member)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
                        title="Ubah Data Anggota"
                        disabled={submittingId !== null || deletingId !== null}
                      >
                        <Edit2 size={13} />
                      </button>

                      {/* Delete Button */}
                      {member.role !== MemberRole.ADMIN ? (
                        <button
                          onClick={() => handleDeleteClick(member)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                          title="Hapus Anggota"
                          disabled={submittingId !== null || deletingId !== null}
                        >
                          <Trash2 size={13} />
                        </button>
                      ) : (
                        <button
                          disabled
                          className="p-1.5 bg-slate-100 text-slate-300 rounded-lg cursor-not-allowed opacity-50"
                          title="Admin tidak dapat dihapus untuk keamanan"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}

                      <span className="text-slate-200 text-xs px-0.5">|</span>

                      {member.role === MemberRole.ADMIN ? (
                        <span className="text-xs text-slate-400 italic bg-slate-100 px-2 py-0.5 rounded text-[11px]">Pengurus</span>
                      ) : (
                        <>
                          {member.status === MemberStatus.PENDING && (
                            <>
                              <button
                                onClick={() => handleStatusChange(member.id, MemberStatus.APPROVED)}
                                disabled={submittingId !== null || deletingId !== null}
                                className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition"
                                title="Setujui Anggota"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => handleStatusChange(member.id, MemberStatus.REJECTED)}
                                disabled={submittingId !== null || deletingId !== null}
                                className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg transition"
                                title="Tolak Pendaftaran"
                              >
                                <X size={14} />
                              </button>
                            </>
                          )}

                          {member.status === MemberStatus.APPROVED && (
                            <button
                              onClick={() => handleStatusChange(member.id, MemberStatus.REJECTED)}
                              disabled={submittingId !== null || deletingId !== null}
                              className="text-xs bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 px-3 py-1.5 border border-slate-200 rounded-xl transition font-medium"
                              title="Tangguhkan Anggota"
                            >
                              Tangguhkan
                            </button>
                          )}

                          {member.status === MemberStatus.REJECTED && (
                            <button
                              onClick={() => handleStatusChange(member.id, MemberStatus.APPROVED)}
                              disabled={submittingId !== null || deletingId !== null}
                              className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 border border-indigo-100 rounded-xl transition font-medium"
                              title="Aktifkan Kembali"
                            >
                              Aktifkan
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    Tidak ditemukan anggota yang sesuai filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Member Modal Overlay */}
      {editingMember && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800 text-base">Ubah Data Anggota</h3>
                <p className="text-xs text-slate-400 mt-0.5">Edit detail informasi keanggotaan warga.</p>
              </div>
              <button 
                onClick={() => setEditingMember(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Lengkap *</label>
                <input 
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Username *</label>
                  <input 
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 font-mono">No. WhatsApp *</label>
                  <input 
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Alamat Rumah *</label>
                <textarea 
                  required
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 font-medium">Jumlah Anggota Kel. (Jiwa)</label>
                  <input 
                    type="number"
                    min={1}
                    value={editFamilySize}
                    onChange={(e) => setEditFamilySize(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Jabatan / Peran Tambahan</label>
                  <input 
                    type="text"
                    value={editJabatan}
                    onChange={(e) => setEditJabatan(e.target.value)}
                    placeholder="Contoh: Bendahara, RT"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Peran Akses (Role)</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as MemberRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  >
                    <option value={MemberRole.MEMBER}>Anggota (Member)</option>
                    <option value={MemberRole.ADMIN}>Pengurus (Admin)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 font-medium">Status Akun</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as MemberStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  >
                    <option value={MemberStatus.PENDING}>Menunggu (Pending)</option>
                    <option value={MemberStatus.APPROVED}>Aktif (Approved)</option>
                    <option value={MemberStatus.REJECTED}>Ditolak (Rejected)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons inside Form Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-white">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
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
