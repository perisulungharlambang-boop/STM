/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Users, 
  CreditCard, 
  Coins, 
  MessageSquare, 
  Megaphone, 
  LogOut, 
  Lock, 
  HelpCircle,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Settings
} from 'lucide-react';

import { 
  AuthUser, 
  Member, 
  Bill, 
  FinancialRecord, 
  DonationCampaign, 
  ForumPost, 
  ActivityNews, 
  MemberRole, 
  MemberStatus, 
  BillStatus, 
  FinanceType 
} from './types';

// Import subcomponents
import DashboardOverview from './components/DashboardOverview';
import MemberManagement from './components/MemberManagement';
import DuesManagement from './components/DuesManagement';
import FinancialTransparency from './components/FinancialTransparency';
import DonationCrowdfunding from './components/DonationCrowdfunding';
import ForumDiscussion from './components/ForumDiscussion';
import NewsActivity from './components/NewsActivity';
import RegistrationWhatsApp from './components/RegistrationWhatsApp';
import AppSettings from './components/AppSettings';

// Import Firebase config & Firestore operations
import { db, seedDatabaseIfEmpty, handleFirestoreError } from './lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';

export default function App() {
  // Page routing state
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Dynamic application organization settings
  const [appName, setAppName] = useState('Yayasan Serikat Tolong Menolong (STM)');
  const [tagline, setTagline] = useState('Guyub Rukun Gotong Royong');
  
  // Simulated authentication state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Database core state arrays fetched from Firestore
  const [members, setMembers] = useState<Member[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [finances, setFinances] = useState<FinancialRecord[]>([]);
  const [donations, setDonations] = useState<DonationCampaign[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [activities, setActivities] = useState<ActivityNews[]>([]);

  // Time ticker
  const [currentTime, setCurrentTime] = useState<string>('');

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  // --- FIRESTORE REAL-TIME SYNCHRONIZATION ---

  useEffect(() => {
    // Bootstrap Firestore collections with initial seed data on first mount if empty
    seedDatabaseIfEmpty();

    // Attach real-time Firestore listeners for members
    const unsubMembers = onSnapshot(collection(db, 'members'), (snap) => {
      const items: Member[] = [];
      snap.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() } as Member);
      });
      items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setMembers(items);
    }, (err) => {
      handleFirestoreError(err, 'list', 'members');
    });

    // Attach real-time Firestore listeners for bills
    const unsubBills = onSnapshot(collection(db, 'bills'), (snap) => {
      const items: Bill[] = [];
      snap.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() } as Bill);
      });
      setBills(items);
    }, (err) => {
      handleFirestoreError(err, 'list', 'bills');
    });

    // Attach real-time Firestore listeners for finances
    const unsubFinances = onSnapshot(collection(db, 'finances'), (snap) => {
      const items: FinancialRecord[] = [];
      snap.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() } as FinancialRecord);
      });
      items.sort((a, b) => b.date.localeCompare(a.date));
      setFinances(items);
    }, (err) => {
      handleFirestoreError(err, 'list', 'finances');
    });

    // Attach real-time Firestore listeners for donations
    const unsubDonations = onSnapshot(collection(db, 'donations'), (snap) => {
      const items: DonationCampaign[] = [];
      snap.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() } as DonationCampaign);
      });
      items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setDonations(items);
    }, (err) => {
      handleFirestoreError(err, 'list', 'donations');
    });

    // Attach real-time Firestore listeners for posts
    const unsubPosts = onSnapshot(collection(db, 'posts'), (snap) => {
      const items: ForumPost[] = [];
      snap.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() } as ForumPost);
      });
      items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setPosts(items);
    }, (err) => {
      handleFirestoreError(err, 'list', 'posts');
    });

    // Attach real-time Firestore listeners for news
    const unsubNews = onSnapshot(collection(db, 'news'), (snap) => {
      const items: ActivityNews[] = [];
      snap.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() } as ActivityNews);
      });
      items.sort((a, b) => b.date.localeCompare(a.date));
      setActivities(items);
    }, (err) => {
      handleFirestoreError(err, 'list', 'news');
    });

    // Attach real-time Firestore listeners for settings/config
    const unsubSettings = onSnapshot(doc(db, 'settings', 'config'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.organizationName) setAppName(data.organizationName);
        if (data.tagline) setTagline(data.tagline);
      }
    }, (err) => {
      console.warn('Waiting settings config initialization...', err);
    });

    return () => {
      unsubMembers();
      unsubBills();
      unsubFinances();
      unsubDonations();
      unsubPosts();
      unsubNews();
      unsubSettings();
    };
  }, []);

  // Time clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('id-ID', {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) + ' UTC');
    };
    updateTime();
    const tInterval = setInterval(updateTime, 1000);
    return () => clearInterval(tInterval);
  }, []);

  // --- MUTATIVE WRITING TRANSACTIONS ---

  // Membership status verification
  const handleUpdateMemberStatus = async (id: string, status: MemberStatus) => {
    try {
      await updateDoc(doc(db, 'members', id), { status });
    } catch (err) {
      handleFirestoreError(err, 'update', `members/${id}`);
      alert('Gagal mengubah status.');
    }
  };

  // Membership deletion
  const handleDeleteMember = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'members', id));
    } catch (err) {
      handleFirestoreError(err, 'delete', `members/${id}`);
      alert('Gagal menghapus anggota.');
      throw err;
    }
  };

  // Membership edit (Update fields)
  const handleEditMember = async (id: string, updatedFields: Partial<Member>) => {
    try {
      await updateDoc(doc(db, 'members', id), updatedFields as any);
    } catch (err) {
      handleFirestoreError(err, 'update', `members/${id}`);
      alert('Gagal mengubah data anggota.');
      throw err;
    }
  };

  // Membership role update (Admin promotion / demotion)
  const handleUpdateMemberRole = async (id: string, role: MemberRole) => {
    try {
      await updateDoc(doc(db, 'members', id), { role });
    } catch (err) {
      handleFirestoreError(err, 'update', `members/${id}`);
      throw err;
    }
  };

  // Membership position/title (jabatan) update
  const handleUpdateMemberJabatan = async (id: string, jabatan: string) => {
    try {
      await updateDoc(doc(db, 'members', id), { jabatan });
    } catch (err) {
      handleFirestoreError(err, 'update', `members/${id}`);
      throw err;
    }
  };

  // Bill creation
  const handleCreateBill = async (billData: { title: string; description: string; amount: number; dueDate: string; forAll: boolean; memberId?: string }) => {
    try {
      if (billData.forAll) {
        const approvedMembers = members.filter(m => m.status === MemberStatus.APPROVED);
        for (const m of approvedMembers) {
          const id = 'bill-' + Date.now() + Math.random().toString(36).substr(2, 4);
          await setDoc(doc(db, 'bills', id), {
            id,
            title: billData.title,
            description: billData.description,
            amount: Number(billData.amount),
            dueDate: billData.dueDate,
            status: BillStatus.UNPAID,
            memberId: m.id,
            memberName: m.name
          });
        }
      } else if (billData.memberId) {
        const m = members.find(m => m.id === billData.memberId);
        if (m) {
          const id = 'bill-' + Date.now();
          await setDoc(doc(db, 'bills', id), {
            id,
            title: billData.title,
            description: billData.description,
            amount: Number(billData.amount),
            dueDate: billData.dueDate,
            status: BillStatus.UNPAID,
            memberId: m.id,
            memberName: m.name
          });
        }
      }
    } catch (err) {
      handleFirestoreError(err, 'create', 'bills');
      throw err;
    }
  };

  // Bill payment confirmation upload
  const handlePayBill = async (id: string, paymentMethod: string, paymentProof: string) => {
    try {
      await updateDoc(doc(db, 'bills', id), {
        status: BillStatus.PENDING_PAYMENT,
        paymentMethod,
        paymentProof,
        paidAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, 'update', `bills/${id}`);
      throw err;
    }
  };

  // Admin approves payment and triggers automated bookkeeping entry
  const handleApproveBillPayment = async (id: string, approvedBy: string) => {
    try {
      const billToApprove = bills.find(b => b.id === id);
      if (!billToApprove) throw new Error("Tagihan tidak ditemukan.");

      await updateDoc(doc(db, 'bills', id), {
        status: BillStatus.PAID,
        approvedBy
      });

      const finId = 'fin-' + Date.now();
      await setDoc(doc(db, 'finances', finId), {
        id: finId,
        type: FinanceType.INCOME,
        category: "Iuran Kas Bulanan",
        amount: billToApprove.amount,
        description: `Pembayaran ${billToApprove.title} oleh ${billToApprove.memberName}`,
        date: new Date().toISOString().split('T')[0],
        addedBy: approvedBy
      });
    } catch (err) {
      handleFirestoreError(err, 'update', `bills/${id}`);
      throw err;
    }
  };

  // Delete iuran (bill)
  const handleDeleteBill = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'bills', id));
    } catch (err) {
      handleFirestoreError(err, 'delete', `bills/${id}`);
      alert('Gagal menghapus tagihan.');
      throw err;
    }
  };

  // Edit iuran (bill)
  const handleEditBill = async (id: string, updatedFields: Partial<Bill>) => {
    try {
      await updateDoc(doc(db, 'bills', id), updatedFields as any);
    } catch (err) {
      handleFirestoreError(err, 'update', `bills/${id}`);
      alert('Gagal mengubah data tagihan.');
      throw err;
    }
  };

  // Financial record creation
  const handleAddFinancialRecord = async (record: { type: FinanceType; category: string; amount: number; description: string; date: string; addedBy: string }) => {
    try {
      const id = 'fin-' + Date.now();
      await setDoc(doc(db, 'finances', id), {
        id,
        type: record.type,
        category: record.category,
        amount: Number(record.amount),
        description: record.description,
        date: record.date,
        addedBy: record.addedBy
      });
    } catch (err) {
      handleFirestoreError(err, 'create', 'finances');
      throw err;
    }
  };

  // Fundraising campaign creation
  const handleCreateCampaign = async (campaign: { title: string; description: string; targetAmount: number; deadline: string; creator: string }) => {
    try {
      const id = 'don-' + Date.now();
      await setDoc(doc(db, 'donations', id), {
        id,
        title: campaign.title,
        description: campaign.description,
        targetAmount: Number(campaign.targetAmount),
        currentAmount: 0,
        deadline: campaign.deadline,
        status: 'active',
        creator: campaign.creator,
        createdAt: new Date().toISOString(),
        contributions: []
      });
    } catch (err) {
      handleFirestoreError(err, 'create', 'donations');
      throw err;
    }
  };

  // Contribute donation campaign
  const handleContributeDonation = async (campaignId: string, contribution: { donorName: string; amount: number; message?: string }) => {
    try {
      const campaign = donations.find(d => d.id === campaignId);
      if (!campaign) throw new Error("Kampanye donasi tidak ditemukan");

      const updatedContributions = [
        ...(campaign.contributions || []),
        {
          id: 'cont-' + Date.now() + Math.random().toString(36).substr(2, 4),
          donorName: contribution.donorName,
          amount: Number(contribution.amount),
          message: contribution.message || '',
          date: new Date().toISOString().split('T')[0]
        }
      ];

      const newAmount = Number(campaign.currentAmount) + Number(contribution.amount);

      await updateDoc(doc(db, 'donations', campaignId), {
        contributions: updatedContributions,
        currentAmount: newAmount
      });
    } catch (err) {
      handleFirestoreError(err, 'update', `donations/${campaignId}`);
      throw err;
    }
  };

  // Thread post creation
  const handleCreatePost = async (post: { title: string; content: string; authorId: string; authorName: string; role: string }) => {
    try {
      const id = 'post-' + Date.now();
      await setDoc(doc(db, 'posts', id), {
        id,
        title: post.title,
        content: post.content,
        authorId: post.authorId,
        authorName: post.authorName,
        role: post.role,
        createdAt: new Date().toISOString(),
        comments: []
      });
    } catch (err) {
      handleFirestoreError(err, 'create', 'posts');
      throw err;
    }
  };

  // Thread reply creation
  const handleAddComment = async (postId: string, comment: { content: string; authorName: string; role: string }) => {
    try {
      const targetPost = posts.find(p => p.id === postId);
      if (!targetPost) throw new Error("Utas tidak ditemukan");

      const updatedComments = [
        ...(targetPost.comments || []),
        {
          id: 'com-' + Date.now() + Math.random().toString(36).substr(2, 4),
          content: comment.content,
          authorName: comment.authorName,
          role: comment.role,
          createdAt: new Date().toISOString()
        }
      ];

      await updateDoc(doc(db, 'posts', postId), {
        comments: updatedComments
      });
    } catch (err) {
      handleFirestoreError(err, 'update', `posts/${postId}`);
      throw err;
    }
  };

  // News publication
  const handleCreateNews = async (newsData: { title: string; content: string; date: string; location: string; addedBy: string; mediaUrl?: string; mediaType?: 'image' | 'video' }) => {
    try {
      const id = 'news-' + Date.now();
      await setDoc(doc(db, 'news', id), {
        id,
        ...newsData
      });
    } catch (err) {
      handleFirestoreError(err, 'create', 'news');
      throw err;
    }
  };

  // News deletion
  const handleDeleteNews = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'news', id));
    } catch (err) {
      handleFirestoreError(err, 'delete', `news/${id}`);
      throw err;
    }
  };

  // --- AUTH DYNAMIC ACTIONS CONTROL ---

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginUsername) {
      setLoginError('Nama pengguna harus diisi.');
      return;
    }

    setLoadingLogin(true);
    try {
      const user = members.find(m => m.username.toLowerCase() === loginUsername.toLowerCase());
      
      if (!user) {
        setLoginError('Username tidak ditemukan.');
        return;
      }

      if (user.status === MemberStatus.PENDING) {
        setLoginError('Akun Anda sedang menunggu persetujuan administrator.');
        return;
      }
      if (user.status === MemberStatus.REJECTED) {
        setLoginError('Pendaftaran Anda ditolak oleh administrator. Hubungi pengurus via WA.');
        return;
      }

      const defaultPw = user.role === MemberRole.ADMIN ? 'admin' : 'member';
      if (loginPassword && loginPassword !== defaultPw && loginPassword !== '123' && loginPassword !== 'admin' && loginPassword !== 'budi' && loginPassword !== 'siti') {
        setLoginError('Kata sandi salah. Gunakan default: "admin" jika Admin, "member" jika Anggota.');
        return;
      }

      setCurrentUser({
        id: user.id,
        name: user.name,
        username: user.username,
        phone: user.phone,
        role: user.role as MemberRole,
        status: user.status as MemberStatus
      });
      setLoginUsername('');
      setLoginPassword('');
      setActiveTab('dashboard');
    } catch (err) {
      console.error(err);
      setLoginError('Terdapat kesalahan koneksi.');
    } finally {
      setLoadingLogin(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans text-slate-800 antialiased selection:bg-indigo-100 selection:text-indigo-800">
      
      {/* Upper Navigation Header Bar */}
      <header className="sticky top-0 bg-white border-b border-slate-100 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Logo brand and metadata */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white flex items-center justify-center shadow-md">
              <HeartHandshake size={22} className="stroke-[2]" />
            </div>
            <div>
              <span className="font-display font-semibold text-base tracking-tight text-slate-800 block">
                {appName}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 block">
                {tagline}
              </span>
            </div>
          </div>

          {/* Time and Active Session controls */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            {/* Live Clock HUD */}
            <div className="hidden lg:flex items-center gap-1.5 text-slate-400 font-mono text-[11px] bg-slate-50 border border-slate-150 px-3 py-1.5 rounded-xl">
              <Clock size={12} className="text-indigo-600" />
              {currentTime || 'Memuat waktu...'}
            </div>

            {currentUser ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <div className="text-right leading-tight">
                  <span className="font-semibold block text-slate-700 max-w-[120px] truncate">{currentUser.name.split(' ')[0]}</span>
                  <span className="text-[10px] text-slate-400 capitalize">{currentUser.role === 'admin' ? 'Pengurus' : 'Anggota'}</span>
                </div>
                <button
                  onClick={() => { setCurrentUser(null); setActiveTab('dashboard'); }}
                  className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition"
                  title="Keluar"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('pendaftaran')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
              >
                Registrasi Anggota Baru
              </button>
            )}
          </div>
        </div>

        {/* Tab Navbar (Only visible for authenticated users) */}
        {currentUser && (
          <div className="bg-slate-50/50 border-t border-slate-100/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto">
              <nav className="flex gap-2 py-2">
                {[
                  { id: 'dashboard', name: 'Dashboard', icon: HeartHandshake },
                  { id: 'keanggotaan', name: 'Keanggotaan', icon: Users, role: 'admin' },
                  { id: 'iuran', name: 'Tagihan Iuran', icon: CreditCard },
                  { id: 'keuangan', name: 'Laporan Keuangan', icon: Coins },
                  { id: 'donasi', name: 'Bantuan Donasi', icon: HeartHandshake },
                  { id: 'forum', name: 'Rembug Forum', icon: MessageSquare },
                  { id: 'kegiatan', name: 'Kegiatan & Informasi', icon: Megaphone },
                  { id: 'pengaturan', name: 'Pengaturan', icon: Settings, role: 'admin' }
                ].map((tab) => {
                  if (tab.role === 'admin' && currentUser.role !== 'admin') return null;
                  
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 tracking-wide transition shrink-0 ${
                        isActive 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'text-slate-600 bg-white hover:bg-slate-100'
                      }`}
                    >
                      <Icon size={14} />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {currentUser ? (
          /* Tab view router switcher */
          <div className="space-y-6">
            {activeTab === 'dashboard' && (
              <DashboardOverview 
                user={currentUser}
                finances={finances}
                bills={bills}
                donations={donations}
                activities={activities}
                membersCount={members.filter(m => m.status === MemberStatus.APPROVED).length}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'keanggotaan' && currentUser.role === 'admin' && (
              <MemberManagement 
                members={members}
                onUpdateStatus={handleUpdateMemberStatus}
                onRefresh={() => {}}
                onDeleteMember={handleDeleteMember}
                onEditMember={handleEditMember}
              />
            )}

            {activeTab === 'iuran' && (
              <DuesManagement 
                user={currentUser}
                bills={bills}
                members={members}
                onCreateBill={handleCreateBill}
                onPayBill={handlePayBill}
                onApproveBill={handleApproveBillPayment}
                onDeleteBill={handleDeleteBill}
                onEditBill={handleEditBill}
              />
            )}

            {activeTab === 'keuangan' && (
              <FinancialTransparency 
                user={currentUser}
                finances={finances}
                onAddRecord={handleAddFinancialRecord}
              />
            )}

            {activeTab === 'donasi' && (
              <DonationCrowdfunding 
                user={currentUser}
                donations={donations}
                onCreateCampaign={handleCreateCampaign}
                onContribute={handleContributeDonation}
              />
            )}

            {activeTab === 'forum' && (
              <ForumDiscussion 
                user={currentUser}
                posts={posts}
                onCreatePost={handleCreatePost}
                onAddComment={handleAddComment}
              />
            )}

            {activeTab === 'kegiatan' && (
              <NewsActivity 
                user={currentUser}
                activities={activities}
                onCreateNews={handleCreateNews}
                onDeleteNews={handleDeleteNews}
              />
            )}

            {activeTab === 'pengaturan' && currentUser.role === 'admin' && (
              <AppSettings 
                user={currentUser}
                members={members}
                onUpdateMemberRole={handleUpdateMemberRole}
                onUpdateMemberJabatan={handleUpdateMemberJabatan}
              />
            )}

            {activeTab === 'pendaftaran' && (
              <RegistrationWhatsApp 
                onSuccess={() => setActiveTab('dashboard')}
                onCancel={() => setActiveTab('dashboard')}
              />
            )}
          </div>
        ) : (
          /* Authentication Form when Guest session is detected */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6 md:py-12">
            {/* Informational Hero Column (7 Cols) */}
            <div className="lg:col-span-7 space-y-6 md:pr-4">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-800 rounded-2xl flex items-center justify-center shadow-inner">
                <HeartHandshake size={32} className="text-indigo-600" />
              </div>
              
              <div className="space-y-3">
                <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-slate-800 leading-tight">
                  Guyub Rukun Bersama <span className="text-indigo-600">{appName}</span>
                </h1>
                <p className="text-sm md:text-base text-slate-500 leading-relaxed max-w-xl">
                  Selamat datang di platform tata kelola sosial digital {appName}. Masuk untuk memantau kas secara transparan, melunasi iuran warga, dan berdonasi bagi kemaslahatan warga.
                </p>
              </div>

              {/* Core Features list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs shrink-0 font-bold">✓</div>
                  <div>
                    <span className="font-semibold block text-sm text-slate-700">Sirkulasi Transparan</span>
                    <p className="text-[11px] text-slate-400">Semua laporan iuran dan pengeluaran duka disajikan terbuka.</p>
                  </div>
                </div>
                
                <div className="flex gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs shrink-0 font-bold">✓</div>
                  <div>
                    <span className="font-semibold block text-sm text-slate-700">Pendaftaran Instan</span>
                    <p className="text-[11px] text-slate-400">Verifikasi satu sentuhan terintegrasi nomor WA dan Admin aktif.</p>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs shrink-0 font-bold">✓</div>
                  <div>
                    <span className="font-semibold block text-sm text-slate-700">QRIS &amp; Transfer Bank</span>
                    <p className="text-[11px] text-slate-400">Sistem slip upload memudahkan konfirmasi bayaran iuran duka.</p>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs shrink-0 font-bold">✓</div>
                  <div>
                    <span className="font-semibold block text-sm text-slate-700">Aspirasi Forum Rembug</span>
                    <p className="text-[11px] text-slate-400">Bermusyawarah secara tertib demi kemaslahatan lingkungan.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Login / Register Workspace Switcher (5 Cols) */}
            <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6">
              {activeTab === 'pendaftaran' ? (
                <RegistrationWhatsApp 
                  onSuccess={() => setActiveTab('dashboard')}
                  onCancel={() => setActiveTab('dashboard')}
                />
              ) : (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <h2 className="text-xl font-display font-bold text-slate-800">Masuk Akun Aplikasi</h2>
                    <p className="text-xs text-slate-400">Silakan masukkan nama pengguna dan kata sandi Anda.</p>
                  </div>

                  {loginError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 text-xs rounded-xl flex items-start gap-2">
                      <ShieldAlert size={16} className="text-rose-600 shrink-0 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-4 font-display">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Pengguna (Username / Email)</label>
                      <input 
                        type="text" 
                        placeholder="Masukkan nama pengguna Anda"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Kata Sandi (Password)</label>
                      <input 
                        type="password" 
                        placeholder="Masukkan kata sandi Anda"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loadingLogin}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-100"
                    >
                      {loadingLogin ? 'Memproses Masuk...' : 'Masuk Aplikasi Sekarang'}
                    </button>
                  </form>



                  <div className="text-center pt-2">
                    <button
                      onClick={() => setActiveTab('pendaftaran')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
                    >
                      Belum menjadi anggota? Daftarkan diri via WhatsApp Anda →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Humble Elegant Footer page margin */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left space-y-1">
            <div className="font-display font-semibold text-slate-300">
              © 2026 Yayasan Serikat Tolong Menolong (STM) Lingkungan.
            </div>
            <p className="text-[10px] text-slate-500 max-w-md">
              Dikelola secara mandiri demi kemudahan sirkulasi dana sosial, gotong-royong warga duka, serta transparansi laporan kas bulanan.
            </p>
          </div>
          <div className="text-[10px] text-slate-500">
            Yayasan Serikat Tolong Menolong (STM) Online
          </div>
        </div>
      </footer>
    </div>
  );
}
