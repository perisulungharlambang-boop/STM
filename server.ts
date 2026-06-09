/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { 
  MemberRole, 
  MemberStatus, 
  BillStatus, 
  FinanceType,
  Member,
  Bill,
  FinancialRecord,
  DonationCampaign,
  ForumPost,
  ActivityNews
} from './src/types.js';

dotenv.config();

const app = express();
const PORT = 3000;

// Set up directory for server files
const DB_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Helper functions for JSON database operations
const dbPath = (filename: string) => path.join(DB_DIR, filename);

const readJSON = <T>(filename: string, defaultValue: T): T => {
  const filepath = dbPath(filename);
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify(defaultValue, null, 2));
    return defaultValue;
  }
  try {
    const data = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(data) as T;
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return defaultValue;
  }
};

const writeJSON = <T>(filename: string, data: T): void => {
  const filepath = dbPath(filename);
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing ${filename}:`, err);
  }
};

// --- INITIAL SEED DATA ---
const defaultMembers: Member[] = [
  {
    id: 'admin-1',
    name: 'Bp. Dr. H. Hermawan Sastroseputro',
    username: 'admin',
    phone: '081234567890',
    address: 'Jl. Melati No. 12, Kel. Sariharjo, RT 03/RW 15, Sleman',
    familySize: 4,
    role: MemberRole.ADMIN,
    status: MemberStatus.APPROVED,
    createdAt: new Date('2026-01-01T08:00:00Z').toISOString()
  },
  {
    id: 'member-budi',
    name: 'Budi Santoso',
    username: 'budi',
    phone: '085712345678',
    address: 'Jl. Mawar Gg. 2 No. 5B, Kel. Sariharjo, Sleman',
    familySize: 3,
    role: MemberRole.MEMBER,
    status: MemberStatus.APPROVED,
    createdAt: new Date('2026-01-10T09:30:00Z').toISOString()
  },
  {
    id: 'member-siti',
    name: 'Siti Rahmawati',
    username: 'siti',
    phone: '089988776655',
    address: 'Jl. Cempaka Indah No. 42, Kel. Sariharjo, Sleman',
    familySize: 5,
    role: MemberRole.MEMBER,
    status: MemberStatus.APPROVED,
    createdAt: new Date('2026-01-15T14:15:00Z').toISOString()
  },
  {
    id: 'member-wawan',
    name: 'Wawan Setiawan',
    username: 'wawan',
    phone: '082133445566',
    address: 'Jl. Kamboja No. 17, Sleman',
    familySize: 2,
    role: MemberRole.MEMBER,
    status: MemberStatus.PENDING,
    createdAt: new Date('2026-02-18T11:20:00Z').toISOString()
  }
];

const defaultBills: Bill[] = [
  {
    id: 'bill-1',
    title: 'Iuran Wajib Bulanan Juni 2026',
    description: 'Iuran rutin bulanan untuk kas utama Serikat Tolong Menolong (STM) periode Juni 2026.',
    amount: 25000,
    dueDate: '2026-06-30',
    status: BillStatus.UNPAID,
    memberId: 'member-budi',
    memberName: 'Budi Santoso'
  },
  {
    id: 'bill-2',
    title: 'Iuran Wajib Bulanan Juni 2026',
    description: 'Iuran rutin bulanan untuk kas utama Serikat Tolong Menolong (STM) periode Juni 2026.',
    amount: 25000,
    dueDate: '2026-06-30',
    status: BillStatus.PAID,
    paidAt: '2026-06-02T10:00:00Z',
    paymentMethod: 'Transfer Bank (BCA)',
    paymentProof: 'Proof_BCA_Siti.png',
    memberId: 'member-siti',
    memberName: 'Siti Rahmawati'
  },
  {
    id: 'bill-3',
    title: 'Iuran Sukarela Pembangunan Tenda Sosial',
    description: 'Iuran untuk pengadaan tenda duka dan kursi pelayanan masyarakat milik Serikat Tolong Menolong (STM).',
    amount: 50000,
    dueDate: '2026-07-15',
    status: BillStatus.UNPAID,
    memberId: 'member-budi',
    memberName: 'Budi Santoso'
  }
];

const defaultFinances: FinancialRecord[] = [
  {
    id: 'fin-1',
    type: FinanceType.INCOME,
    category: 'Iuran Kas Bulanan',
    amount: 1500000,
    description: 'Kas Terkumpul Iuran Wajib Januari 2026 (60 Anggota)',
    date: '2026-01-31',
    addedBy: 'Bp. Dr. H. Hermawan Sastroseputro'
  },
  {
    id: 'fin-2',
    type: FinanceType.EXPENSE,
    category: 'Santunan Duka',
    amount: 1000000,
    description: 'Santunan Kematian Alm. Ibu Martini (Istri dari Bp. Joko, Anggota STM)',
    date: '2026-02-05',
    addedBy: 'Bp. Dr. H. Hermawan Sastroseputro'
  },
  {
    id: 'fin-3',
    type: FinanceType.INCOME,
    category: 'Sumbangan Donatur',
    amount: 3500000,
    description: 'Sumbangan hamba Allah untuk pembelian perlengkapan pemandian jenazah',
    date: '2026-02-20',
    addedBy: 'Bp. Dr. H. Hermawan Sastroseputro'
  },
  {
    id: 'fin-4',
    type: FinanceType.EXPENSE,
    category: 'Peralatan & Perlengkapan',
    amount: 2200000,
    description: 'Pembelian keranda stenlis baru dan kain kafan cadangan',
    date: '2026-03-10',
    addedBy: 'Bp. Dr. H. Hermawan Sastroseputro'
  },
  {
    id: 'fin-5',
    type: FinanceType.INCOME,
    category: 'Iuran Kas Bulanan',
    amount: 1450000,
    description: 'Kas Terkumpul Iuran Wajib Februari - Maret 2026',
    date: '2026-04-10',
    addedBy: 'Bp. Dr. H. Hermawan Sastroseputro'
  },
  {
    id: 'fin-6',
    type: FinanceType.EXPENSE,
    category: 'Santunan Kesehatan',
    amount: 500000,
    description: 'Bantuan rawat inap Rumah Sakit untuk Bp. Suparman (Anggota STM)',
    date: '2026-05-02',
    addedBy: 'Bp. Dr. H. Hermawan Sastroseputro'
  }
];

const defaultDonations: DonationCampaign[] = [
  {
    id: 'don-1',
    title: 'Bantuan Pengobatan Stroke Bp. Sugeng',
    description: 'Bp. Sugeng, salah satu sesepuh dan pendiri STM kita, saat ini sedang membutuhkan bantuan dana biaya fisioterapi pasca-stroke berat. Mari bergotong-royong meringankan beban keluarga beliau.',
    targetAmount: 10000000,
    currentAmount: 7650000,
    deadline: '2026-07-31',
    status: 'active',
    creator: 'Pengurus STM',
    createdAt: '2026-05-15T09:00:00Z',
    contributions: [
      { id: 'c-1', donorName: 'Hamba Allah', amount: 500000, message: 'Semoga lekas sembuh pak', date: '2026-05-16' },
      { id: 'c-2', donorName: 'Bp. Hermawan', amount: 1000000, message: 'Insya Allah pulih kembali', date: '2026-05-17' },
      { id: 'c-3', donorName: 'Siti Rahmawati', amount: 150000, message: 'Aamiin', date: '2026-05-19' },
      { id: 'c-4', donorName: 'Kas Masjid Jami', amount: 5000000, message: 'Bantuan sosial jamaah', date: '2026-05-20' },
      { id: 'c-5', donorName: 'Budi Santoso', amount: 100000, message: 'Gotong royong bersama', date: '2026-06-01' }
    ]
  },
  {
    id: 'don-2',
    title: 'Santunan Kebakaran Rumah Sdr. Ridwan',
    description: 'Musibah kebakaran melanda kediaman Sdr. Ridwan (Anggota aktif STM Barat) pekan lalu. Kehilangan hampir seluruh perabotan rumah tangga. Dana akan disalurkan dalam bentuk sandang, pangan, dan bahan bangunan dasar.',
    targetAmount: 5000000,
    currentAmount: 4800000,
    deadline: '2026-06-25',
    status: 'active',
    creator: 'Pengurus STM',
    createdAt: '2026-06-01T08:00:00Z',
    contributions: [
      { id: 'c3-1', donorName: 'Warga RT 03', amount: 2000000, message: 'Sumbangan swadaya RT', date: '2026-06-02' },
      { id: 'c3-2', donorName: 'Hamba Allah', amount: 1000000, message: 'Meringankan beban sesama Muslim', date: '2026-06-03' },
      { id: 'c3-3', donorName: 'Arisan Ibu-Ibu Melati', amount: 1800000, message: 'Semoga bermanfaat', date: '2026-06-05' }
    ]
  }
];

const defaultPosts: ForumPost[] = [
  {
    id: 'post-1',
    title: 'Usul: Kegiatan Senam Sehat & Silaturahmi Bulanan',
    content: 'Assalamu\'alaikum wr. wb. Untuk meningkatkan keguyuban antar anggota STM, bagaimana jika kita laksanakan kegiatan senam pagi bersama sebulan sekali, dilanjutkan dengan sarapan bubur kacang ijo di lapangan RT? Mohon masukannya bapak ibu sekalian.',
    authorId: 'member-budi',
    authorName: 'Budi Santoso',
    role: MemberRole.MEMBER,
    createdAt: '2026-06-02T02:15:00Z',
    comments: [
      {
        id: 'com-1',
        content: 'Wa\'alaikumsalam wr. wb. Ide yang sangat bagus Pak Budi! Saya sangat setuju untuk menjaga kebersamaan dan kesehatan.',
        authorName: 'Siti Rahmawati',
        role: MemberRole.MEMBER,
        createdAt: '2026-06-02T04:20:00Z'
      },
      {
        id: 'com-2',
        content: 'Setuju sekali. Pengurus siap memfasilitasi sound system dan penyediaan konsumsi ringan dari kas sosial.',
        authorName: 'Bp. Dr. H. Hermawan Sastroseputro',
        role: MemberRole.ADMIN,
        createdAt: '2026-06-03T01:10:00Z'
      }
    ]
  },
  {
    id: 'post-2',
    title: 'Pemberitahuan: Prosedur Pengajuan Santunan Duka & Rawat Inap',
    content: 'Mengingatkan kembali kepada seluruh anggota duka, bagi yang ingin mengajukan Santunan Kematian atau Dana Rawat Inap, mohon segera mengirimkan foto KTP, Kartu Keluarga, dan Surat Keterangan Kematian/Sakit dari RS ke pengurus atau melalui aplikasi ini untuk mempercepat verifikasi. Santunan tunai akan diserahkan maksimal 24 jam setelah verifikasi.',
    authorId: 'admin-1',
    authorName: 'Bp. Dr. H. Hermawan Sastroseputro',
    role: MemberRole.ADMIN,
    createdAt: '2026-05-28T09:00:00Z',
    comments: [
      {
        id: 'com-3',
        content: 'Alhamdulillah, sistem digital ini memudahkan kami jadi tidak perlu repot mencari pengurus ke rumah saat panik/pusing.',
        authorName: 'Budi Santoso',
        role: MemberRole.MEMBER,
        createdAt: '2026-05-28T11:45:00Z'
      }
    ]
  }
];

const defaultNews: ActivityNews[] = [
  {
    id: 'news-1',
    title: 'Penyaluran Santunan Sosial Kematian Almh. Ibu Sukartini',
    content: 'Pengurus Serikat Tolong Menolong (STM) telah menyalurkan santunan duka sebesar Rp 1.500.000 kepada keluarga ahli waris bapak Gunawan atas wafatnya ibunda beliau tercinta. Segenap pengurus dan anggota juga melaksanakan takziah dan doa bersama di rumah duka. Semoga amal ibadah almarhumah diterima di sisi Allah SWT.',
    date: '2026-06-01',
    location: 'Rumah Duka, Sleman',
    addedBy: 'Bp. Dr. H. Hermawan Sastroseputro'
  },
  {
    id: 'news-2',
    title: 'Kerja Bakti Gotong Royong Kebersihan Inventaris Tenda & Keranda',
    content: 'Hari Minggu lalu, seluruh anggota laki-laki STM bergotong royong melakukan perawatan berkala, pembersihan tenda duka, kursi lipat, pencucian kain keranda, dan sterilisasi pemandian jenazah di gudang inventaris RW 15. Terima kasih atas partisipasi aktif bapak-bapak sekalian.',
    date: '2026-05-24',
    location: 'Gudang Inventaris STM, RW 15',
    addedBy: 'Bp. Dr. H. Hermawan Sastroseputro'
  }
];

// Initialize JSON database values
let members = readJSON<Member[]>('members.json', defaultMembers);
let bills = readJSON<Bill[]>('bills.json', defaultBills);
let finances = readJSON<FinancialRecord[]>('finances.json', defaultFinances);
let donations = readJSON<DonationCampaign[]>('donations.json', defaultDonations);
let posts = readJSON<ForumPost[]>('posts.json', defaultPosts);
let news = readJSON<ActivityNews[]>('news.json', defaultNews);

// Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- API ROUTES ---

// 1. Auth & Pendaftaran
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username diperlukan.' });
  }

  // Find user by username
  const user = members.find(m => m.username.toLowerCase() === username.toLowerCase());
  
  if (!user) {
    return res.status(401).json({ error: 'Username tidak ditemukan.' });
  }

  if (user.status === MemberStatus.PENDING) {
    return res.status(403).json({ error: 'Akun Anda sedang menunggu persetujuan administrator.' });
  }
  if (user.status === MemberStatus.REJECTED) {
    return res.status(403).json({ error: 'Pendaftaran Anda ditolak oleh administrator. Hubungi pengurus via WA.' });
  }

  // Simple hardcoded credential logic for showcase
  const defaultPw = user.role === MemberRole.ADMIN ? 'admin' : 'member';
  if (password && password !== defaultPw && password !== '123' && password !== 'admin' && password !== 'budi' && password !== 'siti') {
    return res.status(401).json({ error: 'Kata sandi salah. Gunakan default: "admin" jika Admin, "member" jika Anggota.' });
  }

  res.json({
    id: user.id,
    name: user.name,
    username: user.username,
    phone: user.phone,
    role: user.role,
    status: user.status
  });
});

app.post('/api/register-whatsapp', (req, res) => {
  const { name, phone, address, familySize } = req.body;
  if (!name || !phone || !address) {
    return res.status(400).json({ error: 'Nama, No WhatsApp, dan Alamat wajib diisi.' });
  }

  // Create local user draft
  const newMemberId = 'member-' + Date.now();
  const lowerUsername = name.toLowerCase().split(' ')[0] + Math.floor(100 + Math.random() * 900);
  
  const newMember: Member = {
    id: newMemberId,
    name,
    username: lowerUsername,
    phone,
    address,
    familySize: Number(familySize) || 1,
    role: MemberRole.MEMBER,
    status: MemberStatus.PENDING,
    createdAt: new Date().toISOString()
  };

  members.unshift(newMember);
  writeJSON('members.json', members);

  // Auto-generate customized Indonesian WhatsApp text link
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const adminPhone = '6281234567890'; // Mock Admin WhatsApp
  const waText = `Halo Admin Serikat Tolong Menolong (STM) 🤝,

Saya bermaksud mendaftar keanggotaan baru STM via Aplikasi Web:
*Nama*: ${name}
*No. HP/WA*: ${phone}
*Alamat Rumah*: ${address}
*Anggota Keluarga*: ${familySize} Orang

*Username Aplikasi yang diusulkan*: ${lowerUsername}
*Kata Kunci Default*: member

Mohon segera diverifikasi dan diaktifkan akun saya. Terima kasih banyak, Gotong Royong Selalu!`;

  const waURL = `https://api.whatsapp.com/send?phone=${adminPhone}&text=${encodeURIComponent(waText)}`;

  res.json({
    success: true,
    message: 'Anggota terdaftar di sistem dengan status pending.',
    member: newMember,
    waLink: waURL
  });
});

