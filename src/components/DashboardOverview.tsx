/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Coins, 
  Users, 
  CreditCard, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  ArrowRight,
  Clock,
  HeartHandshake
} from 'lucide-react';
import { AuthUser, FinancialRecord, Bill, DonationCampaign, ActivityNews, FinanceType, MemberStatus } from '../types';

interface DashboardOverviewProps {
  user: AuthUser | null;
  finances: FinancialRecord[];
  bills: Bill[];
  donations: DonationCampaign[];
  activities: ActivityNews[];
  membersCount: number;
  onNavigate: (tab: string) => void;
}

export default function DashboardOverview({
  user,
  finances,
  bills,
  donations,
  activities,
  membersCount,
  onNavigate
}: DashboardOverviewProps) {
  // Compute stats
  const totalIncome = finances
    .filter(f => f.type === FinanceType.INCOME)
    .reduce((acc, f) => acc + f.amount, 0);
  const totalExpense = finances
    .filter(f => f.type === FinanceType.EXPENSE)
    .reduce((acc, f) => acc + f.amount, 0);
  const balance = totalIncome - totalExpense;

  const activeDonationsCount = donations.filter(d => d.status === 'active').length;
  
  // Calculate specific user unpaid bills count
  const myUnpaidBills = user 
    ? bills.filter(b => b.memberId === user.id && b.status === 'unpaid')
    : [];

  const pendingApprovalsCount = bills.filter(b => b.status === 'pending_payment').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <HeartHandshake size={320} className="-mr-16 -mb-16" />
        </div>
        
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-xs font-medium tracking-wide">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            Aplikasi Portal Online STM
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight">
            Selamat datang, {user ? user.name : 'Tamu'}!
          </h1>
          <p className="text-slate-300 font-light leading-relaxed text-sm md:text-base">
            Portal digital Serikat Tolong Menolong memudahkan kita untuk bergotong-royong, memantau transparansi keuangan warga, mengurus iuran duka secara terstruktur, dan merawat tali silaturahmi.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            {myUnpaidBills.length > 0 && (
              <button 
                onClick={() => onNavigate('iuran')} 
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-medium px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition"
              >
                <CreditCard size={15} />
                Ada {myUnpaidBills.length} Tagihan Belum Dibayar
              </button>
            )}
            {user?.role === 'admin' && pendingApprovalsCount > 0 && (
              <button 
                onClick={() => onNavigate('iuran')} 
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition"
              >
                <Users size={15} />
                {pendingApprovalsCount} Pembayaran Butuh Verifikasi
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance Stat */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
            <Coins size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-semibold">Saldo Kas STM</span>
            <span className="text-xl md:text-2xl font-semibold tracking-tight font-display text-slate-800">
              Rp {balance.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Members Stat */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
            <Users size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-semibold">Anggota Terdaftar</span>
            <span className="text-xl md:text-2xl font-semibold tracking-tight font-display text-slate-800">
              {membersCount} Orang
            </span>
          </div>
        </div>

        {/* Tagihan Aktif / Unpaid */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 shrink-0">
            <CreditCard size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-semibold">
              {user?.role === 'admin' ? 'Total Tagihan Aktif' : 'Tagihan Belum Lunas'}
            </span>
            <span className="text-xl md:text-2xl font-semibold tracking-tight font-display text-slate-800">
              {user?.role === 'admin' 
                ? bills.filter(b => b.status === 'unpaid').length 
                : myUnpaidBills.length} Tagihan
            </span>
          </div>
        </div>

        {/* Fundraising counter */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600 shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-semibold">Donasi Aktif</span>
            <span className="text-xl md:text-2xl font-semibold tracking-tight font-display text-slate-800">
              {activeDonationsCount} Penggalangan
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recents activities - Left (8 Cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
              <h2 className="text-lg font-display font-semibold text-slate-800">Kabar kegiatan terbaru STM</h2>
            </div>
            <button 
              onClick={() => onNavigate('kegiatan')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 transition"
            >
              Lihat Semua Kegiatan
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.slice(0, 2).map((act) => (
              <div key={act.id} className="p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition bg-slate-50/20 flex flex-col justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.75 rounded-md mb-2">
                    <Calendar size={11} />
                    {act.date}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-1 mb-1">{act.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 md:line-clamp-3">{act.content}</p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100/60 pt-3 mt-3">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} className="text-indigo-600" />
                    {act.location}
                  </span>
                  <span>Oleh: {act.addedBy.split(' ')[0]}</span>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <p className="text-slate-400 text-xs py-4 col-span-2 text-center">Belum ada rilis kabar kegiatan STM.</p>
            )}
          </div>
        </div>

        {/* Quick Menu Grids - Right (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 text-white p-6 rounded-xl shadow-lg flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-display font-semibold text-slate-100">Tautan Navigasi Pintar</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pilih menu di bawah atau klik navigasi atas untuk langsung diarahkan ke laman manajemen terkait.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={() => onNavigate('keanggotaan')}
                className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl text-left border border-slate-700/50 hover:border-indigo-500 transition group"
              >
                <div className="text-indigo-400 group-hover:scale-110 duration-200 transition mb-1">
                  <Users size={18} />
                </div>
                <span className="text-xs font-semibold block">Anggota</span>
              </button>

              <button 
                onClick={() => onNavigate('iuran')}
                className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl text-left border border-slate-700/50 hover:border-indigo-500 transition group"
              >
                <div className="text-amber-400 group-hover:scale-110 duration-200 transition mb-1">
                  <CreditCard size={18} />
                </div>
                <span className="text-xs font-semibold block">Iuran</span>
              </button>

              <button 
                onClick={() => onNavigate('keuangan')}
                className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl text-left border border-slate-700/50 hover:border-indigo-500 transition group"
              >
                <div className="text-indigo-400 group-hover:scale-110 duration-200 transition mb-1">
                  <Coins size={18} />
                </div>
                <span className="text-xs font-semibold block">Keuangan</span>
              </button>

              <button 
                onClick={() => onNavigate('donasi')}
                className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl text-left border border-slate-700/50 hover:border-indigo-500 transition group"
              >
                <div className="text-rose-400 group-hover:scale-110 duration-200 transition mb-1">
                  <HeartHandshake size={18} />
                </div>
                <span className="text-xs font-semibold block">Donasi</span>
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 mt-6 md:mt-0 flex items-center justify-between text-xs text-indigo-400">
            <span>Gotong Royong &amp; Empati</span>
            <HeartHandshake size={16} className="animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
