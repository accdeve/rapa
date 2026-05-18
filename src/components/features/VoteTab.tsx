"use client";
import React, { useState, useRef } from 'react';

interface Card { 
  id: number; 
  title: string; 
  desc: string; 
  category: string; 
  opinions?: string[];
}

const initialCards: Card[] = [
  { 
    id: 1, 
    title: "Transition to a 4-day work week for the duration of Q3.", 
    desc: "We can maintain output by reducing meeting times by 50% and implementing focus blocks.", 
    category: "Operations",
    opinions: [
      "\"Lebih fokus, meeting jadi efisien dan langsung ke inti.\"",
      "\"Meningkatkan keseimbangan hidup dan produktivitas tim.\""
    ]
  },
  { 
    id: 2, 
    title: "Implement a new async communication policy across all teams.", 
    desc: "Replace 30% of recurring sync meetings with documented async updates.", 
    category: "Culture",
    opinions: [
      "\"Mengurangi gangguan saat sedang fokus bekerja.\"",
      "\"Dokumentasi keputusan menjadi jauh lebih rapi dan terarah.\""
    ]
  },
  { 
    id: 3, 
    title: "Launch a cross-team hackathon for internal tooling improvements.", 
    desc: "Allocate one sprint per quarter to internal innovation, yielding 40% efficiency gains.", 
    category: "Engineering",
    opinions: [
      "\"Kesempatan emas membersihkan hutang teknis (tech debt).\"",
      "\"Mempererat kolaborasi antar divisi yang jarang berkomunikasi.\""
    ]
  },
  { 
    id: 4, 
    title: "Introduce a monthly 'no-meeting' week for deep focus.", 
    desc: "Clear all non-urgent recurring status checks for 5 consecutive days every month.", 
    category: "Productivity",
    opinions: [
      "\"Waktu berkualitas tanpa interupsi untuk menyelesaikan proyek besar.\""
    ]
  },
  { 
    id: 5, 
    title: "Standardize on Notion for all cross-departmental documentation.", 
    desc: "Consolidate Google Docs, Confluence, and Notion into a single source of truth.", 
    category: "Operations",
    opinions: [
      "\"Menghemat waktu pencarian dokumen hingga 2 jam per minggu.\""
    ]
  },
  { 
    id: 6, 
    title: "Establish an annual remote-work stipend of $500/employee.", 
    desc: "Help employees upgrade home offices to reduce ergonomic issues and boost overall daily morale.", 
    category: "Culture",
    opinions: [
      "\"Sangat membantu membelikan kursi kerja ergonomis baru.\""
    ]
  },
];

