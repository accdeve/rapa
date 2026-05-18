---
name: VoxSilent Mobile Design System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#584239'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#8c7167'
  outline-variant: '#dfc0b4'
  surface-tint: '#a53c00'
  primary: '#a53c00'
  on-primary: '#ffffff'
  primary-container: '#ff7a3d'
  on-primary-container: '#652200'
  inverse-primary: '#ffb598'
  secondary: '#6b38d4'
  on-secondary: '#ffffff'
  secondary-container: '#8455ef'
  on-secondary-container: '#fffbff'
  tertiary: '#476800'
  on-tertiary: '#ffffff'
  tertiary-container: '#80af27'
  on-tertiary-container: '#293e00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcd'
  primary-fixed-dim: '#ffb598'
  on-primary-fixed: '#360f00'
  on-primary-fixed-variant: '#7e2c00'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#bff365'
  tertiary-fixed-dim: '#a4d64c'
  on-tertiary-fixed: '#131f00'
  on-tertiary-fixed-variant: '#354e00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
  cloud-white: '#F8FAFC'
  midnight-navy: '#0F172A'
  success-lime: '#BEF264'
  anon-purple: '#8B5CF6'
  action-orange: '#FF7A3D'
typography:
  display-lg:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Lexend
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
  button-text:
    fontFamily: Lexend
    fontSize: 16px
    fontWeight: '600'
    lineHeight: '1'
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  margin-page: 24px
  gutter-grid: 16px
  bento-gap: 20px
  section-padding: 80px
---

# VoxSilent Master Design Specification

Dokumen ini mendefinisikan identitas visual, komponen UI, dan alur pengalaman pengguna (UX) untuk VoxSilent, menggabungkan estetika **Playful-Tech** yang ramah namun tetap profesional dan efisien.

---

## 1. Design System & Visual Language

Mengikuti referensi gaya "Kōōra", VoxSilent menggunakan bentuk organik, tipografi tebal, dan grid yang bersih.

### 1.1 Color Palette
- **Primary Orange:** `#FF7A3D` - Energetik, digunakan untuk tombol utama dan aksen penting.
- **Deep Purple:** `#8B5CF6` - Memberikan kesan kreatif dan misterius (anonimitas).
- **Lime Green:** `#BEF264` - Untuk status "Sukses", "Vote", dan elemen kalkulator ROI.
- **Midnight Navy:** `#0F172A` - Digunakan untuk Dashboard (Dark Mode) agar mata tidak lelah.
- **Cloud White:** `#F8FAFC` - Latar belakang Landing Page untuk kesan bersih dan terbuka.

### 1.2 Typography
- **Heading Font:** `Outfit` atau `Lexend` (Semi-bold/Bold) - Memberikan kesan modern dan ramah.
- **Body Font:** `Inter` (Regular/Medium) - Fokus pada legibilitas tinggi.

### 1.3 UI Elements & Grid
- **Shapes:** Sudut sangat bulat (*Extra Rounded* - 24px+) dan bentuk blob organik untuk avatar.
- **Grid:** Menggunakan *Bento Grid* untuk dashboard dan *12-column layout* untuk landing page.
- **Background:** Grid tipis (*Subtle Grid Lines*) seperti pada referensi untuk memberikan kesan terstruktur.

---

## 2. Landing Page Design (The Front Door)

Latar Belakang: **Cloud White** dengan grid tipis.

### 2.1 Hero Section
- **Visual:** Blob characters (Avatar 3D) yang sedang "berbisik" ke arah input box.
- **Headline:** "Suarakan Ide Tanpa Tekanan, Ambil Keputusan dengan Pasti."
- **Dual CTA:**
    - `Input Field` (Enter Room ID) + `Join Button` (Deep Purple).
    - `Button` "Mulai Rapat Baru" (Primary Orange - Outlined/Solid).

### 2.2 ROI Calculator Widget (Glassmorphism)
- **Design:** Kartu putih semi-transparan dengan *blur* latar belakang.
- **Interactive:** Slider Lime Green yang responsif.
- **Output:** Teks besar "VoxSilent menghemat **Rp [X.XXX.XXX]** biaya rapat Anda."

### 2.3 The "Amazon Method" Hook
- Teks bergaya editorial dengan ikon minimalis yang menjelaskan digitalisasi *Silent Meeting*.

### 2.4 Pricing Cards
- Tiga kartu dengan aksen warna berbeda (Orange, Purple, Green). 
- Fokus pada tombol "Get Started" yang menonjol.

---

## 3. Application Pages (The Workflow)

### 3.1 GM Dashboard (The Command Center)
- **Theme:** Dark Mode (**Midnight Navy**).
- **Layout:** Bento Grid.
    - **Slot Kiri Atas:** Statistik penghematan waktu (Angka besar dengan animasi *counter*).
    - **Slot Kanan Atas:** Daftar rapat aktif (Kartu dengan avatar peserta yang berdenyut).
    - **Slot Bawah:** History mufakat dalam bentuk list linear yang bersih.

### 3.2 Meeting Session (The Core UI)
1. **Waiting Room:** Visualisasi avatar 3D (Blob, Cube, Cone) masuk ke layar seperti gelembung yang muncul.
2. **Brainstorming Session:** Input area besar di tengah. Teks yang diketik muncul sebagai "gelembung ide" yang belum terbaca oleh orang lain.
3. **AI Grouping (Visual Magic):** Animasi di mana gelembung-gelembung ide terbang dan menyatu ke dalam kategori yang diberi label oleh AI.
4. **The Swipe UI (Mobile):** Kartu ide muncul di tengah layar. 
    - Swipe Kanan: Setuju/Kategori A.
    - Swipe Kiri: Tidak Setuju/Kategori B.
    - Efek *Haptic Feedback* yang terasa mantap.

### 3.3 Final Result & MVP
- Tampilan penuh warna (Selebrasi). 
- Avatar "The Silent Hero" (penyumbang ide terbanyak yang disetujui) muncul di tengah dengan mahkota.
- Keputusan utama ditampilkan dalam kartu *bold* yang mudah di-copy.

---

## 4. Key Components & Micro-Interactions

### 4.1 Anonymous Avatars
- Bukan foto, melainkan **3D Abstract Blobs** dengan ekspresi wajah sederhana (senyum, berkedip). 
- Warna avatar ditentukan secara acak saat peserta masuk.

### 4.2 Buttons & States
- **Hover State:** Tombol sedikit membesar (*Scale 1.05*) dengan bayangan yang lebih lembut.
- **Active State:** Efek menekan ke dalam (*Inset shadow*).

### 4.3 Transitions
- **Session Switch:** Efek *page slide* horizontal yang halus.
- **Notification:** *Toast* kecil yang muncul dari bawah dengan warna Lime Green untuk info penting.

---

## 5. Mobile Experience
- Navigasi menggunakan *Bottom Sheet* untuk pengaturan.
- Interaksi utama (Vote/Swipe) didesain agar bisa dijangkau oleh jempol (Thumb-zone optimized).
