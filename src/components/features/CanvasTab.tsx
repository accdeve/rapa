"use client";
import React, { useState, useRef } from 'react';
import { Icons } from '../ui/Icons';

interface Idea {
  id: string;
  label: string;
  text: string;
  color: string;
}

interface Support {
  id: string;
  ideaId: string;
  text: string;
}

export default function CanvasTab() {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const startPan = useRef({ x: 0, y: 0 });

  // Game Master (GM) Mode state
  const [isGMMode, setIsGMMode] = useState(false);

  // Merge modal state
  const [mergeModal, setMergeModal] = useState<{ isOpen: boolean; sourceId: string | null }>({
    isOpen: false,
    sourceId: null
  });

  // Dynamic ideas state
  const [ideas, setIdeas] = useState<Idea[]>([
    { id: 'i1', label: 'Gagasan A', text: 'Penerapan sistem light mode baru', color: 'var(--action-orange)' },
    { id: 'i2', label: 'Gagasan B', text: 'Desain whiteboard 2D interaktif', color: 'var(--secondary)' },
  ]);

  // Dynamic supports state
  const [supports, setSupports] = useState<Support[]>([
    { id: 's1', ideaId: 'i1', text: 'Bagus sekali!' },
    { id: 's2', ideaId: 'i1', text: 'Setuju ide A' },
    { id: 's3', ideaId: 'i1', text: 'Sangat efisien' },
    { id: 's4', ideaId: 'i2', text: 'Sangat interaktif!' },
    { id: 's5', ideaId: 'i2', text: 'Suka ide whiteboard' },
  ]);

  // Dynamic positions for dragging
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({
    i1: { x: 80, y: 80 },
    i2: { x: 240, y: 260 },
    s1: { x: 15, y: 200 },
    s2: { x: 220, y: 40 },
    s3: { x: 30, y: 15 },
    s4: { x: 420, y: 180 },
    s5: { x: 340, y: 350 }
  });

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  
  // States for smooth dragging of items
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const itemDragOffset = useRef({ x: 0, y: 0 });

  // Panning handlers (Background)
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).tagName !== 'DIV' && (e.target as HTMLElement).tagName !== 'svg') return;
    setIsPanning(true);
    setReplyingTo(null); // Dismiss reply state if clicking background
    startPan.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - startPan.current.x, y: e.clientY - startPan.current.y });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsPanning(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // Item dragging handlers (Smooth Movement)
  const handleItemPointerDown = (e: React.PointerEvent, id: string, text?: string) => {
    e.stopPropagation();
    if (text) setReplyingTo(text);
    
    setDraggingId(id);
    const pos = positions[id] || { x: 100, y: 100 };
    itemDragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleItemPointerMove = (e: React.PointerEvent) => {
    if (!draggingId) return;
    e.stopPropagation();
    setPositions(prev => ({
      ...prev,
      [draggingId]: {
        x: e.clientX - itemDragOffset.current.x,
        y: e.clientY - itemDragOffset.current.y
      }
    }));
  };

  const handleItemPointerUp = (e: React.PointerEvent) => {
    if (!draggingId) return;
    e.stopPropagation();
    setDraggingId(null);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // Add new idea or support from input
  const handleSend = () => {
    if (!inputText.trim()) return;

    if (replyingTo) {
      // Find parent idea
      const parentIdea = ideas.find(i => i.text === replyingTo);
      if (parentIdea) {
        const newId = 's' + Date.now();
        setSupports(prev => [...prev, { id: newId, ideaId: parentIdea.id, text: inputText }]);
        // Place new support sticker offset from parent
        setPositions(prev => ({
          ...prev,
          [newId]: {
            x: positions[parentIdea.id].x + (Math.random() * 80 - 40),
            y: positions[parentIdea.id].y + 120
          }
        }));
      }
    } else {
      // Add new idea
      const newId = 'i' + Date.now();
      const nextLetter = String.fromCharCode(65 + ideas.length);
      setIdeas(prev => [...prev, {
        id: newId,
        label: `Gagasan ${nextLetter}`,
        text: inputText,
        color: 'var(--tertiary)'
      }]);
      // Place near canvas center view
      setPositions(prev => ({
        ...prev,
        [newId]: { x: 150 + Math.random() * 60, y: 150 + Math.random() * 60 }
      }));
    }

    setInputText('');
    setReplyingTo(null);
  };

  // Merge handler
  const handleMerge = (sourceId: string, targetId: string) => {
    const sourceIdea = ideas.find(i => i.id === sourceId);
    const targetIdea = ideas.find(i => i.id === targetId);
    if (!sourceIdea || !targetIdea) return;

    // 1. Combine texts of ideas
    setIdeas(prev => prev.map(i => {
      if (i.id === targetId) {
        return {
          ...i,
          text: `${i.text} & ${sourceIdea.text}`
        };
      }
      return i;
    }).filter(i => i.id !== sourceId));

    // 2. Re-route parent ideas of supports
    setSupports(prev => prev.map(s => {
      if (s.ideaId === sourceId) {
        return { ...s, ideaId: targetId };
      }
      return s;
    }));

    // 3. Clean up modal state
    setMergeModal({ isOpen: false, sourceId: null });
  };

  // Delete handlers (GM mode only)
  const handleDeleteIdea = (id: string) => {
    setIdeas(prev => prev.filter(i => i.id !== id));
    setSupports(prev => prev.filter(s => s.ideaId !== id));
  };

  const handleDeleteSupport = (id: string) => {
    setSupports(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <h2 className="text-h1" style={{ marginBottom: '4px', letterSpacing: '-0.5px' }}>Demo Kanvas 2D</h2>
          <p className="text-body" style={{ fontSize: '13px', lineHeight: 1.4, color: 'var(--outline)' }}>Tarik stiker, klik gagasan untuk merge ⇿, atau aktifkan mode GM untuk hapus ×.</p>
        </div>
        
        {/* GM Mode Toggle Button */}
        <button 
          onClick={() => setIsGMMode(!isGMMode)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '100px',
            border: isGMMode ? '1.5px solid #ff4d4d' : '1px solid rgba(223,192,180,0.4)',
            backgroundColor: isGMMode ? 'rgba(255, 77, 77, 0.12)' : 'white',
            color: isGMMode ? '#e60000' : 'var(--outline)',
            fontWeight: '800', fontSize: '12px', cursor: 'pointer', transition: 'all 0.25s',
            boxShadow: isGMMode ? '0 4px 10px rgba(255,77,77,0.15)' : 'none'
          }}
        >
          <span>👑</span>
          <span>{isGMMode ? 'GM View Active' : 'GM View'}</span>
        </button>
      </div>

      {/* Merge Glassmorphism Modal */}
      {mergeModal.isOpen && mergeModal.sourceId && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1000,
          backgroundColor: 'rgba(15, 12, 26, 0.4)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '24px', padding: '24px',
            boxShadow: '0 24px 60px rgba(107, 56, 212, 0.16)', border: '1px solid rgba(107, 56, 212, 0.08)',
            width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '14px'
          }}>
            <div style={{ fontSize: '32px', textAlign: 'center' }}>🔀</div>
            <h4 style={{ fontWeight: '900', fontSize: '18px', textAlign: 'center', color: 'var(--on-surface)', letterSpacing: '-0.3px' }}>Gabungkan Gagasan</h4>
            <p style={{ fontSize: '13px', color: 'var(--outline)', textAlign: 'center', lineHeight: 1.5 }}>
              Pilih gagasan target untuk menggabungkan ide:<br />
              <strong style={{ color: 'var(--action-orange)', display: 'block', margin: '6px 0', fontSize: '13.5px', fontWeight: '800' }}>
                "{ideas.find(i => i.id === mergeModal.sourceId)?.text}"
              </strong>
              Semua pendapat rekan yang menempel akan otomatis dipindahkan.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto', padding: '4px 0', scrollbarWidth: 'none' }}>
              {ideas.filter(i => i.id !== mergeModal.sourceId).map(target => (
                <button
                  key={target.id}
                  onClick={() => handleMerge(mergeModal.sourceId!, target.id)}
                  style={{
                    padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(107,56,212,0.15)',
                    backgroundColor: 'rgba(107,56,212,0.03)', color: 'var(--on-surface)', fontSize: '13px',
                    fontWeight: '800', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(107,56,212,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(107,56,212,0.03)')}
                >
                  🎯 {target.label}: {target.text.length > 30 ? target.text.slice(0, 30) + '...' : target.text}
                </button>
              ))}
              {ideas.filter(i => i.id !== mergeModal.sourceId).length === 0 && (
                <div style={{ fontSize: '12px', color: 'var(--outline)', textAlign: 'center', padding: '12px' }}>
                  Tidak ada gagasan lain yang tersedia untuk digabungkan.
                </div>
              )}
            </div>
            <button
              onClick={() => setMergeModal({ isOpen: false, sourceId: null })}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '100px', border: '1px solid rgba(0,0,0,0.08)',
                backgroundColor: 'rgba(0,0,0,0.02)', color: 'var(--outline)', fontSize: '13px', fontWeight: '800',
                cursor: 'pointer', transition: 'all 0.2s', marginTop: '6px'
              }}
            >
              Batal
            </button>
          </div>
        </div>
      )}
      
      {/* Canvas Area */}
      <div 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ flex: 1, backgroundColor: 'var(--surface-container-lowest)', borderRadius: '16px', border: '1px solid rgba(223, 192, 180, 0.4)', position: 'relative', overflow: 'hidden', cursor: isPanning ? 'grabbing' : 'grab', touchAction: 'none' }}
      >
        <div style={{ position: 'absolute', inset: 0, transform: `translate(${pan.x}px, ${pan.y}px)`, width: '2000px', height: '2000px' }}>
          {/* Dynamic Connected Lines */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {supports.map(s => {
              const idea = ideas.find(i => i.id === s.ideaId);
              if (!idea) return null;
              const posI = positions[idea.id];
              const posS = positions[s.id];
              if (!posI || !posS) return null;
              return (
                <line 
                  key={s.id}
                  x1={posI.x + 75} 
                  y1={posI.y + 35} 
                  x2={posS.x + 50} 
                  y2={posS.y + 18} 
                  stroke={idea.color === 'var(--action-orange)' ? 'rgba(255, 122, 61, 0.25)' : 'rgba(107, 56, 212, 0.15)'} 
                  strokeWidth="2.2" 
                  strokeDasharray="5,5" 
                />
              );
            })}
          </svg>
        
          {/* Render Ideas Dynamically */}
          {ideas.map(idea => {
            const pos = positions[idea.id];
            if (!pos) return null;
            const isSelected = replyingTo === idea.text;
            return (
              <div 
                key={idea.id}
                onPointerDown={(e) => handleItemPointerDown(e, idea.id, idea.text)}
                onPointerMove={handleItemPointerMove}
                onPointerUp={handleItemPointerUp}
                onPointerCancel={handleItemPointerUp}
                style={{ 
                  position: 'absolute', 
                  left: pos.x, 
                  top: pos.y, 
                  width: '150px', 
                  padding: '12px 10px', 
                  backgroundColor: 'white', 
                  borderRadius: '16px', 
                  border: isSelected ? `2px solid ${idea.color}` : '1.5px solid var(--outline-variant)', 
                  boxShadow: draggingId === idea.id ? '0 12px 24px rgba(0,0,0,0.1)' : '0 3px 10px rgba(0,0,0,0.03)', 
                  cursor: draggingId === idea.id ? 'grabbing' : 'grab', 
                  touchAction: 'none', 
                  zIndex: draggingId === idea.id ? 100 : 1 
                }}
              >
                {/* GM Delete Button */}
                {isGMMode && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteIdea(idea.id); }}
                    style={{ position: 'absolute', top: '-8px', right: '-8px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#ff4d4d', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', zIndex: 10 }}
                  >
                    ×
                  </button>
                )}

                {/* Merge Action Button */}
                <button 
                  onClick={(e) => { e.stopPropagation(); setMergeModal({ isOpen: true, sourceId: idea.id }); }}
                  style={{ position: 'absolute', bottom: '-8px', right: '-8px', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--secondary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', zIndex: 10 }}
                  title="Gabungkan dengan gagasan lain"
                >
                  ⇿
                </button>

                <div style={{ fontWeight: '800', fontSize: '11px', color: idea.color, marginBottom: '4px', pointerEvents: 'none' }}>{idea.label}</div>
                <div style={{ fontSize: '13px', fontWeight: '800', pointerEvents: 'none', lineHeight: 1.3 }}>{idea.text}</div>
              </div>
            );
          })}

          {/* Render Supports Dynamically */}
          {supports.map(support => {
            const pos = positions[support.id];
            if (!pos) return null;
            return (
              <div 
                key={support.id}
                onPointerDown={(e) => handleItemPointerDown(e, support.id)}
                onPointerMove={handleItemPointerMove}
                onPointerUp={handleItemPointerUp}
                onPointerCancel={handleItemPointerUp}
                style={{ 
                  position: 'absolute', 
                  left: pos.x, 
                  top: pos.y, 
                  padding: '8px 12px', 
                  backgroundColor: 'var(--surface-container-high)', 
                  borderRadius: '10px', 
                  border: '1px solid var(--outline-variant)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px', 
                  cursor: draggingId === support.id ? 'grabbing' : 'grab', 
                  touchAction: 'none', 
                  zIndex: draggingId === support.id ? 100 : 1, 
                  boxShadow: draggingId === support.id ? '0 8px 16px rgba(0,0,0,0.1)' : 'none' 
                }}
              >
                {/* GM Delete Button */}
                {isGMMode && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteSupport(support.id); }}
                    style={{ position: 'absolute', top: '-6px', right: '-6px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#ff4d4d', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', zIndex: 10 }}
                  >
                    ×
                  </button>
                )}

                <div style={{ color: 'var(--outline)', pointerEvents: 'none', display: 'flex' }}><Icons.BubbleChart /></div>
                <span style={{ fontSize: '11px', fontStyle: 'italic', fontWeight: '700', pointerEvents: 'none' }}>{support.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Input Area (Always Present) */}
      <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', backgroundColor: 'white', borderRadius: '24px', padding: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid rgba(223,192,180,0.4)', zIndex: 10 }}>
        
        {/* Reply Context - Only shows when replyingTo is not null */}
        {replyingTo && (
          <div style={{ backgroundColor: 'rgba(107,56,212,0.08)', borderRadius: '100px', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--on-surface-variant)' }}>
              <span style={{ color: 'var(--secondary)' }}>↩</span>
              <span>Membalas: <strong style={{ color: 'var(--on-surface)' }}>{replyingTo.length > 20 ? replyingTo.slice(0, 20) + '...' : replyingTo}</strong></span>
            </div>
            <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', fontSize: '16px', color: 'var(--outline)', cursor: 'pointer' }}>✕</button>
          </div>
        )}

        {/* Input Field */}
        <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${replyingTo ? 'rgba(255,122,61,0.4)' : 'rgba(223,192,180,0.4)'}`, borderRadius: '100px', padding: '4px 4px 4px 16px', backgroundColor: 'var(--surface-container-lowest)' }}>
          <input 
            type="text" 
            placeholder={replyingTo ? "Tambahkan tanggapan pendukung..." : "Tulis gagasan baru Anda di sini..."} 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14.5px', background: 'transparent', fontWeight: '600' }} 
          />
          <button onClick={handleSend} style={{ backgroundColor: replyingTo ? 'var(--action-orange)' : 'var(--secondary)', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background-color 0.3s' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