// 2. Members Management (Administrator)
app.get('/api/members', (req, res) => {
  res.json(members);
});

app.put('/api/members/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!Object.values(MemberStatus).includes(status)) {
    return res.status(400).json({ error: 'Status tidak valid.' });
  }

  const index = members.findIndex(m => m.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Anggota tidak ditemukan.' });
  }

  members[index].status = status;
  writeJSON('members.json', members);
  res.json(members[index]);
});

// 3. Iuran & Tagihan (Bills)
app.get('/api/bills', (req, res) => {
  res.json(bills);
});

app.get('/api/bills/member/:memberId', (req, res) => {
  const { memberId } = req.params;
  const memberBills = bills.filter(b => b.memberId === memberId);
  res.json(memberBills);
});

app.post('/api/bills', (req, res) => {
  const { title, description, amount, dueDate, forAll, memberId } = req.body;
  if (!title || !amount || !dueDate) {
    return res.status(400).json({ error: 'Judul, Jumlah, dan Tanggal Jatuh Tempo diperlukan.' });
  }

  if (forAll) {
    // Generate bill for all approved members
    const approvedMembers = members.filter(m => m.status === MemberStatus.APPROVED && m.role !== MemberRole.ADMIN);
    const newBills: Bill[] = approvedMembers.map(m => ({
      id: `bill-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      description: description || 'Iuran wajib serikat tolong menolong.',
      amount: Number(amount),
      dueDate,
      status: BillStatus.UNPAID,
      memberId: m.id,
      memberName: m.name
    }));

    bills.unshift(...newBills);
    writeJSON('bills.json', bills);
    return res.json({ success: true, message: `Berhasil membuat ${newBills.length} tagihan untuk semua anggota.`, bills: newBills });
  } else {
    // Generate bill for specific member
    if (!memberId) {
      return res.status(400).json({ error: 'ID Anggota terarah diperlukan.' });
    }
    const targetMember = members.find(m => m.id === memberId);
    if (!targetMember) {
      return res.status(404).json({ error: 'Anggota tidak ditemukan.' });
    }

    const newBill: Bill = {
      id: `bill-${Date.now()}`,
      title,
      description: description || 'Tagihan khusus anggota.',
      amount: Number(amount),
      dueDate,
      status: BillStatus.UNPAID,
      memberId: targetMember.id,
      memberName: targetMember.name
    };

    bills.unshift(newBill);
    writeJSON('bills.json', bills);
    return res.json({ success: true, message: `Berhasil membuat tagihan untuk ${targetMember.name}.`, bill: newBill });
  }
});

// Member melakukan konfirmasi pembayaran iuran
app.post('/api/bills/:id/pay', (req, res) => {
  const { id } = req.params;
  const { paymentMethod, paymentProof } = req.body;

  if (!paymentMethod) {
    return res.status(400).json({ error: 'Metode pembayaran diperlukan.' });
  }

  const index = bills.findIndex(b => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Tagihan tidak ditemukan.' });
  }

  bills[index].status = BillStatus.PENDING_PAYMENT;
  bills[index].paymentMethod = paymentMethod;
  bills[index].paymentProof = paymentProof || 'Sudah upload bukti bayar';
  bills[index].paidAt = new Date().toISOString();

  writeJSON('bills.json', bills);
  res.json(bills[index]);
});

// Admin approves bill payment, integrating into income statement
app.put('/api/bills/:id/approve', (req, res) => {
  const { id } = req.params;
  const { approvedBy } = req.body;

  const bIndex = bills.findIndex(b => b.id === id);
  if (bIndex === -1) {
    return res.status(404).json({ error: 'Tagihan tidak ditemukan.' });
  }

  const bill = bills[bIndex];
  if (bill.status !== BillStatus.PENDING_PAYMENT) {
    return res.status(400).json({ error: 'Hanya tagihan dalam konfirmasi status yang bisa disetujui.' });
  }

  bills[bIndex].status = BillStatus.PAID;
  writeJSON('bills.json', bills);

  // Directly spawn a Finance log to optimize transparency (integrated automation)!
  const newFinanceRecord: FinancialRecord = {
    id: `fin-auto-${Date.now()}`,
    type: FinanceType.INCOME,
    category: 'Iuran Kas Bulanan (App)',
    amount: bill.amount,
    description: `Iuran Bulanan Lunas Aplikasi: ${bill.title} oleh ${bill.memberName}`,
    date: new Date().toISOString().split('T')[0],
    addedBy: approvedBy || 'Sistem Terverifikasi'
  };

  finances.unshift(newFinanceRecord);
  writeJSON('finances.json', finances);

  res.json({
    success: true,
    bill: bills[bIndex],
    finance: newFinanceRecord
  });
});

// 4. Laporan Keuangan (Finances)
app.get('/api/finances', (req, res) => {
  res.json(finances);
});

app.post('/api/finances', (req, res) => {
  const { type, category, amount, description, date, addedBy } = req.body;
  if (!type || !category || !amount || !description || !date) {
    return res.status(400).json({ error: 'Tipe, Kategori, Nominal, Deskripsi, dan Tanggal diperlukan.' });
  }

  const newRecord: FinancialRecord = {
    id: `fin-${Date.now()}`,
    type: type as FinanceType,
    category,
    amount: Number(amount),
    description,
    date,
    addedBy: addedBy || 'Administrator'
  };

  finances.unshift(newRecord);
  writeJSON('finances.json', finances);
  res.json(newRecord);
});

// 5. Penggalangan Dana (Donations)
app.get('/api/donations', (req, res) => {
  res.json(donations);
});

app.post('/api/donations', (req, res) => {
  const { title, description, targetAmount, deadline, creator } = req.body;
  if (!title || !targetAmount || !deadline) {
    return res.status(400).json({ error: 'Judul, Target Dana, dan Tenggat Waktu diperlukan.' });
  }

  const newCampaign: DonationCampaign = {
    id: `don-${Date.now()}`,
    title,
    description,
    targetAmount: Number(targetAmount),
    currentAmount: 0,
    deadline,
    status: 'active',
    creator: creator || 'Pengurus',
    createdAt: new Date().toISOString(),
    contributions: []
  };

  donations.unshift(newCampaign);
  writeJSON('donations.json', donations);
  res.json(newCampaign);
});

app.post('/api/donations/:id/contribute', (req, res) => {
  const { id } = req.params;
  const { donorName, amount, message } = req.body;

  if (!donorName || !amount) {
    return res.status(400).json({ error: 'Nama Donatur dan Nominal Donasi wajib diisi.' });
  }

  const index = donations.findIndex(d => d.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Kampanye tidak ditemukan.' });
  }

  const updatedCampaign = donations[index];
  const donAmt = Number(amount);
  
  const newCont: any = {
    id: `c-${Date.now()}`,
    donorName,
    amount: donAmt,
    message: message || '',
    date: new Date().toISOString().split('T')[0]
  };

  updatedCampaign.contributions.push(newCont);
  updatedCampaign.currentAmount += donAmt;

  if (updatedCampaign.currentAmount >= updatedCampaign.targetAmount) {
    updatedCampaign.status = 'completed';
  }

  donations[index] = updatedCampaign;
  writeJSON('donations.json', donations);

  // Create general auxiliary Finance tracking for transparency
  const newFin: FinancialRecord = {
    id: `fin-don-${Date.now()}`,
    type: FinanceType.INCOME,
    category: 'Donasi Gotong Royong',
    amount: donAmt,
    description: `Masuk Donasi: ${updatedCampaign.title} dari ${donorName}`,
    date: new Date().toISOString().split('T')[0],
    addedBy: 'Penggalangan Dana'
  };
  finances.unshift(newFin);
  writeJSON('finances.json', finances);

  res.json({
    campaign: updatedCampaign,
    finance: newFin
  });
});

// 6. Forum Diskusi & Informasi
app.get('/api/posts', (req, res) => {
  res.json(posts);
});

app.post('/api/posts', (req, res) => {
  const { title, content, authorId, authorName, role } = req.body;
  if (!title || !content || !authorName) {
    return res.status(400).json({ error: 'Judul, Isi Diskusi, dan Penulis wajib diisi.' });
  }

  const newPost: ForumPost = {
    id: `post-${Date.now()}`,
    title,
    content,
    authorId: authorId || 'guest-' + Date.now(),
    authorName,
    role: (role as MemberRole) || MemberRole.MEMBER,
    createdAt: new Date().toISOString(),
    comments: []
  };

  posts.unshift(newPost);
  writeJSON('posts.json', posts);
  res.json(newPost);
});

app.post('/api/posts/:id/comments', (req, res) => {
  const { id } = req.params;
  const { content, authorName, role } = req.body;

  if (!content || !authorName) {
    return res.status(400).json({ error: 'Isi Komentar dan Nama Penulis wajib diisi.' });
  }

  const index = posts.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Pos diskusi tidak ditemukan.' });
  }

  const newComment: any = {
    id: `com-${Date.now()}`,
    content,
    authorName,
    role: (role as MemberRole) || MemberRole.MEMBER,
    createdAt: new Date().toISOString()
  };

  posts[index].comments.push(newComment);
  writeJSON('posts.json', posts);
  res.json(posts[index]);
});

// 7. Kegiatan & Berita
app.get('/api/news', (req, res) => {
  res.json(news);
});

app.post('/api/news', (req, res) => {
  const { title, content, date, location, addedBy, mediaUrl, mediaType } = req.body;
  if (!title || !content || !date || !location) {
    return res.status(400).json({ error: 'Judul, Isi Berita, Tanggal, dan Lokasi wajib diisi.' });
  }

  const newNews: ActivityNews = {
    id: `news-${Date.now()}`,
    title,
    content,
    date,
    location,
    mediaUrl,
    mediaType,
    addedBy: addedBy || 'Administrator'
  };

  news.unshift(newNews);
  writeJSON('news.json', news);
  res.json(newNews);
});

app.delete('/api/news/:id', (req, res) => {
  const { id } = req.params;
  const index = news.findIndex(n => n.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Kabar kegiatan tidak ditemukan.' });
  }
  news.splice(index, 1);
  writeJSON('news.json', news);
  res.json({ success: true, message: 'Berita terhapus.' });
});

// Serving UI logic
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Yayasan Serikat Tolong Menolong running on port ${PORT}`);
  });
}

startServer();
