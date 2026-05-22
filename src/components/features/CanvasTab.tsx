"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../ui/Icons';
import { useAppSelector, useAppDispatch } from '@/application/hooks';
import { SupabaseCanvasRepository } from '@/infrastructure/repositories/SupabaseCanvasRepository';
import { selectCurrentRoom } from '@/application/store/slices/roomSlice';
import { setGMLoggedIn } from '@/application/store/slices/uiSlice';

interface Idea {
  id: string;
  label: string;
  text: string;
  color: string;
  metadata?: any;
}

interface Support {
  id: string;
  ideaId: string;
  text: string;
  metadata?: any;
}

interface CanvasTabProps {
  roomId?: string;
  myParticipantId?: string | null;
  roomStatus?: string;
  isActive?: boolean;
}

export default function CanvasTab({ roomId: propRoomId, myParticipantId, roomStatus, isActive }: CanvasTabProps) {
  const reduxRoom = useAppSelector(selectCurrentRoom);
  const roomId = propRoomId || reduxRoom?.id;

  const isGMLoggedIn = useAppSelector((state) => state.ui.isGMLoggedIn);
  const dispatch = useAppDispatch();

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const startPan = useRef({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const initialItemPos = useRef({ x: 0, y: 0 });
  const hasAutoScrolled = useRef(false);

  // States for pinch-to-zoom and temporary zoom percentage indicator
  const [showZoomIndicator, setShowZoomIndicator] = useState(false);
  const zoomTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activePointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const initialPinchDist = useRef<number | null>(null);
  const initialScale = useRef<number>(1);

  // Trigger floating zoom percentage indicator when scale changes
  useEffect(() => {
    setShowZoomIndicator(true);
    if (zoomTimeoutRef.current) {
      clearTimeout(zoomTimeoutRef.current);
    }
    zoomTimeoutRef.current = setTimeout(() => {
      setShowZoomIndicator(false);
    }, 1200);
    return () => {
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
      }
    };
  }, [scale]);

  // Game Master (GM) is active when logged in
  const effectiveGMMode = isGMLoggedIn;

  // Inline Editing state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState('');

  // Selected whiteboard sticker state
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Merge modal state
  const [mergeModal, setMergeModal] = useState<{ isOpen: boolean; sourceId: string | null }>({
    isOpen: false,
    sourceId: null
  });

  // Dynamic ideas state
  const [ideas, setIdeas] = useState<Idea[]>([]);

  // Dynamic supports state
  const [supports, setSupports] = useState<Support[]>([]);

  // Dynamic positions for dragging
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  
  // States for smooth dragging of items
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const draggingIdRef = useRef<string | null>(null);
  const itemDragOffset = useRef({ x: 0, y: 0 });

  const repo = useRef(new SupabaseCanvasRepository());

  // Non-passive wheel listener for Canvas zooming (supports trackpad pinch)
  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey) {
        // Trackpad pinch gesture (multiplicative zoom)
        const zoomFactor = 1.03;
        const factor = e.deltaY < 0 ? zoomFactor : 1 / zoomFactor;
        setScale(prev => {
          const newScale = Math.min(Math.max(prev * factor, 0.4), 2.0);
          return Math.round(newScale * 100) / 100;
        });
      } else {
        // Regular mouse wheel (additive zoom)
        const zoomIntensity = 0.05;
        const delta = e.deltaY < 0 ? 1 : -1;
        setScale(prev => {
          const newScale = Math.min(Math.max(prev + delta * zoomIntensity, 0.4), 2.0);
          return Math.round(newScale * 100) / 100;
        });
      }
    };

    canvasEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvasEl.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Smooth scroll down to trial area on start scrolling
  useEffect(() => {
    if (roomId || !isActive) return;

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      const scrollTop = target.scrollTop;

      if (scrollTop > 15 && !hasAutoScrolled.current) {
        hasAutoScrolled.current = true;
        target.scrollTo({
          top: target.scrollHeight,
          behavior: 'smooth'
        });
      } else if (scrollTop === 0) {
        hasAutoScrolled.current = false;
      }
    };

    const scrollParent = document.querySelector('.app-content');
    if (scrollParent) {
      scrollParent.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (scrollParent) {
        scrollParent.removeEventListener('scroll', handleScroll);
      }
    };
  }, [roomId, isActive]);

  const syncCanvasItems = React.useCallback((items: any[]) => {
    const newIdeas: Idea[] = [];
    const newSupports: Support[] = [];
    const newPositions: Record<string, { x: number; y: number }> = {};

    items.forEach(item => {
      if (item.type === 'idea') {
        newIdeas.push({
          id: item.id,
          label: item.metadata?.label || `Pendapat`,
          text: item.content,
          color: item.color || 'var(--action-orange)',
          metadata: item.metadata || {}
        });
      } else {
        newSupports.push({
          id: item.id,
          ideaId: item.parentId || '',
          text: item.content,
          metadata: item.metadata || {}
        });
      }
      newPositions[item.id] = { x: item.xPos, y: item.yPos };
    });

    setIdeas(newIdeas);
    setSupports(newSupports);
    setPositions(prev => {
      const merged = { ...prev };
      Object.keys(newPositions).forEach(id => {
        if (id !== draggingIdRef.current) {
          merged[id] = newPositions[id];
        }
      });
      return merged;
    });
  }, []);

  useEffect(() => {
    if (!roomId) {
      // Pre-populate with trial guide stickers
      const initialIdeas = [
        {
          id: 'idea-1',
          label: 'Ide Utama',
          text: '💡 Ini adalah Kanvas Uji Coba. Coba seret stiker ini!',
          color: '#8B5CF6'
        },
        {
          id: 'idea-2',
          label: 'Gagasan',
          text: '⚡ Tulis pendapat baru Anda pada kolom di bawah.',
          color: 'var(--action-orange)'
        }
      ];

      const initialSupports = [
        {
          id: 'support-1',
          ideaId: 'idea-1',
          text: '📌 Klik stiker pendapat lalu ketik di kolom bawah untuk membalas'
        },
        {
          id: 'support-2',
          ideaId: 'idea-1',
          text: '✏️ Klik ikon pensil untuk mengubah isi teks stiker'
        },
        {
          id: 'support-3',
          ideaId: 'idea-2',
          text: '⇿ Klik tombol merger di stiker (jika GM) untuk menggabungkan ide'
        }
      ];

      const initialPositions = {
        'idea-1': { x: 120, y: 50 },
        'idea-2': { x: 550, y: 80 },
        'support-1': { x: 80, y: 220 },
        'support-2': { x: 280, y: 260 },
        'support-3': { x: 500, y: 220 }
      };

      setIdeas(initialIdeas);
      setSupports(initialSupports);
      setPositions(initialPositions);
      return;
    }

    const loadCanvas = async () => {
      try {
        const items = await repo.current.getItems(roomId);
        syncCanvasItems(items);
      } catch (err) {
        console.error("Failed to load canvas items:", err);
      }
    };

    loadCanvas();

    const unsubscribe = repo.current.subscribeToCanvas(roomId, (items) => {
      syncCanvasItems(items);
    });

    return () => unsubscribe();
  }, [roomId, syncCanvasItems]);



  // Panning handlers (Background & Touch Pinch-to-Zoom)
  const handlePointerDown = (e: React.PointerEvent) => {
    // Register the pointer
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // If there are exactly two active pointer touches, initialize pinch scale zoom
    if (activePointers.current.size === 2) {
      setIsPanning(false);
      const pts = Array.from(activePointers.current.values());
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      initialPinchDist.current = Math.sqrt(dx * dx + dy * dy);
      initialScale.current = scale;
      return;
    }

    if ((e.target as HTMLElement).tagName !== 'DIV' && (e.target as HTMLElement).tagName !== 'svg') return;
    setIsPanning(true);
    setReplyingTo(null); // Dismiss reply state if clicking background
    setSelectedItemId(null); // Deselect active sticker
    startPan.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // Update active pointer coordinate
    if (activePointers.current.has(e.pointerId)) {
      activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    // Handle touch pinch zoom if we have two pointers active
    if (activePointers.current.size === 2 && initialPinchDist.current !== null) {
      const pts = Array.from(activePointers.current.values());
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        const factor = dist / initialPinchDist.current;
        setScale(prev => {
          const newScale = Math.min(Math.max(initialScale.current * factor, 0.4), 2.0);
          return Math.round(newScale * 100) / 100;
        });
      }
      return;
    }

    if (!isPanning) return;
    setPan({ x: e.clientX - startPan.current.x, y: e.clientY - startPan.current.y });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    activePointers.current.delete(e.pointerId);
    if (activePointers.current.size < 2) {
      initialPinchDist.current = null;
    }

    // Safety fallback: if no pointers are left active, reset pinch distance
    if (activePointers.current.size === 0) {
      initialPinchDist.current = null;
    }

    setIsPanning(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_err) {}
  };

  // Item dragging handlers (Smooth Movement)
  const handleItemPointerDown = (e: React.PointerEvent, id: string, text?: string) => {
    e.stopPropagation();
    setSelectedItemId(id); // Select active sticker
    if (roomStatus === 'finished') {
      return;
    }
    if (text) setReplyingTo(text);
    
    setDraggingId(id);
    draggingIdRef.current = id;
    const pos = positions[id] || { x: 100, y: 100 };
    itemDragOffset.current = { x: e.clientX, y: e.clientY };
    initialItemPos.current = { ...pos };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleItemPointerMove = (e: React.PointerEvent) => {
    if (!draggingId) return;
    e.stopPropagation();
    const dx = (e.clientX - itemDragOffset.current.x) / scale;
    const dy = (e.clientY - itemDragOffset.current.y) / scale;
    setPositions(prev => ({
      ...prev,
      [draggingId]: {
        x: initialItemPos.current.x + dx,
        y: initialItemPos.current.y + dy
      }
    }));
  };

  const handleItemPointerUp = (e: React.PointerEvent) => {
    if (!draggingId) return;
    e.stopPropagation();
    setDraggingId(null);
    draggingIdRef.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    if (roomId) {
      const pos = positions[draggingId];
      if (pos) {
        repo.current.updateItemPos(draggingId, pos.x, pos.y).catch(console.error);
      }
    }
  };

  // Add new idea or support from input
  const handleSend = async () => {
    if (!inputText.trim()) return;

    if (replyingTo) {
      // Find parent idea
      const parentIdea = ideas.find(i => i.text === replyingTo);
      if (parentIdea) {
        const x = positions[parentIdea.id].x + (Math.random() * 80 - 40);
        const y = positions[parentIdea.id].y + 120;

        if (roomId) {
          await repo.current.saveItem({
            roomId,
            type: 'support',
            parentId: parentIdea.id,
            content: inputText,
            xPos: x,
            yPos: y,
            metadata: { creatorId: myParticipantId }
          }).catch(console.error);
        } else {
          const newId = 's' + Date.now();
          setSupports(prev => [...prev, { id: newId, ideaId: parentIdea.id, text: inputText, metadata: { creatorId: myParticipantId } }]);
          setPositions(prev => ({ ...prev, [newId]: { x, y } }));
        }
      }
    } else {
      const x = 150 + Math.random() * 60;
      const y = 150 + Math.random() * 60;

      if (roomId) {
        await repo.current.saveItem({
          roomId,
          type: 'idea',
          content: inputText,
          color: 'var(--action-orange)',
          xPos: x,
          yPos: y,
          metadata: { label: `Pendapat`, creatorId: myParticipantId }
        }).catch(console.error);
      } else {
        const newId = 'i' + Date.now();
        setIdeas(prev => [...prev, {
          id: newId,
          label: `Pendapat`,
          text: inputText,
          color: 'var(--action-orange)',
          metadata: { creatorId: myParticipantId }
        }]);
        setPositions(prev => ({ ...prev, [newId]: { x, y } }));
      }
    }

    setInputText('');
    setReplyingTo(null);
  };

  // Merge handler
  const handleMerge = async (sourceId: string, targetId: string) => {
    const sourceIdea = ideas.find(i => i.id === sourceId);
    const targetIdea = ideas.find(i => i.id === targetId);
    if (!sourceIdea || !targetIdea) return;

    if (roomId) {
      try {
        const combinedText = `${targetIdea.text} & ${sourceIdea.text}`;
        await repo.current.updateItemContent(targetId, combinedText);

        const sourceSupports = supports.filter(s => s.ideaId === sourceId);
        await Promise.all(sourceSupports.map(s => repo.current.updateItemParent(s.id, targetId)));

        await repo.current.deleteItem(sourceId);
      } catch (err) {
        console.error("Failed to merge ideas in DB:", err);
      }
    } else {
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
    }

    // 3. Clean up modal state
    setMergeModal({ isOpen: false, sourceId: null });
  };

  // Delete handlers (GM mode only)
  const handleDeleteIdea = async (id: string) => {
    if (roomId) {
      await repo.current.deleteItem(id).catch(console.error);
    } else {
      setIdeas(prev => prev.filter(i => i.id !== id));
      setSupports(prev => prev.filter(s => s.ideaId !== id));
    }
  };

  const handleDeleteSupport = async (id: string) => {
    if (roomId) {
      await repo.current.deleteItem(id).catch(console.error);
    } else {
      setSupports(prev => prev.filter(s => s.id !== id));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: roomId ? '100%' : 'auto', position: 'relative', paddingBottom: roomId ? '100px' : '0px', gap: '16px' }}>
      
      {!roomId && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '32px',
          padding: '32px 24px',
          border: '1px solid rgba(223, 192, 180, 0.4)',
          boxShadow: '0 16px 48px rgba(107, 56, 212, 0.05)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Glassmorphism Blur Highlight */}
          <div style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            backgroundColor: 'rgba(139, 92, 246, 0.08)',
            filter: 'blur(24px)',
            pointerEvents: 'none'
          }} />

          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💡</div>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: '900',
            fontSize: '22px',
            color: '#131b2e',
            marginBottom: '8px',
            letterSpacing: '-0.5px'
          }}>Kanvas Curah Pendapat 2D Interaktif</h2>
          <p style={{
            fontSize: '13.5px',
            color: '#584239',
            lineHeight: 1.5,
            marginBottom: '24px'
          }}>
            Tuliskan ide liar Anda pada lembaran stiker digital, atur letaknya, hubungkan ide yang berdekatan secara organik, dan gabungkan ide sejenis secara instan dengan rekan tim lainnya secara real-time!
          </p>

          {/* Premium Bullet Points for Marketing */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            textAlign: 'left',
            marginBottom: '28px',
            backgroundColor: '#faf8ff',
            borderRadius: '20px',
            padding: '20px',
            border: '1.5px solid rgba(139, 92, 246, 0.06)'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '18px' }}>🎨</span>
              <div>
                <strong style={{ fontSize: '13px', color: '#131b2e', fontFamily: 'Lexend, sans-serif' }}>Kanvas 2D Bebas Hambatan</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#584239', lineHeight: 1.4 }}>Gunakan gerakan drag, pan, dan zoom untuk mengelompokkan ide pendukung di bawah ide utama dengan visualisasi garis putus-putus otomatis.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '18px' }}>⚡</span>
              <div>
                <strong style={{ fontSize: '13px', color: '#131b2e', fontFamily: 'Lexend, sans-serif' }}>Penggabungan Ide (Merge) Pintar</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#584239', lineHeight: 1.4 }}>Klik tombol merger ⇿ untuk menggabungkan dua gagasan serupa. Rapa secara cerdas memindahkan seluruh stiker pendukung ke target baru.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '18px' }}>👥</span>
              <div>
                <strong style={{ fontSize: '13px', color: '#131b2e', fontFamily: 'Lexend, sans-serif' }}>Kolaborasi Supabase Real-time</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#584239', lineHeight: 1.4 }}>Sinkronisasi koordinat stiker instan dengan perlindungan drag anti-snap khusus demi pengalaman kolaborasi interaktif tanpa hambatan.</p>
              </div>
            </div>
          </div>

          {/* Upgrade banner CTA */}
          <div style={{
            backgroundColor: 'rgba(255, 122, 61, 0.04)',
            border: '1.5px solid rgba(255, 122, 61, 0.15)',
            borderRadius: '20px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <span style={{
              fontSize: '13px',
              fontWeight: '800',
              color: '#FF7A3D',
              fontFamily: 'Lexend, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>🚀 Rancang Alur Rapat Curah Pendapat Anda</span>
            <p style={{ margin: 0, fontSize: '12px', color: '#584239', lineHeight: 1.4 }}>
              Masuk sebagai Game Master (GM) untuk membuat rapat baru Anda sendiri, mengundang rekan tim, dan membuka akses kanvas 2D kolaboratif sepenuhnya.
            </p>
            {!isGMLoggedIn && (
              <button
                onClick={() => dispatch(setGMLoggedIn(true))}
                className="btn-purple"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  border: 'none',
                  fontWeight: '800',
                  fontSize: '13.5px',
                  fontFamily: 'Lexend, sans-serif',
                  cursor: 'pointer',
                  backgroundColor: '#8B5CF6',
                  color: 'white',
                  boxShadow: '0 4px 14px rgba(139, 92, 246, 0.2)',
                  transition: 'all 0.2s'
                }}
              >
                Aktifkan Portal Game Master
              </button>
            )}
          </div>

          {/* Style tag for animations */}
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes bounce {
              0%, 20%, 50%, 80%, 100% {
                transform: translateY(0);
              }
              40% {
                transform: translateY(-8px);
              }
              60% {
                transform: translateY(-4px);
              }
            }
          `}} />



          {/* Scroll Down Indicator with Animation */}
          <div 
            onClick={() => {
              const scrollParent = document.querySelector('.app-content');
              if (scrollParent) {
                scrollParent.scrollTo({
                  top: scrollParent.scrollHeight,
                  behavior: 'smooth'
                });
              }
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '24px',
              cursor: 'pointer',
              opacity: 0.85,
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.85'}
          >
            <span style={{
              fontSize: '11px',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#FF7A3D',
              marginBottom: '6px',
              fontFamily: 'Lexend, sans-serif'
            }}>
              Scroll kebawah untuk uji coba
            </span>
            <div style={{
              width: '20px',
              height: '32px',
              borderRadius: '10px',
              border: '2px solid #FF7A3D',
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              animation: 'bounce 2s infinite'
            }}>
              <div style={{
                width: '4px',
                height: '8px',
                borderRadius: '2px',
                backgroundColor: '#FF7A3D',
                position: 'absolute',
                top: '6px'
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Header Row / Target for Scroll */}
      <div id="uji-coba-kanvas-area" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 className="text-h1" style={{ marginBottom: '4px', letterSpacing: '-0.5px' }}>
              {!roomId ? 'Uji Coba Kanvas Curah Pendapat' : (reduxRoom?.title || 'Rapat Curah Pendapat')}
            </h2>
            {!roomId && (
              <span style={{
                backgroundColor: '#FF7A3D',
                color: 'white',
                fontSize: '10px',
                fontWeight: '800',
                padding: '2px 8px',
                borderRadius: '100px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Mode Uji Coba
              </span>
            )}
          </div>
          <p className="text-body" style={{ fontSize: '13px', lineHeight: 1.4, color: 'var(--outline)' }}>
            {!roomId ? 'Ini adalah kanvas demo interaktif lokal. Data tidak disimpan ke database.' : 'Tarik stiker ke pendapat untuk memberikan tanggapan pendukung.'}
          </p>
        </div>
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
                {'"'} {ideas.find(i => i.id === mergeModal.sourceId)?.text} {'"'}
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
                  🎯 {target.text.length > 40 ? target.text.slice(0, 40) + '...' : target.text}
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
      
      {/* Relative Wrapper for Canvas and Input Area */}
      <div style={{
        position: 'relative',
        flex: roomId ? 1 : undefined,
        height: roomId ? undefined : 'calc(100vh - 160px)',
        minHeight: roomId ? undefined : '600px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '24px',
        border: '1.5px solid rgba(223, 192, 180, 0.5)',
        overflow: 'hidden'
      }}>
        {/* Canvas Area */}
        <div 
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{ flex: 1, backgroundColor: 'var(--surface-container-lowest)', position: 'relative', overflow: 'hidden', cursor: isPanning ? 'grabbing' : 'grab', touchAction: 'none', boxShadow: 'inset 0 4px 16px rgba(0, 0, 0, 0.02)' }}
        >
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, 
            transformOrigin: '0 0',
            width: '2000px', 
            height: '2000px' 
          }}>
            {/* Dynamic Connected Lines */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              {supports.map(s => {
                const idea = ideas.find(i => i.id === s.ideaId);
                if (!idea) return null;
                const posI = positions[idea.id];
                const posS = positions[s.id];
                if (!posI || !posS) return null;

                // Centers
                const icx = posI.x + 95;
                const icy = posI.y + 40;
                const scx = posS.x + 50;
                const scy = posS.y + 18;

                // Distance vector
                const dx = scx - icx;
                const dy = scy - icy;

                let x1 = icx;
                let y1 = icy;
                let x2 = scx;
                let y2 = scy;

                // Determine which border to attach to based on relative direction
                if (Math.abs(dx) / 95 > Math.abs(dy) / 40) {
                  // Left or Right sides are closer
                  if (dx > 0) {
                    // Support is to the right
                    x1 = posI.x + 190;
                    y1 = icy;
                    x2 = posS.x;
                    y2 = scy;
                  } else {
                    // Support is to the left
                    x1 = posI.x;
                    y1 = icy;
                    x2 = posS.x + 100;
                    y2 = scy;
                  }
                } else {
                  // Top or Bottom sides are closer
                  if (dy > 0) {
                    // Support is below
                    x1 = icx;
                    y1 = posI.y + 80;
                    x2 = scx;
                    y2 = posS.y;
                  } else {
                    // Support is above
                    x1 = icx;
                    y1 = posI.y;
                    x2 = scx;
                    y2 = posS.y + 36;
                  }
                }

                return (
                   <line 
                     key={s.id}
                     x1={x1} 
                     y1={y1} 
                     x2={x2} 
                     y2={y2} 
                     stroke={idea.color || 'var(--secondary)'} 
                     strokeOpacity="0.45"
                     strokeWidth="2.5" 
                     strokeDasharray="6,6" 
                   />
                );
              })}
            </svg>
          
            {/* Render Ideas Dynamically */}
            {ideas.map(idea => {
              const pos = positions[idea.id];
              if (!pos) return null;
              const isSelected = replyingTo === idea.text;
              const isMyIdea = idea.metadata?.creatorId === myParticipantId;
              const isEditing = editingItemId === idea.id;

              return (
                <div 
                  key={idea.id}
                  onPointerDown={(e) => {
                    if (isEditing) return; // Disable dragging when editing
                    handleItemPointerDown(e, idea.id, idea.text);
                  }}
                  onPointerMove={isEditing ? undefined : handleItemPointerMove}
                  onPointerUp={isEditing ? undefined : handleItemPointerUp}
                  onPointerCancel={isEditing ? undefined : handleItemPointerUp}
                  style={{ 
                    position: 'absolute', 
                    left: pos.x, 
                    top: pos.y, 
                    width: '190px', 
                    padding: '16px 12px 14px 12px', 
                    background: '#ffffff', 
                    borderRadius: '18px', 
                    borderTop: isEditing ? '1.5px solid var(--secondary)' : selectedItemId === idea.id ? '2.5px solid var(--anon-purple)' : isSelected ? `2.5px solid ${idea.color}` : '1px solid rgba(0, 0, 0, 0.04)',
                    borderLeft: isEditing ? '1.5px solid var(--secondary)' : selectedItemId === idea.id ? '2.5px solid var(--anon-purple)' : isSelected ? `2.5px solid ${idea.color}` : '1px solid rgba(0, 0, 0, 0.04)',
                    borderRight: isEditing ? '1.5px solid var(--secondary)' : selectedItemId === idea.id ? '2.5px solid var(--anon-purple)' : isSelected ? `2.5px solid ${idea.color}` : '1px solid rgba(0, 0, 0, 0.04)',
                    borderBottom: isEditing ? '1.5px solid var(--secondary)' : selectedItemId === idea.id ? '2.5px solid var(--anon-purple)' : isSelected ? `2.5px solid ${idea.color}` : '2px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: selectedItemId === idea.id ? '0 10px 25px rgba(139, 92, 246, 0.25)' : draggingId === idea.id ? `0 16px 36px ${idea.color}25` : isSelected ? `0 8px 24px ${idea.color}15` : '0 4px 16px rgba(0,0,0,0.03)', 
                    cursor: isEditing ? 'default' : draggingId === idea.id ? 'grabbing' : 'grab', 
                    touchAction: 'none', 
                    zIndex: isEditing || draggingId === idea.id ? 100 : 1,
                    transition: draggingId === idea.id ? 'none' : 'box-shadow 0.2s ease, border-color 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                  }}
                >
                  {/* GM Delete Button */}
                  {effectiveGMMode && selectedItemId === idea.id && !isEditing && roomStatus !== 'finished' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteIdea(idea.id); }}
                      style={{ position: 'absolute', top: '-8px', right: '-8px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#ff4d4d', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', zIndex: 10 }}
                    >
                      ×
                    </button>
                  )}

                  {/* Edit Button (Created by me or GM, and currently selected) */}
                  {(effectiveGMMode || isMyIdea) && selectedItemId === idea.id && !isEditing && roomStatus !== 'finished' && (
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setEditingItemId(idea.id); 
                        setEditingItemText(idea.text); 
                      }}
                      style={{ 
                        position: 'absolute', 
                        top: '-8px', 
                        left: '-8px', 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '50%', 
                        backgroundColor: '#FF7A3D', 
                        color: 'white', 
                        border: 'none', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '10px', 
                        cursor: 'pointer', 
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)', 
                        zIndex: 10 
                      }}
                      title="Ubah pendapat"
                    >
                      ✏️
                    </button>
                  )}

                  {/* Merge Action Button */}
                  {effectiveGMMode && selectedItemId === idea.id && !isEditing && roomStatus !== 'finished' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setMergeModal({ isOpen: true, sourceId: idea.id }); }}
                      style={{ position: 'absolute', bottom: '-8px', right: '-8px', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--secondary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', zIndex: 10 }}
                      title="Gabungkan dengan pendapat lain"
                    >
                      ⇿
                    </button>
                  )}
                  
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }} onPointerDown={(e) => e.stopPropagation()}>
                      <textarea
                        value={editingItemText}
                        onChange={(e) => setEditingItemText(e.target.value)}
                        style={{ 
                          width: '100%', 
                          minHeight: '50px', 
                          border: '1.5px solid var(--secondary)', 
                          borderRadius: '8px', 
                          padding: '6px', 
                          fontSize: '12px', 
                          fontFamily: 'Inter, sans-serif', 
                          resize: 'none', 
                          outline: 'none',
                          fontWeight: '600',
                          textAlign: 'center'
                        }}
                        autoFocus
                      />
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button
                           onClick={async (e) => {
                            e.stopPropagation();
                            if (!editingItemText.trim()) return;
                            if (roomId) {
                              await repo.current.updateItemContent(idea.id, editingItemText.trim()).catch(console.error);
                            } else {
                              setIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, text: editingItemText.trim() } : i));
                            }
                            setEditingItemId(null);
                          }}
                          style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: '#BEF264', border: 'none', fontSize: '10px', fontWeight: '800', color: '#293e00', cursor: 'pointer' }}
                        >
                          ✓ Simpan
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingItemId(null);
                          }}
                          style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: '#f1f5f9', border: 'none', fontSize: '10px', fontWeight: '800', color: '#584239', cursor: 'pointer' }}
                        >
                          ✕ Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ 
                        color: idea.color || 'var(--action-orange)', 
                        marginBottom: '8px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        opacity: 0.95
                      }}>
                        <Icons.Lightbulb />
                      </div>
                      <div style={{ 
                        fontSize: '13px', 
                        fontWeight: '800', 
                        pointerEvents: 'none', 
                        lineHeight: 1.3,
                        textAlign: 'center',
                        wordBreak: 'break-word',
                        width: '100%',
                        color: 'var(--on-surface)'
                      }}>
                        {idea.text}
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {/* Render Supports Dynamically */}
            {supports.map(support => {
              const pos = positions[support.id];
              if (!pos) return null;
              const isMySupport = support.metadata?.creatorId === myParticipantId;
              const isEditing = editingItemId === support.id;

              return (
                <div 
                  key={support.id}
                  onPointerDown={(e) => {
                    if (isEditing) return; // Disable dragging when editing
                    handleItemPointerDown(e, support.id);
                  }}
                  onPointerMove={isEditing ? undefined : handleItemPointerMove}
                  onPointerUp={isEditing ? undefined : handleItemPointerUp}
                  onPointerCancel={isEditing ? undefined : handleItemPointerUp}
                  style={{ 
                    position: 'absolute', 
                    left: pos.x, 
                    top: pos.y, 
                    padding: '8px 12px', 
                    backgroundColor: 'var(--surface-container-high)', 
                    borderRadius: '10px', 
                    border: isEditing ? '2px solid var(--secondary)' : selectedItemId === support.id ? '2px solid var(--anon-purple)' : '1px solid var(--outline-variant)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    cursor: isEditing ? 'default' : draggingId === support.id ? 'grabbing' : 'grab', 
                    touchAction: 'none', 
                    zIndex: isEditing || draggingId === support.id ? 100 : 1, 
                    boxShadow: selectedItemId === support.id ? '0 6px 16px rgba(139, 92, 246, 0.2)' : draggingId === support.id ? '0 8px 16px rgba(0,0,0,0.1)' : 'none' 
                  }}
                >
                  {/* GM Delete Button */}
                  {effectiveGMMode && selectedItemId === support.id && !isEditing && roomStatus !== 'finished' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteSupport(support.id); }}
                      style={{ position: 'absolute', top: '-6px', right: '-6px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#ff4d4d', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', zIndex: 10 }}
                    >
                      ×
                    </button>
                  )}

                  {/* Edit Button (Created by me or GM, and currently selected) */}
                  {(effectiveGMMode || isMySupport) && selectedItemId === support.id && !isEditing && roomStatus !== 'finished' && (
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setEditingItemId(support.id); 
                        setEditingItemText(support.text); 
                      }}
                      style={{ 
                        position: 'absolute', 
                        top: '-6px', 
                        left: '-6px', 
                        width: '16px', 
                        height: '16px', 
                        borderRadius: '50%', 
                        backgroundColor: '#FF7A3D', 
                        color: 'white', 
                        border: 'none', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '8px', 
                        cursor: 'pointer', 
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)', 
                        zIndex: 10 
                      }}
                      title="Ubah tanggapan"
                    >
                      ✏️
                    </button>
                  )}

                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} onPointerDown={(e) => e.stopPropagation()}>
                      <textarea
                        value={editingItemText}
                        onChange={(e) => setEditingItemText(e.target.value)}
                        style={{ 
                          width: '140px', 
                          minHeight: '40px', 
                          border: '1.5px solid var(--secondary)', 
                          borderRadius: '6px', 
                          padding: '4px', 
                          fontSize: '11px', 
                          fontFamily: 'Inter, sans-serif', 
                          resize: 'none', 
                          outline: 'none',
                          fontWeight: '600'
                        }}
                        autoFocus
                      />
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!editingItemText.trim()) return;
                            if (roomId) {
                              await repo.current.updateItemContent(support.id, editingItemText.trim()).catch(console.error);
                            } else {
                              setSupports(prev => prev.map(s => s.id === support.id ? { ...s, text: editingItemText.trim() } : s));
                            }
                            setEditingItemId(null);
                          }}
                          style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: '#BEF264', border: 'none', fontSize: '9px', fontWeight: '800', color: '#293e00', cursor: 'pointer' }}
                        >
                          ✓
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingItemId(null);
                          }}
                          style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: '#f1f5f9', border: 'none', fontSize: '9px', fontWeight: '800', color: '#584239', cursor: 'pointer' }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span style={{ fontSize: '11px', fontStyle: 'italic', fontWeight: '700', pointerEvents: 'none' }}>{support.text}</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Dynamic Zoom Indicator Badge */}
          <div style={{
            position: 'absolute',
            bottom: roomStatus !== 'finished' ? '92px' : '24px',
            left: '50%',
            transform: showZoomIndicator ? 'translateX(-50%) scale(1)' : 'translateX(-50%) scale(0.9)',
            backgroundColor: 'rgba(28, 28, 30, 0.85)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '8px 18px',
            color: 'white',
            fontSize: '13.5px',
            fontWeight: '800',
            fontFamily: 'Lexend, sans-serif',
            pointerEvents: 'none',
            opacity: showZoomIndicator ? 1 : 0,
            transition: 'opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 100,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>🔍 Zoom:</span>
            <span style={{ color: '#FF7A3D' }}>{Math.round(scale * 100)}%</span>
          </div>
        </div>

        {/* Floating Input Area (Always Present unless finished) */}
        {roomStatus !== 'finished' && (
          <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', backgroundColor: 'white', borderRadius: '24px', padding: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid rgba(223,192,180,0.4)', zIndex: 10 }}>
            
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
                placeholder={replyingTo ? "Tambahkan tanggapan pendukung..." : "Tulis pendapat baru Anda di sini..."} 
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
        )}
      </div>
    </div>
  );
}