export default function VoteTab() {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [activeIndex, setActiveIndex] = useState(0);
  const [animatingOutId, setAnimatingOutId] = useState<number | null>(null);
  const [voteDirection, setVoteDirection] = useState<'left' | 'right' | null>(null);

  // States for ultimate choice locks
  const [votedCard, setVotedCard] = useState<Card | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; card: Card | null }>({ isOpen: false, card: null });

  // Refs for smooth carousel drag physics
  const trackRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const dragOffset = useRef(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (animatingOutId || votedCard || !trackRef.current) return;
    isDragging.current = true;
    startX.current = e.clientX;
    dragOffset.current = 0;

    trackRef.current.setPointerCapture(e.pointerId);
    trackRef.current.style.transition = 'none';
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    const deltaX = e.clientX - startX.current;
    dragOffset.current = deltaX;

    const currentPercentageOffset = (activeIndex * -85) + 7.5;
    const dragPercentShift = (deltaX / window.innerWidth) * 85; 
    const finalShift = currentPercentageOffset + dragPercentShift;

    trackRef.current.style.transform = `translate3d(${finalShift}%, 0, 0)`;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    isDragging.current = false;
    trackRef.current.releasePointerCapture(e.pointerId);

    const finalOffset = dragOffset.current;
    trackRef.current.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
    
    if (finalOffset < -60 && activeIndex < cards.length - 1) {
      setActiveIndex(prev => prev + 1);
    } else if (finalOffset > 60 && activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
    } else {
      const currentPercentageOffset = (activeIndex * -85) + 7.5;
      trackRef.current.style.transform = `translate3d(${currentPercentageOffset}%, 0, 0)`;
    }
  };

  const handleSkip = () => {
    if (!cards.length || animatingOutId !== null) return;
    const cardToSkip = cards[activeIndex];
    
    setAnimatingOutId(cardToSkip.id);
    setVoteDirection('left');

    setTimeout(() => {
      setCards(prev => {
        const next = [...prev];
        const removed = next.shift();
        if (removed) next.push(removed);
        return next;
      });

      setAnimatingOutId(null);
      setVoteDirection(null);
      
      if (trackRef.current) {
        trackRef.current.style.transition = 'none';
      }
    }, 350);
  };

  const handleVoteClick = () => {
    if (!cards.length || animatingOutId !== null) return;
    const cardToVote = cards[activeIndex];
    setConfirmModal({ isOpen: true, card: cardToVote });
  };

  const handleConfirmVote = () => {
    if (!confirmModal.card) return;
    const card = confirmModal.card;
    
    setAnimatingOutId(card.id);
    setVoteDirection('right');

    setTimeout(() => {
      setVotedCard(card);
      setConfirmModal({ isOpen: false, card: null });
      setAnimatingOutId(null);
      setVoteDirection(null);
    }, 450);
  };

  const total = initialCards.length;

  // Ultimate Voted State screen (User can only vote 1 time overall)
  // Re-designed with Apple HIG Dynamic Type sizes
  if (votedCard) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', overflowY: 'auto', animation: 'fadeIn 0.4s ease-out', paddingBottom: '24px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--action-orange)', fontSize: '22px' }}>❧</span>
            {/* HIG Title 3 - 20px Bold */}
            <span style={{ color: 'var(--action-orange)', fontWeight: '800', fontSize: '20px', letterSpacing: '-0.3px' }}>VoxSilent</span>
          </div>
          {/* HIG Footnote - 13px Semibold */}
          <span style={{ backgroundColor: 'rgba(190,242,100,0.2)', color: 'var(--tertiary)', border: '1.5px solid var(--tertiary)', fontWeight: '800', fontSize: '13px', padding: '5px 14px', borderRadius: '100px' }}>✓ VOTED</span>
        </header>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <div style={{ fontSize: '56px', marginBottom: '8px', filter: 'drop-shadow(0 8px 16px rgba(190,242,100,0.25))' }}>🎉</div>
          {/* HIG Title 2 - 22px Bold */}
          <h3 style={{ fontWeight: '900', fontSize: '22px', color: 'var(--on-surface)', marginBottom: '8px', letterSpacing: '-0.5px' }}>Pilihan Anda Dikirim!</h3>
          {/* HIG Footnote - 13.5px Regular */}
          <p style={{ fontSize: '13.5px', color: 'var(--outline)', lineHeight: 1.5, padding: '0 16px' }}>
            Terima kasih! Pilihan Anda dikirim secara <strong>anonim</strong> demi menjaga objektivitas dan keadilan keputusan bersama.
          </p>
        </div>

        {/* Display ONLY the single chosen card */}
        <div style={{
          position: 'relative', backgroundColor: 'white', borderRadius: '24px',
          border: '2px solid var(--tertiary)', padding: '24px',
          boxShadow: '0 16px 40px rgba(190,242,100,0.12)', margin: '16px 0'
        }}>
          <div style={{
            position: 'absolute', top: '16px', right: '16px',
            backgroundColor: 'var(--tertiary)', color: 'var(--on-tertiary)',
            padding: '5px 14px', borderRadius: '100px', fontSize: '11px', fontWeight: '800',
            display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 10px rgba(190,242,100,0.2)'
          }}>
            👍 Voted Idea
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(107,56,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🧠</div>
            <span style={{ backgroundColor: 'rgba(107,56,212,0.1)', color: 'var(--secondary)', padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '800' }}>{votedCard.category}</span>
          </div>

          {/* HIG Headline - 18px Bold */}
          <h4 style={{ fontWeight: '800', fontSize: '18px', color: 'var(--on-surface)', marginBottom: '8px', lineHeight: 1.35, letterSpacing: '-0.3px' }}>{votedCard.title}</h4>
          {/* HIG Footnote - 13.5px Regular */}
          <p style={{ fontSize: '13.5px', color: 'var(--outline)', lineHeight: 1.5, marginBottom: '16px' }}>{votedCard.desc}</p>

          {votedCard.opinions && votedCard.opinions.length > 0 && (
            <div style={{ borderTop: '1px dashed rgba(223,192,180,0.3)', paddingTop: '12px' }}>
              {/* HIG Caption 2 - 11px Semibold */}
              <div style={{ fontSize: '11px', fontWeight: '900', color: 'var(--outline)', marginBottom: '8px', letterSpacing: '0.5px' }}>ARGUMENTASI PENDUKUNG:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {votedCard.opinions.map((op, idx) => (
                  /* HIG Caption 1 - 12.5px */
                  <div key={idx} style={{ fontSize: '12.5px', color: 'var(--on-surface-variant)', fontStyle: 'italic', backgroundColor: 'rgba(107,56,212,0.03)', padding: '8px 12px', borderRadius: '8px', borderLeft: '2.5px solid var(--secondary)' }}>
                    💬 {op}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live Voting Session Status Drawer */}
        <div style={{
          backgroundColor: 'rgba(107,56,212,0.04)', borderRadius: '16px', border: '1px solid rgba(107,56,212,0.08)',
          padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--outline)' }}>STATUS VOTING LIVE</span>
            <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--secondary)' }}>8 / 10 Memilih</span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
            <div style={{ width: '80%', height: '100%', backgroundColor: 'var(--secondary)', borderRadius: '100px' }} />
          </div>
          {/* HIG Footnote - 12px */}
          <span style={{ fontSize: '12px', color: 'var(--outline)', textAlign: 'center', marginTop: '4px' }}>
            ⏳ Menunggu keputusan akhir difinalisasi oleh Moderator Rapat...
          </span>
        </div>
      </div>
    );
  }

  if (!cards.length) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
        <h3 style={{ fontWeight: '800', fontSize: '22px', marginBottom: '8px' }}>Voting Selesai!</h3>
        <p className="text-body">Semua gagasan telah diulas.</p>
      </div>
    );
  }

  const safeActiveIndex = Math.min(activeIndex, cards.length - 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100%', overflowY: 'auto', position: 'relative', paddingBottom: '32px' }}>
      
      {/* Confirmation Glassmorphism Modal */}
      {confirmModal.isOpen && confirmModal.card && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1000,
          backgroundColor: 'rgba(15, 12, 26, 0.4)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '24px', padding: '24px',
            boxShadow: '0 24px 60px rgba(107, 56, 212, 0.16)', border: '1px solid rgba(107, 56, 212, 0.08)',
            width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '14px'
          }}>
            <div style={{ fontSize: '36px', textAlign: 'center' }}>🗳️</div>
            {/* HIG Title 3 - 18px Bold */}
            <h4 style={{ fontWeight: '900', fontSize: '18px', textAlign: 'center', color: 'var(--on-surface)' }}>Konfirmasi Pilihan</h4>
            {/* HIG Footnote - 13px */}
            <p style={{ fontSize: '13px', color: 'var(--outline)', textAlign: 'center', lineHeight: 1.5 }}>
              Apakah Anda yakin ingin memberikan suara Anda untuk gagasan:<br />
              <strong style={{ color: 'var(--secondary)', display: 'block', margin: '8px 0', fontSize: '13.5px' }}>"{confirmModal.card.title}"</strong>
              Pilihan Anda bersifat <strong>anonim</strong> dan <strong>final</strong> (hanya dapat memilih 1 kali).
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
              <button
                onClick={() => setConfirmModal({ isOpen: false, card: null })}
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: '100px', border: '1px solid rgba(0,0,0,0.08)',
                  backgroundColor: 'rgba(0,0,0,0.02)', color: 'var(--outline)', fontSize: '13px', fontWeight: '800',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                Batal
              </button>
              <button
                onClick={handleConfirmVote}
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: '100px', border: 'none',
                  backgroundColor: 'var(--tertiary)', color: 'var(--on-tertiary)', fontSize: '13px', fontWeight: '800',
                  cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(190,242,100,0.3)'
                }}
              >
                Ya, Pilih
              </button>
            </div>
          </div>
        </div>
      )}

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--action-orange)', fontSize: '22px' }}>❧</span>
          {/* HIG Title 3 - 20px Bold */}
          <span style={{ color: 'var(--action-orange)', fontWeight: '800', fontSize: '20px', letterSpacing: '-0.3px' }}>VoxSilent</span>
        </div>
        {/* HIG Footnote - 13px */}
        <span style={{ backgroundColor: 'rgba(255,122,61,0.1)', color: 'var(--action-orange)', fontWeight: '800', fontSize: '13px', padding: '5px 14px', borderRadius: '100px' }}>ID: 284-901</span>
      </header>

      {/* Topic Bar */}
      <div style={{ backgroundColor: 'rgba(255,122,61,0.06)', border: '1px solid rgba(255,122,61,0.15)', borderRadius: '12px', padding: '8px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px' }}>💬</span>
        {/* HIG Footnote - 13px Semibold */}
        <span style={{ fontWeight: '800', fontSize: '13px', color: 'var(--on-surface)' }}>Topic: Q3 Operational Improvements</span>
      </div>

      {/* Option B: Direct Navigation Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '12px', scrollbarWidth: 'none' }}>
        {cards.map((card, idx) => (
          <button
            key={card.id}
            onClick={() => setActiveIndex(idx)}
            style={{
              padding: '6px 14px',
              borderRadius: '100px',
              /* HIG Footnote - 13px Bold */
              border: safeActiveIndex === idx ? '1.5px solid var(--action-orange)' : '1px solid rgba(223,192,180,0.3)',
              backgroundColor: safeActiveIndex === idx ? 'var(--action-orange)' : 'white',
              color: safeActiveIndex === idx ? 'white' : 'var(--outline)',
              fontSize: '13px',
              fontWeight: '800',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              boxShadow: safeActiveIndex === idx ? '0 4px 10px rgba(255,122,61,0.2)' : 'none',
              transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            Ide {idx + 1}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', padding: '0 4px' }}>
        {/* HIG Footnote - 13px Semibold */}
        <span style={{ fontWeight: '800', fontSize: '13px', color: 'var(--on-surface-variant)' }}>Gagasan ke-{safeActiveIndex + 1} dari {cards.length}</span>
        <span style={{ fontWeight: '800', fontSize: '13px', color: 'var(--action-orange)' }}>🔥 Hot Topic</span>
      </div>

      {/* Option A: Peek-a-boo Carousel Viewport */}
      <div style={{ flex: 1, position: 'relative', width: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', padding: '12px 0' }}>
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            display: 'flex',
            width: '100%',
            height: 'auto',
            transform: `translate3d(calc(-${safeActiveIndex} * 85% + 7.5%), 0, 0)`,
            transition: isDragging.current ? 'none' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            cursor: isDragging.current ? 'grabbing' : 'grab',
            touchAction: 'none',
            willChange: 'transform'
          }}
        >
          {cards.map((card, idx) => {
            const isActive = safeActiveIndex === idx;
            const isVotingOut = animatingOutId === card.id;

            let transformStyle = isActive ? 'scale(1)' : 'scale(0.94)';
            let opacityStyle = isActive ? 1 : 0.55;

            if (isVotingOut) {
              const tx = voteDirection === 'right' ? 500 : -500;
              const rot = voteDirection === 'right' ? 20 : -20;
              transformStyle = `translate3d(${tx}px, 0, 0) rotate(${rot}deg) scale(0.9)`;
              opacityStyle = 0;
            }

            return (
              <div
                key={card.id}
                style={{
                  width: '85%',
                  padding: '0 8px',
                  flexShrink: 0,
                  boxSizing: 'border-box',
                  transition: isDragging.current ? 'opacity 0.3s' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s',
                  transform: transformStyle,
                  opacity: opacityStyle,
                  willChange: 'transform, opacity'
                }}
              >
                {/* Visual Card Container */}
                <div style={{
                  minHeight: '360px',
                  height: 'auto',
                  backgroundColor: 'white',
                  borderRadius: '24px',
                  border: isActive ? '1.5px solid rgba(107,56,212,0.15)' : '1px solid rgba(223,192,180,0.3)',
                  boxShadow: isActive ? '0 16px 40px rgba(107, 56, 212, 0.08)' : '0 4px 12px rgba(0,0,0,0.02)',
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(107,56,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🧠</div>
                    <span style={{ backgroundColor: 'rgba(107,56,212,0.1)', color: 'var(--secondary)', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '800' }}>{card.category}</span>
                  </div>
                  
                  {/* HIG Headline - 18px Bold */}
                  <h3 style={{ fontWeight: '800', fontSize: '18px', lineHeight: 1.35, marginBottom: '6px', color: 'var(--on-surface)', letterSpacing: '-0.3px' }}>{card.title}</h3>
                  {/* HIG Footnote - 13.5px Regular */}
                  <p style={{ fontSize: '13.5px', color: 'var(--outline)', lineHeight: 1.45, marginBottom: '10px' }}>{card.desc}</p>
                  
                  {/* Embedded opinions list inside Card - Expands downwards naturally */}
                  {card.opinions && card.opinions.length > 0 && (
                    <div style={{ borderTop: '1px dashed rgba(223,192,180,0.25)', paddingTop: '8.5px', marginTop: '12px' }}>
                      {/* HIG Caption 2 - 11px Semibold */}
                      <div style={{ fontSize: '11px', fontWeight: '900', color: 'var(--outline)', marginBottom: '8px', letterSpacing: '0.5px' }}>PENDAPAT REKAN:</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {card.opinions.map((op, idx) => (
                          /* HIG Caption 1 - 12.5px */
                          <div key={idx} style={{ fontSize: '12.5px', color: 'var(--on-surface-variant)', fontStyle: 'italic', backgroundColor: 'rgba(107,56,212,0.03)', padding: '8px 12.5px', borderRadius: '10px', borderLeft: '2.5px solid var(--secondary)', lineHeight: 1.4 }}>
                            💬 {op}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* HIG Caption 2 - 11px Bold */}
                  <div style={{ borderTop: '1px solid rgba(223,192,180,0.15)', paddingTop: '8px', marginTop: '6px', textAlign: 'center', color: 'var(--outline)', fontSize: '11px', letterSpacing: '0.5px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    SWIPE KIRI / KANAN UNTUK MEMBACA
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Skip and Vote Controls */}
      <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', marginTop: '10px', marginBottom: '8px' }}>
        <button onClick={handleSkip}
          style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(240,240,245,0.9)', border: '1px solid rgba(0,0,0,0.05)', fontSize: '18px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: 'transform 0.2s, background-color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--outline)' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.92)')}>✕</button>
        
        <button onClick={handleVoteClick}
          style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(190,242,100,0.25)', border: '2px solid var(--tertiary)', fontSize: '18px', cursor: 'pointer', boxShadow: '0 6px 16px rgba(71,104,0,0.15)', transition: 'transform 0.2s, background-color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.92)')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--tertiary)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
