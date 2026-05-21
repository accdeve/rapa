'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

interface ActiveRoom {
  id: string;
  name: string;
  sessionType: string;
  participants: number;
  maxParticipants: number;
  status: 'active' | 'paused';
}

interface MeetingHistory {
  id: string;
  title: string;
  date: string;
  outcome: string;
  decisions: number;
  status: 'mufakat' | 'voting' | 'ongoing';
}

const initialActiveRooms: ActiveRoom[] = [
  { id: '1', name: 'Rapat Strategis Q3', sessionType: 'Brainstorm', participants: 5, maxParticipants: 8, status: 'active' },
  { id: '2', name: 'Planning Product Launch', sessionType: 'Voting', participants: 3, maxParticipants: 6, status: 'paused' },
  { id: '3', name: 'Budget Review 2026', sessionType: 'Mufakat', participants: 7, maxParticipants: 10, status: 'active' },
];

const initialMeetingHistory: MeetingHistory[] = [
  { id: '1', title: 'Evaluasi Kinerja Tim', date: '18 Mei 2026', outcome: 'Disetujui perubahan sistem penilaian', decisions: 4, status: 'mufakat' },
  { id: '2', title: 'Roadmap Fitur Baru', date: '15 Mei 2026', outcome: 'Fokus pada integrasi API', decisions: 6, status: 'mufakat' },
  { id: '3', title: 'Budget Allocation', date: '12 Mei 2026', outcome: 'Dialokasikan 40% untuk R&D', decisions: 3, status: 'voting' },
  { id: '4', title: 'Onboarding Process', date: '10 Mei 2026', outcome: 'Simplifikasi 5 langkah menjadi 3', decisions: 5, status: 'mufakat' },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current * 10) / 10);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <span className={styles.animatedNumber}>
      {count.toFixed(1).replace('.', ',')}
      <span className={styles.suffix}>{suffix}</span>
    </span>
  );
}

function ParticipantAvatars({ count, max }: { count: number; max: number }) {
  const colors = ['#FF7A3D', '#8B5CF6', '#BEF264', '#a53c00', '#6b38d4'];
  const visibleCount = Math.min(count, 4);

  return (
    <div className={styles.avatarsContainer}>
      {Array.from({ length: visibleCount }).map((_, i) => (
        <div
          key={i}
          className={`${styles.avatar} ${i === 0 ? styles.pulsing : ''}`}
          style={{ backgroundColor: colors[i % colors.length] }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className={styles.avatarIcon}>
            <circle cx="12" cy="8" r="4" />
            <path d="M12 14c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z" />
          </svg>
        </div>
      ))}
      {count > 4 && <div className={styles.avatarMore}>+{count - 4}</div>}
      <span className={styles.participantCount}>{count}/{max}</span>
    </div>
  );
}

function SessionTag({ type }: { type: string }) {
  const typeStyles: Record<string, string> = {
    Brainstorm: styles.tagBrainstorm,
    Voting: styles.tagVoting,
    Mufakat: styles.tagMufakat,
  };

  return <span className={`${styles.sessionTag} ${typeStyles[type] || ''}`}>{type}</span>;
}

export default function GMDashboard() {
  const [activeRooms, setActiveRooms] = useState<ActiveRoom[]>(initialActiveRooms);
  const [meetingHistory] = useState<MeetingHistory[]>(initialMeetingHistory);
  const [timeSaved, setTimeSaved] = useState(4.5);

  const handleResumeRoom = (roomId: string) => {
    setActiveRooms(rooms =>
      rooms.map(room =>
        room.id === roomId ? { ...room, status: 'active' as const } : room
      )
    );
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <button className={styles.backButton} aria-label="Kembali ke home">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className={styles.headerTitle}>GM Dashboard</h1>
        <button className={styles.userButton} aria-label="Menu pengguna">
          <div className={styles.userAvatar}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="8" r="4" />
              <path d="M12 14c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z" />
            </svg>
          </div>
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.bentoGrid}>
          <section className={styles.statsCard}>
            <div className={styles.statsLabel}>Total Waktu Dihemat</div>
            <div className={styles.statsValue}>
              <AnimatedCounter target={timeSaved} suffix=" JAM" />
            </div>
            <div className={styles.statsImpact}>
              <svg viewBox="0 0 24 24" fill="#BEF264" className={styles.impactIcon}>
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              <span>Impact Positif!</span>
            </div>
          </section>

          <section className={styles.activeRoomsSection}>
            <h2 className={styles.sectionTitle}>Rapat Aktif</h2>
            <div className={styles.roomsList}>
              {activeRooms.map(room => (
                <div key={room.id} className={styles.roomCard}>
                  <div className={styles.roomHeader}>
                    <div className={styles.roomInfo}>
                      <h3 className={styles.roomName}>{room.name}</h3>
                      <SessionTag type={room.sessionType} />
                    </div>
                    <div className={`${styles.roomStatus} ${room.status === 'active' ? styles.statusActive : styles.statusPaused}`}>
                      <span className={styles.statusDot}></span>
                      {room.status === 'active' ? 'Aktif' : 'Dijeda'}
                    </div>
                  </div>
                  <div className={styles.roomFooter}>
                    <ParticipantAvatars count={room.participants} max={room.maxParticipants} />
                    <div className={styles.roomActions}>
                      <button
                        className={styles.actionButton}
                        onClick={() => handleResumeRoom(room.id)}
                        disabled={room.status === 'active'}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                      <button className={styles.actionButton}>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.historySection}>
            <h2 className={styles.sectionTitle}>History Mufakat</h2>
            <div className={styles.historyList}>
              {meetingHistory.map(meeting => (
                <div key={meeting.id} className={styles.historyItem}>
                  <div className={styles.historyDate}>{meeting.date}</div>
                  <div className={styles.historyContent}>
                    <h3 className={styles.historyTitle}>{meeting.title}</h3>
                    <p className={styles.historyOutcome}>{meeting.outcome}</p>
                    <div className={styles.historyMeta}>
                      <span className={styles.decisionBadge}>
                        <svg viewBox="0 0 24 24" fill="currentColor" className={styles.decisionIcon}>
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                        {meeting.decisions} Daftar Keputusan/Mufakat
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <button className={styles.fab} aria-label="Buat rapat baru">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      </button>
    </div>
  );
}