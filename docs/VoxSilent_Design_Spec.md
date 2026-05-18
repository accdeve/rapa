# VoxSilent Design Specification & UX Flow

## 1. Style Guide: "Zen-Tech Minimalism"

Tujuan desain adalah menciptakan suasana yang tenang (Zen) namun tetap terasa canggih (Tech). Fokus pada keterbacaan dan kenyamanan mata dalam durasi rapat yang lama.

### 1.1 Color Palette
- **Deep Navy (Background):** `#0F172A` - Memberikan fokus dan kedalaman.
- **Pure White (Text):** `#F8FAFC` - Kontras tinggi untuk teks utama.
- **Mint Green (Action):** `#10B981` - Untuk tombol "Vote", "Submit", dan status sukses.
- **Soft Indigo (Accents):** `#6366F1` - Untuk fitur AI dan elemen interaktif.
- **Danger Red (Alert):** `#EF4444` - Untuk tombol "Hapus" atau "Mute".

### 1.2 Typography
- **Primary Font:** `Inter` atau `Outfit` (Sans-serif modern).
- **Heading:** Semi-bold, ukuran besar untuk judul pertanyaan.
- **Body:** Regular, spasi antar baris (line-height) yang lega agar nyaman dibaca.

### 1.3 UI Elements
- **Corners:** Rounded (16px - 24px) untuk kesan ramah dan modern.
- **Effects:** Glassmorphism (Background blur) pada modal dan kartu.
- **Avatars:** 3D Abstract Shapes (Blob, Cube, Cone) dengan warna pastel agar tetap anonim namun lucu.

---

## 2. Full UX Flow & UI Requirements

### 2.1 Landing Page & Auth Flow
- **UI:** Minimalis, Dual CTA (Join/Create).
- **Flow Create:** Click "Create" -> Redirect Login -> Sign Up/Login Modal -> Redirect Dashboard.

### 2.2 GM Dashboard (The Command Center)
- **UI:** Bento Grid style.
    - Slot 1: "Total Waktu Dihemat" (Statistik).
    - Slot 2: Daftar Rapat Aktif/Mendatang.
    - Slot 3: History Rapat (Log Mufakat).
- **Action:** Tombol mengambang (FAB) bertanda "+" untuk membuat rapat baru.

### 2.3 Room Setup UI (GM Side)
- **Step 1:** Judul Rapat & Estimasi Biaya (untuk Kalkulator).
- **Step 2:** Input Agenda (Daftar Pertanyaan).
- **Step 3:** Pengaturan Sesi (Durasi tiap tahap, Toggle AI).
- **Step 4:** Share Link (Munculkan QR Code besar di layar).

### 2.4 The Meeting Sessions (The Core Experience)
1. **Waiting Room:** Muncul visualisasi avatar 3D peserta yang masuk secara real-time. Ada tombol "Start Meeting" bagi GM.
2. **Sesi Input:** Input box minimalis dengan *Character Counter*. 
3. **Sesi Grouping (The Swipe UI):**
    - **GM Mobile:** Kartu pendapat muncul satu-satu, swipe kanan untuk kategori A, swipe kiri kategori B.
    - **GM Laptop:** Drag & Drop kartu ke folder kategori.
4. **Debate & Vote:** Antarmuka chat threaded dengan label "Pro" / "Kontra" / "Saran" (opsional).

### 2.5 Final Result & MoM
- **UI:** Tampilan "Celebratory".
- **MVP Highlight:** Avatar pemenang muncul dengan mahkota/efek khusus.
- **Decision List:** Daftar poin mufakat yang bisa langsung di-copy atau di-export.

### 2.6 Payment & Subscription Flow
- **UI:** Kartu harga yang kontras.
- **Flow:** Pilih Paket -> Pop-up Metode Pembayaran (Midtrans/Xendit) -> Success State (Efek confetti) -> Plan Updated.

### Layar 6: Silent Debate (Mobile)
- **UI:** Threaded comments mirip antarmuka Twitter/X. 
- **Action:** Peserta bisa klik "Reply" pada kategori ide. Komentar tetap anonim.

### Layar 7: Voting Session (Mobile)
- **UI:** Pilihan kategori/ide dalam bentuk list besar. 
- **Action:** Peserta memilih satu. Konfirmasi dengan getaran HP (*Haptic Feedback*).

### Layar 8: Final History & MVP (All)
- **UI:** Kartu besar berisi "Keputusan Utama". Di bawahnya ada statistik MVP dengan avatar 3D yang merayakan kemenangan.
- **Action:** Tombol "Download PDF" atau "Share to WhatsApp".

---

## 3. Micro-Interactions
- **Haptic Feedback:** HP bergetar pelan saat sesi berganti.
- **Smooth Transitions:** Perpindahan antar sesi tidak kaku, tapi menggunakan efek *fade* atau *slide*.
- **Live Counter:** Jumlah peserta aktif terlihat berdenyut (*pulse*) di pojok layar.
