/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Calendar, 
  Layers, 
  BookOpen, 
  User, 
  DollarSign,
  Download
} from 'lucide-react';
import { AuthUser, FinancialRecord, FinanceType } from '../types';

interface FinancialTransparencyProps {
  user: AuthUser | null;
  finances: FinancialRecord[];
  onAddRecord: (record: { type: FinanceType; category: string; amount: number; description: string; date: string; addedBy: string }) => Promise<any>;
}

export default function FinancialTransparency({
  user,
  finances,
  onAddRecord
}: FinancialTransparencyProps) {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);

  // Form states
  const [formType, setFormType] = useState<FinanceType>(FinanceType.INCOME);
  const [formCategory, setFormCategory] = useState('Iuran Kas Bulanan');
  const [formAmount, setFormAmount] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);

  // Compute sums
  const totalIncome = finances
    .filter(f => f.type === FinanceType.INCOME)
    .reduce((acc, f) => acc + f.amount, 0);
  const totalExpense = finances
    .filter(f => f.type === FinanceType.EXPENSE)
    .reduce((acc, f) => acc + f.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleSubmitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCategory || !formAmount || !formDesc || !formDate) {
      alert('Semua baris formulir wajib diisi.');
      return;
    }

    setLoadingAdd(true);
    try {
      await onAddRecord({
        type: formType,
        category: formCategory,
        amount: Number(formAmount),
        description: formDesc,
        date: formDate,
        addedBy: user?.name || 'Administrator'
      });
      alert('Transaksi pembukuan baru berhasil dicatatkan!');
      setShowAddForm(false);
      // Reset form
      setFormAmount('');
      setFormDesc('');
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan transaksi.');
    } finally {
      setLoadingAdd(false);
    }
  };

  const filteredRecords = finances.filter(f => {
    if (filterType === 'all') return true;
    return f.type === filterType;
  });

  // Calculate percentages for visual bars
  const totalInAndOut = totalIncome + totalExpense || 1;
  const incomePercent = Math.round((totalIncome / totalInAndOut) * 100);
  const expensePercent = Math.round((totalExpense / totalInAndOut) * 100);

  const categoriesOfIncome = ['Iuran Kas Bulanan', 'Sumbangan Donatur', 'Donasi Gotong Royong', 'Kas Bulanan (App)'];
  const categoriesOfExpense = ['Santunan Duka', 'Peralatan & Perlengkapan', 'Santunan Kesehatan', 'Konsumsi & Masjid'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-slate-800">Transparansi Laporan Keuangan</h1>
          <p className="text-sm text-slate-500">
            Pertanggungjawaban sirkulasi arus kas keluar-masuk Serikat Tolong Menolong (STM) aktual secara menyeluruh.
          </p>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={() => { setShowAddForm(!showAddForm); setFormType(FinanceType.INCOME); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 self-start md:self-auto hover:shadow-lg"
          >
            <Plus size={15} />
            Catat Pembukuan Baru
          </button>
        )}
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Income Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/85 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wide">Pemasukan Akumulatif</span>
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <ArrowUpRight size={18} />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-display tracking-tight text-slate-800">
              Rp {totalIncome.toLocaleString('id-ID')}
            </span>
            <div className="text-[11px] text-slate-400 mt-1">Donasi, Iuran Wajib, &amp; Sumbangan</div>
          </div>
        </div>

        {/* Total Expense Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/85 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wide">Penyaluran / Belanja</span>
            <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <ArrowDownLeft size={18} />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-display tracking-tight text-slate-800">
              Rp {totalExpense.toLocaleString('id-ID')}
            </span>
            <div className="text-[11px] text-slate-400 mt-1">Santunan Kematian &amp; Inventaris Sosial</div>
          </div>
        </div>

        {/* Total Net Balance Card */}
        <div className="bg-slate-900 text-white p-5 rounded-xl shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wide">Ketersediaan Saldo Kas</span>
            <span className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <TrendingUp size={18} />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-display tracking-tight text-slate-100">
              Rp {balance.toLocaleString('id-ID')}
            </span>
            <div className="text-[11px] text-indigo-300 mt-1">Sisa kas yang aman &amp; siap disalurkan</div>
          </div>
        </div>
      </div>

      {/* --- ADD DYNAMIC RECORD FORM --- */}
      {showAddForm && user?.role === 'admin' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4 max-w-2xl animate-none">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="text-base font-display font-semibold text-slate-800">Tulis Data Mutasi Keuangan</h3>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 text-xs hover:text-slate-600">Abaikan</button>
          </div>

          <form onSubmit={handleSubmitRecord} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Tipe Mutasi</label>
              <select
                value={formType}
                onChange={(e) => {
                  const selVal = e.target.value as FinanceType;
                  setFormType(selVal);
                  setFormCategory(selVal === FinanceType.INCOME ? categoriesOfIncome[0] : categoriesOfExpense[0]);
                }}
                className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value={FinanceType.INCOME}>Pemasukan Kas (Debit)</option>
                <option value={FinanceType.EXPENSE}>Pengeluaran Kas/Santunan (Kredit)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Kategori Transaksi</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {formType === FinanceType.INCOME 
                  ? categoriesOfIncome.map(cat => <option key={cat} value={cat}>{cat}</option>)
                  : categoriesOfExpense.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Nominal Rupiah (IDR)</label>
              <input 
                type="number" 
                placeholder="Jumlah (Contoh: 1500000)"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Tanggal Transaksi</label>
              <input 
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Keterangan / Tujuan Transaksi</label>
              <input 
                type="text" 
                placeholder="Contoh: Pembelian rukun duka kain kafan cadangan sebanyak 3 rol..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loadingAdd}
              className="md:col-span-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              {loadingAdd ? 'Mencatatkan...' : 'Simpan Transaksi Ke Buku Kas'}
            </button>
          </form>
        </div>
      )}

      {/* Visual Balanced Proportion Widget */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-display font-semibold text-slate-800">Proporsi Kas (Pemasukan vs Pengeluaran)</h3>
        
        {/* Graphical Representation with custom Bars */}
        <div className="space-y-2.5">
          <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div 
              style={{ width: `${incomePercent}%` }} 
              className="bg-indigo-600 transition-all duration-500 flex items-center justify-center text-[10px] text-white font-bold"
              title={`Pemasukan: ${incomePercent}%`}
            >
              {incomePercent > 10 && `${incomePercent}% Debet`}
            </div>
            <div 
              style={{ width: `${expensePercent}%` }} 
              className="bg-rose-500 transition-all duration-500 flex items-center justify-center text-[10px] text-white font-bold"
              title={`Pengeluaran: ${expensePercent}%`}
            >
              {expensePercent > 10 && `${expensePercent}% Kredit`}
            </div>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400 font-medium pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-indigo-600"></span>
              Pemasukan (Penerimaan Iuran &amp; Sumbangan)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-500"></span>
              Pengeluaran (Santunan Kepada Ahli Waris)
            </span>
          </div>
        </div>
      </div>

      {/* Mutasi Ledger Book */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Actions inside ledger header */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-display font-semibold text-slate-800">Buku Register Mutasi Kas</h3>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              {(['all', FinanceType.INCOME, FinanceType.EXPENSE] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition capitalize ${
                    filterType === type 
                      ? 'bg-white text-slate-800 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {type === 'all' ? 'Semua' : type === 'income' ? 'Masuk' : 'Keluar'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-6">Tanggal</th>
                <th className="py-3 px-6">Rincian Transaksi</th>
                <th className="py-3 px-6">Kategori</th>
                <th className="py-3 px-6 text-right">Nominal Transaksi</th>
                <th className="py-3 px-6 text-right">Dicatat Oleh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/40 transition">
                  {/* Date */}
                  <td className="py-4 px-6">
                    <span className="flex items-center gap-1.5 font-mono text-xs text-slate-500">
                      <Calendar size={13} className="text-slate-400" />
                      {record.date}
                    </span>
                  </td>

                  {/* Desc */}
                  <td className="py-4 px-6">
                    <div className="font-semibold text-slate-800 leading-snug">{record.description}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">ID: {record.id}</div>
                  </td>

                  {/* Cat */}
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                      <Layers size={11} className="text-slate-400" />
                      {record.category}
                    </span>
                  </td>

                  {/* Amount with colored flow badge */}
                  <td className="py-4 px-6 text-right">
                    <span className={`font-mono font-bold text-sm ${
                      record.type === FinanceType.INCOME ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {record.type === FinanceType.INCOME ? '+' : '-'} Rp {record.amount.toLocaleString('id-ID')}
                    </span>
                  </td>

                  {/* Registered author */}
                  <td className="py-4 px-6 text-right text-xs text-slate-400 font-medium">
                    {record.addedBy.split(' ')[0]}
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                    Tidak ada transaksi keuangan terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
