# VoxSilent: Technical Specifications

## 1. Tech Stack Recommendation
- **Frontend:** Next.js (React) - Untuk performa cepat dan SEO (Landing Page).
- **Real-time Engine:** Supabase Realtime atau Firebase - Untuk sinkronisasi instan antar peserta.
- **AI Engine:** Gemini API atau OpenAI API - Untuk clustering pendapat.
- **Styling:** Vanilla CSS atau TailwindCSS - Fokus pada responsivitas mobile.

## 2. Database Schema (PostgreSQL)

```sql
-- User & Auth Tables
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Core Tables
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    gm_id UUID REFERENCES users(id), -- GM harus login
    status TEXT CHECK (status IN ('waiting', 'active', 'finished')),
    config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing & Subscription Tables
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- 'Free', 'Business (Event)', 'Business (Monthly)'
    price DECIMAL(12,2) NOT NULL,
    max_participants INTEGER,
    features JSONB
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    plan_id UUID REFERENCES plans(id),
    status TEXT CHECK (status IN ('active', 'expired', 'cancelled')),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    room_id UUID REFERENCES rooms(id), -- NULL jika untuk langganan bulanan
    amount DECIMAL(12,2) NOT NULL,
    payment_status TEXT CHECK (payment_status IN ('pending', 'success', 'failed')),
    payment_method TEXT, -- 'Midtrans', 'Xendit', dll
    transaction_ref TEXT UNIQUE, -- ID dari Payment Gateway
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id),
    text TEXT NOT NULL,
    session_order INTEGER,
    status TEXT CHECK (status IN ('pending', 'input', 'grouping', 'debate', 'voting', 'done')),
    duration_sec INTEGER
);

CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id),
    avatar_id TEXT,
    is_muted BOOLEAN DEFAULT FALSE
);

CREATE TABLE opinions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES questions(id),
    participant_id UUID REFERENCES participants(id),
    content TEXT NOT NULL,
    group_id UUID -- Relates to grouped category
);

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opinion_id UUID REFERENCES opinions(id),
    participant_id UUID REFERENCES participants(id),
    content TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES questions(id),
    participant_id UUID REFERENCES participants(id),
    target_id UUID NOT NULL -- ID of chosen group/opinion
);
```

## 3. Technical Constraints & Workarounds
- **Haptic/Vibration:**
    - **Android:** Implementasi via `navigator.vibrate()`.
    - **iOS:** Workaround menggunakan **Visual Glow & Soft Audio Ping** karena limitasi Safari.
- **Anonymity Layer:** ID Peserta tidak boleh ditampilkan di UI; sistem hanya menampilkan avatar 3D abstrak.
- **Moderation:** Menggunakan sistem *Soft Delete* (update kolom `is_hidden`) agar data tetap tersimpan di database untuk kebutuhan audit pasca-rapat.
