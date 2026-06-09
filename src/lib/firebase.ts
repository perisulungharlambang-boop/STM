import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore Database
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test connection primitive
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore: Client is offline. Check database setup.");
    }
  }
}
testConnection();

// Simple error handler following schema instructions
export function handleFirestoreError(error: unknown, operationType: string, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error Detailed: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Automatic seeder function to populate Firestore if empty
export async function seedDatabaseIfEmpty() {
  try {
    // Check if we've already checked/seeded in this session to avoid redundant writes
    const isSeededKey = 'stm_database_seeded';
    if (sessionStorage.getItem(isSeededKey)) return;

    // Check members collection as an indicator of empty database
    const membersSnap = await getDocs(collection(db, 'members'));
    if (!membersSnap.empty) {
      sessionStorage.setItem(isSeededKey, 'true');
      return;
    }

    console.log("Firestore collections appear empty. Loading initial seed data...");

    // Seed Members
    const initialMembers = [
      {
        "id": "admin-1",
        "name": "Bp. Dr. H. Hermawan Sastroseputro",
        "username": "admin",
        "phone": "081234567890",
        "address": "Jl. Melati No. 12, Kel. Sariharjo, RT 03/RW 15, Sleman",
        "familySize": 4,
        "role": "admin",
        "status": "approved",
        "createdAt": "2026-01-01T08:00:00.000Z"
      },
      {
        "id": "member-budi",
        "name": "Budi Santoso",
        "username": "budi",
        "phone": "085712345678",
        "address": "Jl. Mawar Gg. 2 No. 5B, Kel. Sariharjo, Sleman",
        "familySize": 3,
        "role": "member",
        "status": "approved",
        "createdAt": "2026-01-10T09:30:00.000Z"
      },
      {
        "id": "member-siti",
        "name": "Siti Rahmawati",
        "username": "siti",
        "phone": "089988776655",
        "address": "Jl. Cempaka Indah No. 42, Kel. Sariharjo, Sleman",
        "familySize": 5,
        "role": "member",
        "status": "approved",
        "createdAt": "2026-01-15T14:15:00.000Z"
      },
      {
        "id": "member-wawan",
        "name": "Wawan Setiawan",
        "username": "wawan",
        "phone": "082133445566",
        "address": "Jl. Kamboja No. 17, Sleman",
        "familySize": 2,
        "role": "member",
        "status": "pending",
        "createdAt": "2026-02-18T11:20:00.000Z"
      }
    ];
    for (const item of initialMembers) {
      await setDoc(doc(db, 'members', item.id), item);
    }

    // Seed News
    const initialNews = [
      {
        "id": "news-1",
        "title": "Penyaluran Santunan Sosial Kematian Almh. Ibu Sukartini",
        "content": "Pengurus Serikat Tolong Menolong (STM) telah menyalurkan santunan duka sebesar Rp 1.500.000 kepada keluarga ahli waris bapak Gunawan atas wafatnya ibunda beliau tercinta. Segenap pengurus dan anggota juga melaksanakan takziah dan doa bersama di rumah duka. Semoga amal ibadah almarhumah diterima di sisi Allah SWT.",
        "date": "2026-06-01",
        "location": "Rumah Duka, Sleman",
        "addedBy": "Bp. Dr. H. Hermawan Sastroseputro"
      },
      {
        "id": "news-2",
        "title": "Kerja Bakti Gotong Royong Kebersihan Inventaris Tenda & Keranda",
        "content": "Hari Minggu lalu, seluruh anggota laki-laki STM bergotong royong melakukan perawatan berkala, pembersihan tenda duka, kursi lipat, pencucian kain keranda, dan sterilisasi pemandian jenazah di gudang inventaris RW 15. Terima kasih atas partisipasi aktif bapak-bapak sekalian.",
        "date": "2026-05-24",
        "location": "Gudang Inventaris STM, RW 15",
        "addedBy": "Bp. Dr. H. Hermawan Sastroseputro"
      }
    ];
    for (const item of initialNews) {
      await setDoc(doc(db, 'news', item.id), item);
    }

    // Seed Bills
    const initialBills = [
      {
        "id": "bill-1",
        "title": "Iuran Wajib Bulanan Juni 2026",
        "description": "Iuran rutin bulanan untuk kas utama Serikat Tolong Menolong (STM) periode Juni 2026.",
        "amount": 25000,
        "dueDate": "2026-06-30",
        "status": "unpaid",
        "memberId": "member-budi",
        "memberName": "Budi Santoso"
      },
      {
        "id": "bill-2",
        "title": "Iuran Wajib Bulanan Juni 2026",
        "description": "Iuran rutin bulanan untuk kas utama Serikat Tolong Menolong (STM) periode Juni 2026.",
        "amount": 25000,
        "dueDate": "2026-06-30",
        "status": "paid",
        "paidAt": "2026-06-02T10:00:00Z",
        "paymentMethod": "Transfer Bank (BCA)",
        "paymentProof": "Proof_BCA_Siti.png",
        "memberId": "member-siti",
        "memberName": "Siti Rahmawati"
      },
      {
        "id": "bill-3",
        "title": "Iuran Sukarela Pembangunan Tenda Sosial",
        "description": "Iuran untuk pengadaan tenda duka dan kursi pelayanan masyarakat milik Serikat Tolong Menolong (STM).",
        "amount": 50000,
        "dueDate": "2026-07-15",
        "status": "unpaid",
        "memberId": "member-budi",
        "memberName": "Budi Santoso"
      }
    ];
    for (const item of initialBills) {
      await setDoc(doc(db, 'bills', item.id), item);
    }

    // Seed Posts
    const initialPosts = [
      {
        "id": "post-1",
        "title": "Usul: Kegiatan Senam Sehat & Silaturahmi Bulanan",
        "content": "Assalamu'alaikum wr. wb. Untuk meningkatkan keguyuban antar anggota STM, bagaimana jika kita laksanakan kegiatan senam pagi bersama sebulan sekali, dilanjutkan dengan sarapan bubur kacang ijo di lapangan RT? Mohon masukannya bapak ibu sekalian.",
        "authorId": "member-budi",
        "authorName": "Budi Santoso",
        "role": "member",
        "createdAt": "2026-06-02T02:15:00Z",
        "comments": [
          {
            "id": "com-1",
            "content": "Wa'alaikumsalam wr. wb. Ide yang sangat bagus Pak Budi! Saya sangat setuju untuk menjaga kebersamaan dan kesehatan.",
            "authorName": "Siti Rahmawati",
            "role": "member",
            "createdAt": "2026-06-02T04:20:00Z"
          },
          {
            "id": "com-2",
            "content": "Setuju sekali. Pengurus siap memfasilitasi sound system dan penyediaan konsumsi ringan dari kas sosial.",
            "authorName": "Bp. Dr. H. Hermawan Sastroseputro",
            "role": "admin",
            "createdAt": "2026-06-03T01:10:00Z"
          }
        ]
      },
      {
        "id": "post-2",
        "title": "Pemberitahuan: Prosedur Pengajuan Santunan Duka & Rawat Inap",
        "content": "Mengingatkan kembali kepada seluruh anggota duka, bagi yang ingin mengajukan Santunan Kematian atau Dana Rawat Inap, mohon segera mengirimkan foto KTP, Kartu Keluarga, dan Surat Keterangan Kematian/Sakit dari RS ke pengurus atau melalui aplikasi ini untuk mempercepat verifikasi. Santunan tunai akan diserahkan maksimal 24 jam setelah verifikasi.",
        "authorId": "admin-1",
        "authorName": "Bp. Dr. H. Hermawan Sastroseputro",
        "role": "admin",
        "createdAt": "2026-05-28T09:00:00Z",
        "comments": [
          {
            "id": "com-3",
            "content": "Alhamdulillah, sistem digital ini memudahkan kami jadi tidak perlu repot mencari pengurus ke rumah saat panik/pusing.",
            "authorName": "Budi Santoso",
            "role": "member",
            "createdAt": "2026-05-28T11:45:00Z"
          }
        ]
      }
    ];
    for (const item of initialPosts) {
      await setDoc(doc(db, 'posts', item.id), item);
    }

    // Seed Donations
    const initialDonations = [
      {
        "id": "don-1",
        "title": "Bantuan Pengobatan Stroke Bp. Sugeng",
        "description": "Bp. Sugeng, salah satu sesepuh dan pendiri STM kita, saat ini sedang membutuhkan bantuan dana biaya fisioterapi pasca-stroke berat. Mari bergotong-royong meringankan beban keluarga beliau.",
        "targetAmount": 10000000,
        "currentAmount": 7650000,
        "deadline": "2026-07-31",
        "status": "active",
        "creator": "Pengurus STM",
        "createdAt": "2026-05-15T09:00:00Z",
        "contributions": [
          {
            "id": "c-1",
            "donorName": "Hamba Allah",
            "amount": 500000,
            "message": "Semoga lekas sembuh pak",
            "date": "2026-05-16"
          },
          {
            "id": "c-2",
            "donorName": "Bp. Hermawan",
            "amount": 1000000,
            "message": "Insya Allah pulih kembali",
            "date": "2026-05-17"
          },
          {
            "id": "c-3",
            "donorName": "Siti Rahmawati",
            "amount": 150000,
            "message": "Aamiin",
            "date": "2026-05-19"
          },
          {
            "id": "c-4",
            "donorName": "Kas Masjid Jami",
            "amount": 5000000,
            "message": "Bantuan sosial jamaah",
            "date": "2026-05-20"
          },
          {
            "id": "c-5",
            "donorName": "Budi Santoso",
            "amount": 100000,
            "message": "Gotong royong bersama",
            "date": "2026-06-01"
          }
        ]
      },
      {
        "id": "don-2",
        "title": "Santunan Kebakaran Rumah Sdr. Ridwan",
        "description": "Musibah kebakaran melanda kediaman Sdr. Ridwan (Anggota aktif STM Barat) pekan lalu. Kehilangan hampir seluruh perabotan rumah tangga. Dana akan disalurkan dalam bentuk sandang, pangan, dan bahan bangunan dasar.",
        "targetAmount": 5000000,
        "currentAmount": 4800000,
        "deadline": "2026-06-25",
        "status": "active",
        "creator": "Pengurus STM",
        "createdAt": "2026-06-01T08:00:00Z",
        "contributions": [
          {
            "id": "c3-1",
            "donorName": "Warga RT 03",
            "amount": 2000000,
            "message": "Sumbangan swadaya RT",
            "date": "2026-06-02"
          },
          {
            "id": "c3-2",
            "donorName": "Hamba Allah",
            "amount": 1000000,
            "message": "Meringankan beban sesama Muslim",
            "date": "2026-06-03"
          },
          {
            "id": "c3-3",
            "donorName": "Arisan Ibu-Ibu Melati",
            "amount": 1800000,
            "message": "Semoga bermanfaat",
            "date": "2026-06-05"
          }
        ]
      }
    ];
    for (const item of initialDonations) {
      await setDoc(doc(db, 'donations', item.id), item);
    }

    // Seed Finances
    const initialFinances = [
      {
        "id": "fin-1",
        "type": "income",
        "category": "Iuran Kas Bulanan",
        "amount": 1500000,
        "description": "Kas Terkumpul Iuran Wajib Januari 2026 (60 Anggota)",
        "date": "2026-01-31",
        "addedBy": "Bp. Dr. H. Hermawan Sastroseputro"
      },
      {
        "id": "fin-2",
        "type": "expense",
        "category": "Santunan Duka",
        "amount": 1000000,
        "description": "Santunan Kematian Alm. Ibu Martini (Istri dari Bp. Joko, Anggota STM)",
        "date": "2026-02-05",
        "addedBy": "Bp. Dr. H. Hermawan Sastroseputro"
      },
      {
        "id": "fin-3",
        "type": "income",
        "category": "Sumbangan Donatur",
        "amount": 3500000,
        "description": "Sumbangan hamba Allah untuk pembelian perlengkapan pemandian jenazah",
        "date": "2026-02-20",
        "addedBy": "Bp. Dr. H. Hermawan Sastroseputro"
      },
      {
        "id": "fin-4",
        "type": "expense",
        "category": "Peralatan & Perlengkapan",
        "amount": 2200000,
        "description": "Pembelian keranda stenlis baru dan kain kafan cadangan",
        "date": "2026-03-10",
        "addedBy": "Bp. Dr. H. Hermawan Sastroseputro"
      },
      {
        "id": "fin-5",
        "type": "income",
        "category": "Iuran Kas Bulanan",
        "amount": 1450000,
        "description": "Kas Terkumpul Iuran Wajib Februari - Maret 2026",
        "date": "2026-04-10",
        "addedBy": "Bp. Dr. H. Hermawan Sastroseputro"
      }
    ];
    for (const item of initialFinances) {
      await setDoc(doc(db, 'finances', item.id), item);
    }

    // Seed default settings config
    const defaultSettings = {
      id: 'config',
      organizationName: 'Yayasan Serikat Tolong Menolong (STM)',
      tagline: 'Guyub Rukun Gotong Royong',
      adminWhatsApp: '6281234567890',
      defaultDuesAmount: 50000
    };
    await setDoc(doc(db, 'settings', 'config'), defaultSettings);

    sessionStorage.setItem(isSeededKey, 'true');
    console.log("Firestore database initialized successfully with initial seed data!");
  } catch (err) {
    console.error("Failed to seed dummy data into Firebase:", err);
  }
}

// Function to reset and clear all data from Firestore
export async function resetDatabaseAllData(reseed: boolean = false) {
  const collectionsToClear = ['members', 'news', 'bills', 'posts', 'donations', 'finances', 'settings'];
  
  try {
    for (const colName of collectionsToClear) {
      const colRef = collection(db, colName);
      const snap = await getDocs(colRef);
      
      const batch = writeBatch(db);
      snap.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
    }
    
    // Clear session storage flag so it can seed again if empty/requested
    sessionStorage.removeItem('stm_database_seeded');
    
    if (reseed) {
      // Re-seed with original template data
      await seedDatabaseIfEmpty();
    } else {
      // Re-create at least the default admin profile and basic config so the application remains functional
      const defaultAdmin = {
        "id": "admin-1",
        "name": "Bp. Dr. H. Hermawan Sastroseputro",
        "username": "admin",
        "phone": "081234567890",
        "address": "Jl. Melati No. 12, Kel. Sariharjo, RT 03/RW 15, Sleman",
        "familySize": 4,
        "role": "admin",
        "status": "approved",
        "createdAt": new Date().toISOString()
      };
      await setDoc(doc(db, 'members', 'admin-1'), defaultAdmin);
      
      const defaultSettings = {
        id: 'config',
        organizationName: 'Yayasan Serikat Tolong Menolong (STM)',
        tagline: 'Guyub Rukun Gotong Royong',
        adminWhatsApp: '6281234567890',
        defaultDuesAmount: 50000
      };
      await setDoc(doc(db, 'settings', 'config'), defaultSettings);
    }
    
    console.log("Database reset completed successfully!");
  } catch (error) {
    handleFirestoreError(error, 'delete', 'all-collections');
    throw error;
  }
}

