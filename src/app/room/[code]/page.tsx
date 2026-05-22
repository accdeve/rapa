"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SupabaseRoomRepository } from '@/infrastructure/repositories/SupabaseRoomRepository';
import { SupabaseCanvasRepository } from '@/infrastructure/repositories/SupabaseCanvasRepository';
import CanvasTab from '@/components/features/CanvasTab';
import type { Room } from '@/domain/models/Room';
import type { CanvasItem } from '@/domain/models/Canvas';
import { useAppSelector, useAppDispatch } from '@/application/hooks';
import { setCurrentRoom } from '@/application/store/slices/roomSlice';
import { setActiveTab } from '@/application/store/slices/uiSlice';
import { supabase } from '@/infrastructure/supabase/supabaseClient';
import { SupabaseParticipantRepository } from '@/infrastructure/repositories/SupabaseParticipantRepository';
import { LocalHistoryRepository } from '@/infrastructure/repositories/LocalHistoryRepository';
import type { RoomParticipant } from '@/domain/models/Room';

type SessionState = 'waiting' | 'input' | 'voting' | 'results';
type SessionType = 'direct_voting' | 'brainstorming';

interface VotingOption {
  id: string;
  text: string;
  votes: number;
  supports?: string[];
}

interface Question {
  id: string;
  text: string;
  options: VotingOption[];
  timer?: number;
}

const AVATAR_COLORS = [
  { blob: '#FFB088', accent: '#FF7A3D' },
  { blob: '#D5C2FF', accent: '#8B5CF6' },
  { blob: '#E2FD98', accent: '#BEF264' },
  { blob: '#A7F3D0', accent: '#06B6D4' },
  { blob: '#FEF08A', accent: '#FACC15' },
];

function getAvatarColorByIndex(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function AnonymousAvatar({ size = 60, showExpression = true, avatarIndex = 0, isGM = false }: { size?: number; showExpression?: boolean; avatarIndex?: number; isGM?: boolean }) {
  const color = isGM ? { blob: '#FACC15', accent: '#D97706' } : getAvatarColorByIndex(avatarIndex);
  const expressionOffset = 0;
  
  return (
    <div style={{ 
      position: 'relative', 
      display: 'inline-block',
      width: `${size}px`,
      height: `${size}px`,
    }}>
      {isGM && (
        <div style={{
          position: 'absolute',
          top: `-${size * 0.32}px`,
          left: '50%',
          transform: 'translateX(-50%) rotate(-5deg)',
          fontSize: `${size * 0.48}px`,
          zIndex: 15,
          filter: 'drop-shadow(0 2px 4px rgba(217, 119, 6, 0.4))'
        }}>
          👑
        </div>
      )}
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`} 
        fill="none"
        style={{
          borderRadius: '50%',
          boxShadow: isGM ? '0 0 14px rgba(250, 204, 21, 0.65), inset 0 0 8px rgba(255, 255, 255, 0.5)' : 'none',
          border: isGM ? '2px solid #FACC15' : 'none',
          boxSizing: 'border-box',
          display: 'block'
        }}
      >
        <ellipse cx={size / 2} cy={size / 2} rx={size * 0.42} ry={size * 0.4} fill={color.blob} />
        <circle cx={size * 0.38} cy={size * 0.42 + expressionOffset} r={size * 0.06} fill="#333" />
        <circle cx={size * 0.62} cy={size * 0.42 + expressionOffset} r={size * 0.06} fill="#333" />
        {showExpression && (
          <path 
            d={`M ${size * 0.35} ${size * 0.58} Q ${size * 0.5} ${size * 0.65} ${size * 0.65} ${size * 0.58}`} 
            stroke="#333" 
            strokeWidth="2" 
            strokeLinecap="round" 
            fill="none" 
          />
        )}
      </svg>
    </div>
  );
}

function AnonymousBlobs({ count = 5 }: { count?: number }) {
  const blobs = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
      const x = 20 + (i * 35) + ((i * 17) % 20 - 10);
      const y = 30 + ((i * 23) % 40 - 20);
      const delay = i * 0.3;
      return { x, y, color, delay };
    });
  }, [count]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '120px' }}>
      {blobs.map((blob, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${blob.x}%`,
            top: `${blob.y}%`,
            animation: `blobFloat 3s ease-in-out infinite`,
            animationDelay: `${blob.delay}s`,
          }}
        >
          <svg width="50" height="50" viewBox="0 0 60 60" fill="none">
            <ellipse cx="30" cy="30" rx="25" ry="23" fill={blob.color.blob} />
            <circle cx="22" cy="26" r="4" fill="#333" />
            <circle cx="38" cy="26" r="4" fill="#333" />
            <path d="M 20 36 Q 30 44 40 36" stroke="#333" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      ))}
    </div>
  );
}

export default function ParticipantSession() {
  const params = useParams();
  const code = params?.code as string;
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const isGMLoggedIn = useAppSelector((state) => state.ui.isGMLoggedIn);
  const activeTab = useAppSelector((state) => state.ui.activeTab);
  const [isStarting, setIsStarting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareImageModalOpen, setShareImageModalOpen] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState<string>('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionState, setSessionState] = useState<SessionState>('waiting');
  const [sessionType, setSessionType] = useState<SessionType>('direct_voting');
  
  // Real-time Collaborative States
  const [myParticipant, setMyParticipant] = useState<RoomParticipant | null>(null);
  const [participantsList, setParticipantsList] = useState<RoomParticipant[]>([]);
  
  const displayedParticipants = useMemo(() => {
    if (isGMLoggedIn && myParticipant) {
      return participantsList.filter(p => p.id !== myParticipant.id);
    }
    return participantsList;
  }, [participantsList, isGMLoggedIn, myParticipant]);

  const participantCount = displayedParticipants.length;
  
  const [dbQuestions, setDbQuestions] = useState<any[]>([]);
  const [dbVotes, setDbVotes] = useState<any[]>([]);
  
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [inputText, setInputText] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [winner, setWinner] = useState<VotingOption | null>(null);
  const [timer, setTimer] = useState(30);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const questions: Question[] = [
    {
      id: '1',
      text: 'Apa prioritas utama untuk Q4?',
      options: [
        { id: 'a', text: 'Peningkatan Fitur', votes: 12 },
        { id: 'b', text: 'Stabilitas Sistem', votes: 8 },
        { id: 'c', text: 'User Experience', votes: 15 },
      ],
      timer: 30,
    },
    {
      id: '2',
      text: 'Metode deployment mana yang preferir?',
      options: [
        { id: 'a', text: 'CI/CD Otomatis', votes: 18 },
        { id: 'b', text: 'Manual Review', votes: 5 },
      ],
      timer: 30,
    },
  ];

  const votingOptions = useMemo(() => {
    if (dbQuestions.length > 0) {
      const supports = canvasItems.filter(item => item.type === 'support');
      
      return dbQuestions.map((q, index) => {
        let label = 'Gagasan';
        let ideaId = '';
        if (q.group_name && q.group_name.includes('|||')) {
          const parts = q.group_name.split('|||');
          label = parts[0];
          ideaId = parts[1];
        } else {
          label = q.group_name || `Gagasan ${String.fromCharCode(65 + index)}`;
          const matchingIdea = canvasItems.find(item => item.type === 'idea' && item.content === q.content);
          if (matchingIdea) ideaId = matchingIdea.id;
        }
        
        const ideaSupports = supports
          .filter(s => s.parentId === ideaId)
          .map(s => s.content);
          
        const voteCount = dbVotes.filter(v => v.question_id === q.id).length;
          
        return {
          id: q.id,
          text: `${label}: ${q.content}`,
          votes: voteCount,
          supports: ideaSupports
        };
      });
    }

    if (canvasItems.length > 0) {
      const ideas = canvasItems.filter(item => item.type === 'idea');
      const supports = canvasItems.filter(item => item.type === 'support');
      
      return ideas.map((idea, index) => {
        const label = idea.metadata?.label || `Gagasan ${String.fromCharCode(65 + index)}`;
        const ideaSupports = supports
          .filter(s => s.parentId === idea.id)
          .map(s => s.content);
          
        return {
          id: idea.id,
          text: `${label}: ${idea.content}`,
          votes: 0,
          supports: ideaSupports
        };
      });
    }
    return questions[currentQuestionIndex]?.options || [];
  }, [dbQuestions, canvasItems, dbVotes, questions, currentQuestionIndex]);

  const collaborativeWinner = useMemo(() => {
    if (votingOptions.length === 0) return null;
    let maxOpt = votingOptions[0];
    for (const opt of votingOptions) {
      if (opt.votes > maxOpt.votes) {
        maxOpt = opt;
      }
    }
    if (maxOpt.votes === 0) {
      return winner || votingOptions[0];
    }
    return maxOpt;
  }, [votingOptions, winner]);
  
  // Synchronize bottom navigation active tab with the active room's current session state
  useEffect(() => {
    if (room?.status === 'finished') return;
    if (sessionState === 'input') {
      dispatch(setActiveTab(1)); // Brainstorm
    } else if (sessionState === 'voting') {
      dispatch(setActiveTab(2)); // Vote
    } else if (sessionState === 'waiting' || sessionState === 'results') {
      dispatch(setActiveTab(0)); // Rooms
    }
  }, [sessionState, room?.status, dispatch]);

  // Automatically switch participant's tab when questions are populated (voting started)
  useEffect(() => {
    if (room?.status === 'finished') return;
    if (room?.status === 'active' && room?.sessionType === 'brainstorming' && dbQuestions.length > 0) {
      setSessionState('voting');
      dispatch(setActiveTab(2)); // Vote
    }
  }, [dbQuestions, room?.status, room?.sessionType, dispatch]);

  // Keep current slide within bounds of voting options
  useEffect(() => {
    if (currentSlide >= votingOptions.length && votingOptions.length > 0) {
      setCurrentSlide(votingOptions.length - 1);
    }
  }, [votingOptions, currentSlide]);

  // Synchronize room updates to Game Master's local history (recentRoomsGM)
  useEffect(() => {
    if (room && isGMLoggedIn) {
      const localHistRepo = new LocalHistoryRepository();
      localHistRepo.saveOrUpdateGMRoom(room);
    }
  }, [room, isGMLoggedIn]);

  const handleStartSession = async () => {
    if (!room) return;
    setIsStarting(true);
    try {
      const roomRepo = new SupabaseRoomRepository();
      await roomRepo.update(room.id, { status: 'active' });
    } catch (err) {
      console.error("Gagal memulai sesi sebagai GM:", err);
      alert("Gagal memulai sesi. Silakan coba lagi.");
    } finally {
      setIsStarting(false);
    }
  };
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef(30);
  const selectedOptionRef = useRef<string | null>(null);
  const handleVoteSubmitRef = useRef<() => void>(() => {});

  const useEffectCanvasRef = useRef(false);

  // 1. Participant Identity and List Synchronization
  useEffect(() => {
    if (!room?.id) return;
    const partRepo = new SupabaseParticipantRepository();
    
    partRepo.findByRoom(room.id).then(setParticipantsList).catch(console.error);
    
    const unsubscribe = partRepo.subscribeToParticipants(room.id, (list) => {
      setParticipantsList(list);
    });
    
    return () => unsubscribe();
  }, [room?.id]);

  useEffect(() => {
    if (!room?.id || myParticipant) return;
    
    const registerParticipant = async () => {
      try {
        const partRepo = new SupabaseParticipantRepository();
        const localKey = `participant:${room.id}`;
        const existingId = localStorage.getItem(localKey);
        
        let participantObj: RoomParticipant | null = null;
        if (existingId) {
          const list = await partRepo.findByRoom(room.id);
          participantObj = list.find(p => p.id === existingId) || null;
        }
        
        if (!participantObj) {
          const newPart = await partRepo.add({
            roomId: room.id,
            avatarSeed: Math.random().toString(36).substring(7)
          });
          localStorage.setItem(localKey, newPart.id);
          participantObj = newPart;
        }
        
        setMyParticipant(participantObj);
      } catch (err) {
        console.error("Gagal mendaftarkan peserta:", err);
      }
    };
    
    registerParticipant();
  }, [room?.id, myParticipant]);

  // 2. Questions & Votes Synchronization
  useEffect(() => {
    if (!room?.id) return;
    
    const loadQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('room_id', room.id)
          .neq('status', 'archived')
          .order('created_at', { ascending: true });
        if (!error && data) {
          setDbQuestions(data);
          if (room.status === 'active' && room.sessionType === 'brainstorming' && data.length > 0) {
            setSessionState('voting');
          }
        }
      } catch (err) {
        console.error("Gagal meload pertanyaan:", err);
      }
    };
    
    loadQuestions();
    
    const uniqueId = Math.random().toString(36).substring(2, 10);
    const channel = supabase
      .channel(`questions:${room.id}:${uniqueId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'questions', filter: `room_id=eq.${room.id}` },
        () => {
          loadQuestions();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [room?.id, room?.status, room?.sessionType]);

  useEffect(() => {
    if (!room?.id) return;
    
    const loadVotes = async () => {
      try {
        if (dbQuestions.length === 0) return;
        const { data, error } = await supabase
          .from('votes')
          .select('*')
          .in('question_id', dbQuestions.map(q => q.id));
        if (!error && data) {
          setDbVotes(data);
        }
      } catch (err) {
        console.error("Gagal meload votes:", err);
      }
    };
    
    loadVotes();
    
    const uniqueId = Math.random().toString(36).substring(2, 10);
    const channel = supabase
      .channel(`votes:${room.id}:${uniqueId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        () => {
          loadVotes();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [room?.id, dbQuestions]);

  // 3. Canvas Items Synchronization
  useEffect(() => {
    if (!room?.id) return;
    const canvasRepo = new SupabaseCanvasRepository();
    
    const loadItems = async () => {
      try {
        const items = await canvasRepo.getItems(room.id);
        setCanvasItems(items);
      } catch (err) {
        console.error("Failed to load canvas items for voting:", err);
      }
    };
    
    loadItems();
    
    const unsubscribe = canvasRepo.subscribeToCanvas(room.id, (items) => {
      setCanvasItems(items);
    });
    
    return () => unsubscribe();
  }, [room?.id]);

  useEffect(() => {
    if (!code) return;
    const roomRepo = new SupabaseRoomRepository();
    
    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      try {
        const foundRoom = await roomRepo.findByCode(code);
        if (foundRoom) {
          setRoom(foundRoom);
          dispatch(setCurrentRoom(foundRoom));
          
          // Save active room code and title for easy re-entry / reconnecting
          localStorage.setItem('activeRoomCode', foundRoom.code);
          localStorage.setItem('activeRoomTitle', foundRoom.title);

          // Save to participant's recently joined rooms history
          const localHistRepo = new LocalHistoryRepository();
          localHistRepo.saveOrUpdateParticipantRoom(foundRoom);

          setSessionType(foundRoom.sessionType as SessionType);

          const { data: qData } = await supabase
            .from('questions')
            .select('id')
            .eq('room_id', foundRoom.id)
            .neq('status', 'archived');
          const qCount = qData?.length || 0;

          setSessionState(
            foundRoom.status === 'waiting' ? 'waiting' : 
            foundRoom.status === 'voting' ? 'voting' : 
            foundRoom.status === 'results' ? 'results' : 
            foundRoom.status === 'finished' ? 'results' : 
            (foundRoom.sessionType === 'direct_voting' ? 'voting' : (qCount > 0 ? 'voting' : 'input'))
          );

          unsubscribe = roomRepo.subscribeToRoom(foundRoom.id, async (updatedRoom) => {
            setRoom(updatedRoom);
            dispatch(setCurrentRoom(updatedRoom));
            setSessionType(updatedRoom.sessionType as SessionType);

            const { data: updatedQData } = await supabase
              .from('questions')
              .select('id')
              .eq('room_id', updatedRoom.id)
              .neq('status', 'archived');
            const updatedQCount = updatedQData?.length || 0;

            setSessionState(
              updatedRoom.status === 'waiting' ? 'waiting' : 
              updatedRoom.status === 'voting' ? 'voting' : 
              updatedRoom.status === 'results' ? 'results' : 
              updatedRoom.status === 'finished' ? 'results' : 
              (updatedRoom.sessionType === 'direct_voting' ? 'voting' : (updatedQCount > 0 ? 'voting' : 'input'))
            );
          });
        }
      } catch (err) {
        console.error("Failed to load room:", err);
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [code, dispatch]);

  const handleVoteSubmit = useCallback(async () => {
    if (room?.status === 'finished') return;
    let selected = selectedOptionRef.current;
    if (!selected) {
      if (votingOptions.length > 0) {
        const randomIdx = Math.floor(Math.random() * votingOptions.length);
        selected = votingOptions[randomIdx].id;
        setSelectedOption(selected);
      } else {
        return;
      }
    }
    
    try {
      const selectedOpt = votingOptions.find(o => o.id === selected);
      if (!selectedOpt) return;
      
      const pId = myParticipant?.id;
      if (!pId) return;
      
      // Prevent double voting in DB
      const { data: existingVote } = await supabase
        .from('votes')
        .select('*')
        .eq('participant_id', pId)
        .in('question_id', dbQuestions.map(q => q.id))
        .maybeSingle();
        
      if (!existingVote) {
        const newVote = {
          question_id: selected,
          participant_id: pId,
          target_id: selected
        };
        await supabase
          .from('votes')
          .insert(newVote);
        
        // Optimistically add vote locally so count increases immediately
        setDbVotes(prev => [...prev, newVote]);
      }
      
      setShowCelebration(true);
      setTimeout(() => {
        setWinner(selectedOpt);
        setSessionState('results');
        setShowCelebration(false);
      }, 2000);
    } catch (err) {
      console.error("Error submitting vote:", err);
    }
  }, [votingOptions, myParticipant, dbQuestions]);

  useEffect(() => {
    handleVoteSubmitRef.current = handleVoteSubmit;
  }, [handleVoteSubmit]);

  useEffect(() => {
    if (sessionState === 'voting' && timer > 0) {
      const interval = setInterval(() => {
        timerRef.current -= 1;
        setTimer(timerRef.current);
        if (timerRef.current <= 1) {
          clearInterval(interval);
          handleVoteSubmitRef.current();
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [sessionState, timer, currentQuestionIndex]);

  useEffect(() => {
    selectedOptionRef.current = selectedOption;
  }, [selectedOption]);

  const handleInputSubmit = () => {
    if (inputText.trim().length === 0) return;
    setHasSubmitted(true);
    setTimeout(() => {
      setSessionState('voting');
      timerRef.current = questions[currentQuestionIndex]?.timer || 30;
      setTimer(timerRef.current);
    }, 500);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasSubmitted(false);
      setWinner(null);
      setSessionState('input');
      setInputText('');
    }
  };

  const handleGenerateShareImage = () => {
    const canvas = document.createElement('canvas');
    const CARD_W = 800;
    canvas.width = CARD_W;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ── helpers ──────────────────────────────────────────────────────────────
    /** Wraps text within maxWidth, returns final Y */
    const wrapText = (
      c: CanvasRenderingContext2D,
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      lineHeight: number
    ): number => {
      const words = text.split(' ');
      let line = '';
      let curY = y;
      for (let i = 0; i < words.length; i++) {
        const test = line + words[i] + ' ';
        if (c.measureText(test).width > maxWidth && i > 0) {
          c.fillText(line.trimEnd(), x, curY);
          line = words[i] + ' ';
          curY += lineHeight;
        } else {
          line = test;
        }
      }
      c.fillText(line.trimEnd(), x, curY);
      return curY;
    };

    /** Draw a rounded rectangle path */
    const rr = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number | number[]) => {
      c.beginPath();
      c.roundRect(x, y, w, h, r as number);
    };

    // ── layout constants ──────────────────────────────────────────────────────
    const PAD    = 48;
    const INNER  = CARD_W - PAD * 2;   // 704px usable width
    const COL    = '#131b2e';
    const MUTED  = '#584239';
    const PURPLE = '#8B5CF6';
    const ORANGE = '#FF7A3D';
    const LIME   = '#BEF264';
    const LIME_D = '#293e00';

    // ── measure dynamic heights ───────────────────────────────────────────────
    const ideaText = collaborativeWinner
      ? (collaborativeWinner.text.split(': ').slice(1).join(': ') || collaborativeWinner.text)
      : 'Tidak ada gagasan';

    ctx.font = '800 20px sans-serif';
    let ideaLines = 0;
    {
      const words = `"${ideaText}"`.split(' ');
      let line = '';
      for (let i = 0; i < words.length; i++) {
        const test = line + words[i] + ' ';
        if (ctx.measureText(test).width > INNER - 32 && i > 0) { ideaLines++; line = words[i] + ' '; }
        else line = test;
      }
      ideaLines++;
    }

    const winnerSupports = collaborativeWinner?.supports || [];
    const supportsToShow = winnerSupports.slice(0, 3);
    const sortedOptions  = [...votingOptions].sort((a, b) => b.votes - a.votes).slice(0, 3);

    // ── compute total canvas height ────────────────────────────────────────────
    const HEADER_H    = 90;
    const DATE_H      = 36;
    const GAP         = 24;
    const TOPIC_H     = 28 + 28;
    const WINNER_H    = 60 + ideaLines * 30 + 32 + (supportsToShow.length > 0 ? 24 + supportsToShow.length * 52 : 0) + GAP;
    const DIST_H      = 28 + sortedOptions.length * 64 + (sortedOptions.length === 0 ? 40 : 0);
    const STATS_H     = 72;
    const FOOTER_H    = 60;

    const CANVAS_H = HEADER_H + DATE_H + GAP + TOPIC_H + GAP + WINNER_H + GAP + DIST_H + GAP + STATS_H + FOOTER_H + 32;
    canvas.height = CANVAS_H;

    // ── 1. Background (light, app-style) ─────────────────────────────────────
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    bgGrad.addColorStop(0, '#FAF8FF');
    bgGrad.addColorStop(1, '#F0ECFF');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CARD_W, CANVAS_H);

    // Subtle grid
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.055)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < CARD_W; gx += 24) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, CANVAS_H); ctx.stroke(); }
    for (let gy = 0; gy < CANVAS_H; gy += 24) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(CARD_W, gy); ctx.stroke(); }

    // Purple top-left glow
    const glowTL = ctx.createRadialGradient(0, 0, 0, 0, 0, 300);
    glowTL.addColorStop(0, 'rgba(139, 92, 246, 0.10)');
    glowTL.addColorStop(1, 'rgba(139, 92, 246, 0)');
    ctx.fillStyle = glowTL; ctx.fillRect(0, 0, CARD_W, CANVAS_H);

    // Orange bottom-right glow
    const glowBR = ctx.createRadialGradient(CARD_W, CANVAS_H, 0, CARD_W, CANVAS_H, 360);
    glowBR.addColorStop(0, 'rgba(255, 122, 61, 0.08)');
    glowBR.addColorStop(1, 'rgba(255, 122, 61, 0)');
    ctx.fillStyle = glowBR; ctx.fillRect(0, 0, CARD_W, CANVAS_H);

    // Outer border
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.18)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0.75, 0.75, CARD_W - 1.5, CANVAS_H - 1.5);

    // ── 2. Header ────────────────────────────────────────────────────────────
    // Orange left accent bar
    ctx.fillStyle = ORANGE;
    ctx.fillRect(0, 0, 5, HEADER_H);

    // Rapa logo badge
    ctx.fillStyle = 'rgba(255, 122, 61, 0.10)';
    rr(ctx, PAD, 22, 90, 34, 10); ctx.fill();
    ctx.fillStyle = ORANGE;
    ctx.font = '800 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Rapa', PAD + 12, 44);

    // Subtitle
    ctx.fillStyle = PURPLE;
    ctx.font = '700 11px sans-serif';
    ctx.fillText('• KARTU KEPUTUSAN RAPAT ANONIM', PAD + 108, 44);

    // "Rapat Selesai" badge — right side, bounded within card
    ctx.font = '700 11px sans-serif';
    const badgeTxt = '🏁 RAPAT SELESAI';
    const badgeW   = Math.min(ctx.measureText(badgeTxt).width + 28, 175);
    const badgeX   = CARD_W - PAD - badgeW;
    ctx.fillStyle = 'rgba(41, 62, 0, 0.12)';
    rr(ctx, badgeX, 24, badgeW, 30, 10); ctx.fill();
    ctx.fillStyle = LIME_D;
    ctx.textAlign = 'center';
    ctx.fillText(badgeTxt, badgeX + badgeW / 2, 43);
    ctx.textAlign = 'left';

    let curY = HEADER_H;

    // ── 3. Date strip ─────────────────────────────────────────────────────────
    ctx.fillStyle = 'rgba(139, 92, 246, 0.06)';
    ctx.fillRect(0, curY, CARD_W, DATE_H);
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.10)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, curY); ctx.lineTo(CARD_W, curY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, curY + DATE_H); ctx.lineTo(CARD_W, curY + DATE_H); ctx.stroke();

    const nowDate = new Date();
    const dateStr = nowDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = nowDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    ctx.fillStyle = PURPLE;
    ctx.font = '600 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`📅  ${dateStr}  ·  ${timeStr} WIB`, PAD, curY + 22);

    ctx.textAlign = 'right';
    ctx.fillStyle = MUTED;
    ctx.fillText(`Kode: ${code}`, CARD_W - PAD, curY + 22);
    ctx.textAlign = 'left';

    curY += DATE_H + GAP;

    // ── 4. Topic ──────────────────────────────────────────────────────────────
    ctx.fillStyle = ORANGE;
    ctx.font = '800 10px sans-serif';
    ctx.fillText('📋  TOPIK / PERTANYAAN RAPAT', PAD, curY);
    curY += 20;

    const topicText = room?.title || 'Rapat Curah Pendapat';
    ctx.fillStyle = COL;
    ctx.font = '700 17px sans-serif';
    const topicEndY = wrapText(ctx, topicText, PAD, curY, INNER, 26);
    curY = topicEndY + 10;

    // Divider
    ctx.strokeStyle = 'rgba(223, 192, 180, 0.5)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD, curY + 8); ctx.lineTo(CARD_W - PAD, curY + 8); ctx.stroke();
    curY += GAP + 8;

    // ── 5. Winner card (white, bordered, lime accent) ─────────────────────────
    const winStartY = curY;

    // Card shadow effect
    ctx.fillStyle = 'rgba(139, 92, 246, 0.06)';
    rr(ctx, PAD + 4, winStartY + 6, INNER, WINNER_H, 20); ctx.fill();

    // Card background
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(139, 92, 246, 0.10)';
    ctx.shadowBlur = 18;
    rr(ctx, PAD, winStartY, INNER, WINNER_H, 20); ctx.fill();
    ctx.shadowBlur = 0;

    // Card border
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.18)'; ctx.lineWidth = 1.5;
    rr(ctx, PAD, winStartY, INNER, WINNER_H, 20); ctx.stroke();

    // Lime left accent
    ctx.fillStyle = LIME;
    rr(ctx, PAD, winStartY, 5, WINNER_H, [4, 0, 0, 4]); ctx.fill();

    const WI = PAD + 20;
    const WW = INNER - 40;
    let wy = winStartY + 28;

    // Trophy label
    ctx.fillStyle = 'rgba(190, 242, 100, 0.18)';
    rr(ctx, WI, wy - 16, 170, 24, 7); ctx.fill();
    ctx.fillStyle = LIME_D;
    ctx.font = '800 10px sans-serif';
    ctx.fillText('🏆  KEPUTUSAN TERPOPULER', WI + 8, wy);
    wy += 22;

    // Idea text
    ctx.fillStyle = COL;
    ctx.font = '800 20px sans-serif';
    const ideaEndY = wrapText(ctx, `"${ideaText}"`, WI, wy, WW, 30);
    wy = ideaEndY + 18;

    // Stats line
    const totalV   = dbVotes.length;
    const winVotes = collaborativeWinner?.votes || 0;
    const winPct   = totalV > 0 ? Math.round((winVotes / totalV) * 100) : 0;
    ctx.fillStyle = PURPLE;
    ctx.font = '600 13px sans-serif';
    ctx.fillText(`${winVotes} suara  ·  ${winPct}% dari total ${totalV} partisipan`, WI, wy);
    wy += GAP;

    // Supporting opinions
    if (supportsToShow.length > 0) {
      ctx.fillStyle = PURPLE;
      ctx.font = '800 10px sans-serif';
      ctx.fillText('💬  PENDAPAT PENDUKUNG:', WI, wy);
      wy += 18;
      supportsToShow.forEach((sup) => {
        ctx.fillStyle = 'rgba(139, 92, 246, 0.05)';
        rr(ctx, WI, wy, WW, 36, 8); ctx.fill();
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.10)'; ctx.lineWidth = 1;
        rr(ctx, WI, wy, WW, 36, 8); ctx.stroke();
        ctx.fillStyle = MUTED;
        ctx.font = 'italic 12px sans-serif';
        const cleanSup = sup.length > 90 ? sup.slice(0, 90) + '…' : sup;
        ctx.fillText(`"${cleanSup}"`, WI + 12, wy + 23);
        wy += 52;
      });
    }

    curY = winStartY + WINNER_H + GAP;

    // ── 6. Vote distribution ──────────────────────────────────────────────────
    ctx.fillStyle = ORANGE;
    ctx.font = '800 10px sans-serif';
    ctx.fillText('📊  DISTRIBUSI SUARA', PAD, curY);
    curY += 22;

    if (sortedOptions.length === 0) {
      ctx.fillStyle = MUTED;
      ctx.font = 'italic 13px sans-serif';
      ctx.fillText('Tidak ada data voting yang tercatat.', PAD, curY + 20);
      curY += 60;
    } else {
      sortedOptions.forEach((option, idx) => {
        const pct = dbVotes.length > 0 ? Math.round((option.votes / dbVotes.length) * 100) : 0;
        const isWin = idx === 0;
        const cleanTxt = option.text.split(': ').slice(1).join(': ') || option.text;
        const label = `${String.fromCharCode(65 + idx)}. ${cleanTxt.length > 50 ? cleanTxt.slice(0, 50) + '…' : cleanTxt}`;

        ctx.fillStyle = isWin ? LIME_D : COL;
        ctx.font = `${isWin ? '800' : '700'} 13px sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(label, PAD, curY + 14);

        ctx.font = '700 12px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillStyle = isWin ? PURPLE : MUTED;
        ctx.fillText(`${option.votes} suara (${pct}%)`, CARD_W - PAD, curY + 14);
        ctx.textAlign = 'left';

        // Track
        const BAR_Y = curY + 22; const BAR_H = 10;
        ctx.fillStyle = 'rgba(139, 92, 246, 0.08)';
        rr(ctx, PAD, BAR_Y, INNER, BAR_H, 5); ctx.fill();

        if (pct > 0) {
          const grad = ctx.createLinearGradient(PAD, 0, PAD + INNER * (pct / 100), 0);
          if (isWin) { grad.addColorStop(0, LIME); grad.addColorStop(1, '#a4d64c'); }
          else        { grad.addColorStop(0, PURPLE); grad.addColorStop(1, '#6d28d9'); }
          ctx.fillStyle = grad;
          rr(ctx, PAD, BAR_Y, INNER * (pct / 100), BAR_H, 5); ctx.fill();
        }
        curY += 64;
      });
    }

    curY += GAP;

    // ── 7. Stats strip ────────────────────────────────────────────────────────
    ctx.fillStyle = 'rgba(139, 92, 246, 0.07)';
    rr(ctx, PAD, curY, INNER, 52, 14); ctx.fill();
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.12)'; ctx.lineWidth = 1;
    rr(ctx, PAD, curY, INNER, 52, 14); ctx.stroke();

    const COL_W = Math.floor(INNER / 3);
    [
      { icon: '👥', value: `${participantCount}`, label: 'Total Peserta' },
      { icon: '🗳️', value: `${totalV}`,           label: 'Total Suara' },
      { icon: '📌', value: `${sortedOptions.length}`, label: 'Pilihan Gagasan' },
    ].forEach((item, i) => {
      const sx = PAD + i * COL_W + COL_W / 2;
      ctx.textAlign = 'center';
      ctx.fillStyle = PURPLE;
      ctx.font = '800 14px sans-serif';
      ctx.fillText(`${item.icon} ${item.value}`, sx, curY + 20);
      ctx.fillStyle = MUTED;
      ctx.font = '600 10px sans-serif';
      ctx.fillText(item.label, sx, curY + 36);
    });
    ctx.textAlign = 'left';
    curY += 52 + GAP;

    // ── 8. Footer ─────────────────────────────────────────────────────────────
    ctx.strokeStyle = 'rgba(223, 192, 180, 0.4)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD, curY); ctx.lineTo(CARD_W - PAD, curY); ctx.stroke();
    curY += 18;

    ctx.fillStyle = MUTED;
    ctx.font = '600 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Rapa — Rapat Anonim · Pendapat Objektif Tanpa Tekanan Sosial', PAD, curY);

    ctx.fillStyle = ORANGE;
    ctx.font = '700 11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('rapa.app', CARD_W - PAD, curY);
    ctx.textAlign = 'left';

    const dataUrl = canvas.toDataURL('image/png');
    setShareImageUrl(dataUrl);
    setShareImageModalOpen(true);
  };

  const handleCopyToClipboard = async () => {
    try {
      const response = await fetch(shareImageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      alert("Gambar berhasil disalin ke papan klip! Siap dibagikan.");
    } catch (err) {
      console.error("Gagal menyalin gambar:", err);
      const inviteUrl = `${window.location.origin}/room/${code}`;
      navigator.clipboard.writeText(inviteUrl);
      alert("Papan klip tidak mendukung salin gambar secara langsung. Tautan undangan rapat telah disalin sebagai gantinya!");
    }
  };

  const SettingsTabContent = () => {
    const handleCopyLink = () => {
      const inviteUrl = `${window.location.origin}/room/${code}`;
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const handleClearCanvas = async () => {
      if (!room?.id) return;
      try {
        const { error } = await supabase
          .from('canvas_items')
          .delete()
          .eq('room_id', room.id);
        if (error) throw error;
        setShowClearConfirm(false);
        alert("Semua stiker kanvas berhasil dihapus!");
      } catch (err) {
        console.error("Gagal menghapus stiker:", err);
      }
    };

    const handleResetSession = async () => {
      try {
        const roomRepo = new SupabaseRoomRepository();
        if (room) {
          await supabase.from('questions').update({ status: 'archived' }).eq('room_id', room.id);
          await roomRepo.update(room.id, { status: 'waiting' });
          setWinner(null);
          setSelectedOption(null);
          alert("Sesi berhasil direset!");
        }
      } catch (err) {
        console.error("Gagal meriset sesi:", err);
      }
    };

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        animation: 'fadeInUp 0.5s ease-out',
        fontFamily: 'Inter, sans-serif'
      }}>
        {/* Settings Header */}
        <h3 style={{
          fontSize: '20px',
          fontWeight: '800',
          color: '#131b2e',
          fontFamily: 'Outfit, sans-serif',
          margin: '0 0 4px 0'
        }}>
          Pengaturan Ruangan
        </h3>

        {/* Room Info Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          padding: '24px',
          border: '1px solid rgba(223, 192, 180, 0.4)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
        }}>
          <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#131b2e', fontFamily: 'Outfit, sans-serif', marginBottom: '14px' }}>
            Informasi Sesi Rapat
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px', color: '#584239' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '500' }}>Judul Rapat:</span>
              <span style={{ fontWeight: '700', color: '#131b2e' }}>{room?.title || '-'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '500' }}>Kode Akses:</span>
              <span style={{ fontWeight: '800', color: '#8B5CF6', fontFamily: 'Lexend, sans-serif' }}>{code}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '500' }}>Tipe Sesi:</span>
              <span style={{ fontWeight: '700', color: '#FF7A3D' }}>
                {room?.sessionType === 'direct_voting' ? 'Direct Voting' : 'Brainstorming & Canvas'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '500' }}>Status Rapat:</span>
              <span style={{
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '800',
                backgroundColor: room?.status === 'active' ? 'rgba(255, 122, 61, 0.1)' : '#f2fbe0',
                color: room?.status === 'active' ? '#FF7A3D' : '#476800'
              }}>{room?.status === 'waiting' ? 'Menunggu' : room?.status === 'active' ? 'Aktif' : 'Selesai'}</span>
            </div>
          </div>
        </div>

        {isGMLoggedIn ? (
          /* ==================== GAME MASTER PANEL ==================== */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Invite Link Card */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              padding: '24px',
              border: '1.5px solid rgba(139, 92, 246, 0.15)',
              boxShadow: '0 8px 24px rgba(139, 92, 246, 0.04)'
            }}>
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#131b2e', fontFamily: 'Outfit, sans-serif', marginBottom: '8px' }}>
                Undang Peserta
              </h4>
              <p style={{ fontSize: '12.5px', color: '#584239', lineHeight: 1.4, marginBottom: '16px' }}>
                Bagikan tautan langsung di bawah ini agar peserta Anda dapat bergabung secara instan tanpa perlu mendaftar.
              </p>
              <button
                onClick={handleCopyLink}
                className="btn-purple"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '14px',
                  border: 'none',
                  fontWeight: '800',
                  fontSize: '13px',
                  fontFamily: 'Lexend, sans-serif',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.12)'
                }}
              >
                {copied ? (
                  <>
                    <span>✅</span>
                    <span>Tautan Berhasil Disalin!</span>
                  </>
                ) : (
                  <>
                    <span>🔗</span>
                    <span>Salin Link Undangan</span>
                  </>
                )}
              </button>
            </div>

            {/* Danger Zone Controls */}
            <div style={{
              backgroundColor: '#fffbfa',
              borderRadius: '24px',
              padding: '24px',
              border: '1.5px solid rgba(186, 26, 26, 0.15)',
              boxShadow: '0 4px 16px rgba(186, 26, 26, 0.02)'
            }}>
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#ba1a1a', fontFamily: 'Outfit, sans-serif', marginBottom: '8px' }}>
                Zona Bahaya (GM Controls)
              </h4>
              <p style={{ fontSize: '12.5px', color: '#584239', lineHeight: 1.4, marginBottom: '20px' }}>
                Tindakan di bawah ini bersifat permanen. Harap berhati-hati sebelum memicu perubahan.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Reset Sesi */}
                <button
                  onClick={handleResetSession}
                  style={{
                    backgroundColor: 'white',
                    color: '#ba1a1a',
                    border: '1.5px solid rgba(186, 26, 26, 0.3)',
                    borderRadius: '14px',
                    padding: '12px',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    fontFamily: 'Lexend, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(186, 26, 26, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <span>🔄</span>
                  <span>Reset Sesi Rapat</span>
                </button>

                {/* Clear Canvas */}
                {showClearConfirm ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '12px',
                    backgroundColor: 'white',
                    borderRadius: '14px',
                    border: '1.5px solid #ba1a1a'
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#ba1a1a', textAlign: 'center' }}>
                      Apakah Anda yakin ingin menghapus SEMUA stiker di kanvas?
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={handleClearCanvas}
                        style={{
                          flex: 1,
                          backgroundColor: '#ba1a1a',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px',
                          fontSize: '12px',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        Ya, Hapus Semua
                      </button>
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        style={{
                          flex: 1,
                          backgroundColor: '#f1f5f9',
                          color: '#584239',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px',
                          fontSize: '12px',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    style={{
                      backgroundColor: 'rgba(186, 26, 26, 0.06)',
                      color: '#ba1a1a',
                      border: 'none',
                      borderRadius: '14px',
                      padding: '12px',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      fontFamily: 'Lexend, sans-serif',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(186, 26, 26, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(186, 26, 26, 0.06)';
                    }}
                  >
                    <span>🗑️</span>
                    <span>Hapus Semua Stiker Kanvas</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ==================== PARTICIPANT (USER) MARKETING PANEL ==================== */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Elegant glassmorphic explanation */}
            <div style={{
              backgroundColor: '#eaedff',
              borderRadius: '28px',
              padding: '24px',
              border: '1.5px solid rgba(139, 92, 246, 0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '800',
                color: '#131b2e',
                fontFamily: 'Outfit, sans-serif',
                marginBottom: '8px'
              }}>Rapa untuk Peserta</h4>
              <p style={{
                fontSize: '13.5px',
                color: '#584239',
                lineHeight: 1.45,
                fontFamily: 'Inter, sans-serif',
                margin: 0
              }}>
                Sebagai peserta, Anda memiliki akses penuh untuk menuangkan ide secara realtime dan memberikan hak suara Anda secara anonim. Game Master (pembuat rapat) bertanggung jawab mengontrol alur diskusi, memandu perpindahan tab, dan mengekspor keputusan akhir.
              </p>
            </div>

            {/* Premium CTA card */}
            <div style={{
              backgroundColor: '#fffcf7',
              borderRadius: '28px',
              padding: '24px',
              border: '2px solid rgba(255, 122, 61, 0.25)',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(255, 122, 61, 0.04)'
            }}>
              <span style={{ fontSize: '36px', display: 'block', marginBottom: '8px' }}>👑</span>
              <h4 style={{
                fontSize: '17px',
                fontWeight: '800',
                color: '#131b2e',
                fontFamily: 'Outfit, sans-serif',
                marginBottom: '6px'
              }}>Ingin Memimpin Diskusi Sendiri?</h4>
              <p style={{
                fontSize: '13.5px',
                color: '#584239',
                lineHeight: 1.45,
                fontFamily: 'Inter, sans-serif',
                marginBottom: '18px',
                maxWidth: '300px',
                marginRight: 'auto',
                marginLeft: 'auto'
              }}>
                Dapatkan kendali penuh untuk membuat ruangan rapat, mengelola kanvas stiker, serta memandu hasil keputusan dengan menjadi Game Master (GM). Gratis!
              </p>
              <button
                onClick={() => router.push('/')}
                style={{
                  width: '100%',
                  backgroundColor: '#FF7A3D',
                  color: 'white',
                  border: 'none',
                  borderRadius: '100px',
                  height: '48px',
                  fontWeight: '800',
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  fontFamily: 'Lexend, sans-serif',
                  boxShadow: '0 4px 12px rgba(255, 122, 61, 0.15)',
                  transition: 'all 0.2s'
                }}
                className="btn-orange"
              >
                Mulai Sebagai Game Master
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const maxChars = 280;

  return (
    <div className="mobile-app-shell">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blobFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-15px) scale(1.05); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes celebrationPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
        .animate-slide-in-right { animation: slideInRight 0.4s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.3s ease-out forwards; }
        .animate-celebration { animation: celebrationPulse 0.6s ease-in-out infinite; }
        .btn-orange {
          background-color: #FF7A3D;
          color: white;
          transition: all 0.2s;
        }
        .btn-orange:hover:not(:disabled) {
          background-color: #ff651a;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(255, 122, 61, 0.25);
        }
        .btn-orange:active:not(:disabled) {
          transform: translateY(0);
        }
        .btn-orange:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-purple {
          background-color: #8B5CF6;
          color: white;
          transition: all 0.2s;
        }
        .btn-purple:hover {
          background-color: #7c3aed;
          transform: translateY(-1px);
        }
        .swipe-card {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: grab;
        }
        .swipe-card:active {
          cursor: grabbing;
        }
        .swipe-card.selected {
          border: 3px solid #BEF264;
          box-shadow: 0 8px 24px rgba(190, 242, 100, 0.3);
        }
        .progress-bar {
          background: linear-gradient(90deg, #BEF264 0%, #80AF27 100%);
          transition: width 0.3s ease;
        }
        .char-counter.warning { color: #FF7A3D; }
        .char-counter.danger { color: #ba1a1a; }
      `}} />

      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px 12px 20px',
        borderBottom: '1px solid rgba(140, 113, 103, 0.1)',
        zIndex: 10,
        backgroundColor: 'var(--surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => router.push('/')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(19, 27, 46, 0.05)',
              color: '#131b2e',
              transition: 'all 0.2s',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(19, 27, 46, 0.1)';
              e.currentTarget.style.transform = 'translateX(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(19, 27, 46, 0.05)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            ←
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ 
              color: '#131b2e', 
              fontWeight: '800', 
              fontSize: '16px',
              fontFamily: 'Outfit, sans-serif',
              letterSpacing: '-0.3px',
              maxWidth: '120px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }} title={room?.title || 'Brainstorm'}>
              {room?.title || 'Brainstorm'}
            </span>

            {/* Pulsing Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: sessionState === 'waiting' ? 'rgba(139, 92, 246, 0.06)' : sessionState === 'input' ? 'rgba(255, 122, 61, 0.06)' : sessionState === 'voting' ? 'rgba(190, 242, 100, 0.12)' : 'rgba(6, 182, 212, 0.06)',
              padding: '3px 8px',
              borderRadius: '100px',
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: sessionState === 'waiting' ? '#8B5CF6' : sessionState === 'input' ? '#FF7A3D' : sessionState === 'voting' ? '#80AF27' : '#06b6d4',
                animation: 'pulseScale 2s ease-in-out infinite'
              }} />
              <span style={{
                fontSize: '9px',
                fontWeight: '800',
                color: '#584239',
                fontFamily: 'Lexend, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.2px'
              }}>
                {room?.status === 'finished' ? 'Selesai' :
                 sessionState === 'waiting' ? 'Waiting' : 
                 sessionState === 'input' ? 'Input' : 
                 sessionState === 'voting' ? 'Vote' : 'Hasil'}
              </span>
            </div>

            {/* Active Members Avatars Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '-6px',
              position: 'relative',
              marginLeft: '4px'
            }}>
              {/* GM Avatar */}
              <div style={{ position: 'relative', zIndex: 10 }}>
                <AnonymousAvatar size={26} showExpression={true} avatarIndex={0} isGM={true} />
              </div>

              {/* Participants */}
              {displayedParticipants.length + 1 <= 4 ? (
                displayedParticipants.map((p, i) => {
                  let avatarIdx = i + 1;
                  if (p.avatarSeed) {
                    let hash = 0;
                    for (let c = 0; c < p.avatarSeed.length; c++) {
                      hash = p.avatarSeed.charCodeAt(c) + ((hash << 5) - hash);
                    }
                    avatarIdx = Math.abs(hash);
                  }
                  return (
                    <div key={p.id} style={{ marginLeft: '-6px', zIndex: 9 - i }}>
                      <AnonymousAvatar size={26} showExpression={false} avatarIndex={avatarIdx} />
                    </div>
                  );
                })
              ) : (
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: '#eaedff',
                  border: '1.5px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '-6px',
                  fontSize: '9px',
                  fontWeight: '800',
                  color: '#8B5CF6',
                  fontFamily: 'Lexend, sans-serif',
                  zIndex: 9
                }}>
                  +{displayedParticipants.length}
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{
          backgroundColor: '#eaedff',
          padding: '6px 14px',
          borderRadius: '100px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ fontSize: '12px', color: '#584239', fontWeight: '500', fontFamily: 'Inter, sans-serif' }}>Room</span>
          <span style={{ fontSize: '14px', color: '#8B5CF6', fontWeight: '800', fontFamily: 'Lexend, sans-serif' }}>{code}</span>
        </div>
      </header>

      {/* GM Kontrol Bar */}
      {isGMLoggedIn && sessionState !== 'waiting' && (
        <div style={{
          backgroundColor: '#fdfcfe',
          borderBottom: '1px solid rgba(139, 92, 246, 0.12)',
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          zIndex: 9
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '14px' }}>👑</span>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#8B5CF6', fontFamily: 'Lexend, sans-serif', textTransform: 'uppercase' }}>Kontrol GM:</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {room?.status === 'finished' ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: 'rgba(71, 104, 0, 0.1)',
                border: '1.5px solid rgba(71, 104, 0, 0.25)',
                borderRadius: '100px',
                fontSize: '11px',
                fontWeight: '800',
                color: '#476800',
                fontFamily: 'Lexend, sans-serif',
              }}>
                <span>🏁</span>
                <span>Rapat Selesai (Read-Only)</span>
              </div>
            ) : (
              <>
                {sessionState === 'input' && (
                  <button
                    onClick={async () => {
                      try {
                        const roomRepo = new SupabaseRoomRepository();
                        if (room) {
                          // 1. Populate questions table with brainstorm ideas
                          const ideas = canvasItems.filter(item => item.type === 'idea');
                          
                          // Check if questions already exist to avoid duplicating them on click
                          const { data: existingQ } = await supabase
                            .from('questions')
                            .select('id')
                            .eq('room_id', room.id)
                            .neq('status', 'archived');
                            
                          if (!existingQ || existingQ.length === 0) {
                            for (let i = 0; i < ideas.length; i++) {
                              const idea = ideas[i];
                              const label = idea.metadata?.label || `Gagasan ${String.fromCharCode(65 + i)}`;
                              await supabase.from('questions').insert({
                                room_id: room.id,
                                content: idea.content,
                                group_name: `${label}|||${idea.id}`,
                                status: 'active'
                              });
                            }
                          }
                          
                          // 2. No database update to status is needed since 'voting' is not a valid DB room status.
                          // Simply setting the local state to 'voting' is enough, and other clients will transition
                          // automatically in real-time when they detect the new questions in the database.
                          setSessionState('voting');
                        }
                      } catch (err) {
                        console.error("Gagal berpindah ke voting:", err);
                      }
                    }}
                    className="btn-orange"
                    style={{
                      padding: '8px 16px',
                      borderRadius: '100px',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: '800',
                      fontFamily: 'Lexend, sans-serif',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 4px 12px rgba(255, 122, 61, 0.15)'
                    }}
                  >
                    <span>🗳️</span>
                    <span>Mulai Voting</span>
                  </button>
                )}
                {sessionState === 'voting' && (
                  <button
                    onClick={async () => {
                      try {
                        const roomRepo = new SupabaseRoomRepository();
                        if (room) await roomRepo.update(room.id, { status: 'results' });
                      } catch (err) {
                        console.error("Gagal berpindah ke selesai:", err);
                      }
                    }}
                    className="btn-purple"
                    style={{
                      padding: '8px 16px',
                      borderRadius: '100px',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: '800',
                      fontFamily: 'Lexend, sans-serif',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)'
                    }}
                  >
                    <span>📊</span>
                    <span>Lihat Hasil Akhir</span>
                  </button>
                )}
                {sessionState === 'results' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={async () => {
                        try {
                          const roomRepo = new SupabaseRoomRepository();
                          if (room) {
                            // 1. Archive old questions (preserves votes)
                            await supabase
                              .from('questions')
                              .update({ status: 'archived' })
                              .eq('room_id', room.id);
                              
                            // 2. Reset session status to waiting
                            await roomRepo.update(room.id, { status: 'waiting' });
                            
                            // 3. Reset local states
                            setWinner(null);
                            setSelectedOption(null);
                            alert("Sesi berhasil direset!");
                          }
                        } catch (err) {
                          console.error("Gagal meriset sesi:", err);
                        }
                      }}
                      style={{
                        backgroundColor: '#64748b',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '100px',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: '800',
                        fontFamily: 'Lexend, sans-serif',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>🔄</span>
                      <span>Reset Sesi</span>
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          const roomRepo = new SupabaseRoomRepository();
                          if (room) {
                            await roomRepo.update(room.id, { status: 'finished' });
                            alert("Rapat telah diselesaikan!");
                          }
                        } catch (err) {
                          console.error("Gagal menyelesaikan rapat:", err);
                        }
                      }}
                      className="btn-orange"
                      style={{
                        padding: '8px 16px',
                        borderRadius: '100px',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: '800',
                        fontFamily: 'Lexend, sans-serif',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 4px 12px rgba(255, 122, 61, 0.15)'
                      }}
                    >
                      <span>🏁</span>
                      <span>Meeting Selesai</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="app-content" style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: activeTab === 1 ? 'hidden' : 'auto', 
        padding: activeTab === 1 ? '16px 16px 0 16px' : '20px 20px 120px 20px',
        position: 'relative'
      }}>
        
        {/* TAB 0: LOBBY / RESULTS */}
        {activeTab === 0 && (
          <>
            {sessionState !== 'results' ? (
              /* WAITING STATE (LOBBY) */
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                flex: 1,
                textAlign: 'center',
                animation: 'fadeInUp 0.6s ease-out'
              }}>
                <div style={{
                  width: '100%',
                  aspectRatio: '1.4',
                  backgroundColor: '#eff2e7',
                  borderRadius: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '32px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <AnonymousBlobs count={6} />
                </div>
                
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  color: '#131b2e',
                  fontFamily: 'Outfit, sans-serif',
                  marginBottom: '8px',
                  letterSpacing: '-0.5px'
                }}>
                  Ruang Rapat Rapa
                </h1>
                
                <p style={{
                  fontSize: '14px',
                  color: '#584239',
                  fontFamily: 'Inter, sans-serif',
                  marginBottom: '24px'
                }}>
                  Partisipasi anonim untuk hasil optimal dan objektif
                </p>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#eaedff',
                  padding: '12px 20px',
                  borderRadius: '100px',
                  marginBottom: '32px'
                }}>
                  <AnonymousAvatar size={32} showExpression={false} />
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#131b2e',
                    fontFamily: 'Lexend, sans-serif'
                  }}>
                    {participantCount} Peserta Bergabung
                  </span>
                </div>
                
                {isGMLoggedIn ? (
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '24px',
                    padding: '24px',
                    width: '100%',
                    maxWidth: '360px',
                    border: '2px solid rgba(139, 92, 246, 0.15)',
                    boxShadow: '0 8px 32px rgba(139, 92, 246, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#8B5CF6',
                      fontFamily: 'Lexend, sans-serif',
                      fontSize: '14px',
                      fontWeight: '700'
                    }}>
                      <span style={{ fontSize: '18px' }}>👑</span>
                      <span>Anda adalah GM</span>
                    </div>
                    
                    <p style={{
                      fontSize: '13px',
                      color: '#584239',
                      fontFamily: 'Inter, sans-serif',
                      margin: 0
                    }}>
                      Klik tombol di bawah ini untuk memulai rapat dan izinkan peserta mulai memberikan jawaban/ide.
                    </p>

                    <button
                      onClick={handleStartSession}
                      disabled={isStarting}
                      className="btn-purple"
                      style={{
                        width: '100%',
                        padding: '14px 20px',
                        borderRadius: '16px',
                        border: 'none',
                        fontWeight: '800',
                        fontSize: '14px',
                        fontFamily: 'Lexend, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 6px 20px rgba(139, 92, 246, 0.2)',
                        transition: 'all 0.2s'
                      }}
                    >
                      {isStarting ? (
                        <span>⏳ Memulai Sesi...</span>
                      ) : (
                        <>
                          <span>🚀</span>
                          <span>Mulai Sesi Rapat</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#8B5CF6',
                    fontFamily: 'Lexend, sans-serif',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#8B5CF6',
                      animation: 'pulseScale 2s ease-in-out infinite'
                    }} />
                    <span>Menunggu Game Master memulai sesi...</span>
                  </div>
                )}
              </div>
            ) : (
              /* RESULTS PHASE */
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                flex: 1,
                animation: 'fadeInUp 0.5s ease-out',
                textAlign: 'center'
              }}>
                {/* Celebration Animation */}
                {showCelebration && (
                  <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(250, 248, 255, 0.95)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100,
                    animation: 'fadeInUp 0.3s ease-out'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div className="animate-celebration" style={{ marginBottom: '24px' }}>
                        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                          <circle cx="60" cy="60" r="50" fill="#BEF264" />
                          <circle cx="40" cy="45" r="6" fill="#333" />
                          <circle cx="80" cy="45" r="6" fill="#333" />
                          <path d="M 35 70 Q 60 95 85 70" stroke="#333" strokeWidth="4" strokeLinecap="round" fill="none" />
                        </svg>
                      </div>
                      <h2 style={{
                        fontSize: '28px',
                        fontWeight: '800',
                        color: '#131b2e',
                        fontFamily: 'Outfit, sans-serif',
                        marginBottom: '8px'
                      }}>
                        Vote Terkirim!
                      </h2>
                    </div>
                  </div>
                )}

                {/* Brainstorming Question/Topic */}
                <div style={{
                  width: '100%',
                  backgroundColor: 'white',
                  borderRadius: '24px',
                  padding: '20px 24px',
                  marginBottom: '24px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
                  border: '1.5px solid rgba(139, 92, 246, 0.12)',
                  textAlign: 'left',
                  boxSizing: 'border-box'
                }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    color: '#8B5CF6',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    display: 'block',
                    marginBottom: '8px',
                    fontFamily: 'Lexend, sans-serif'
                  }}>
                    💡 Pertanyaan Brainstorming / Topik:
                  </span>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#131b2e',
                    fontFamily: 'Outfit, sans-serif',
                    lineHeight: '1.45',
                    margin: 0
                  }}>
                    {room?.title || 'Rapat Curah Pendapat'}
                  </h3>
                </div>

                {/* Winner Card */}
                {collaborativeWinner && (
                  <div style={{
                    width: '100%',
                    backgroundColor: 'white',
                    borderRadius: '28px',
                    padding: '32px 24px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    marginBottom: '24px',
                    border: '2px solid #BEF264'
                  }}>
                    {/* Crown for winner */}
                    <div style={{
                      width: '64px',
                      height: '64px',
                      margin: '0 auto 20px',
                      backgroundColor: '#BEF264',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      animation: 'pulseScale 2s ease-in-out infinite'
                    }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="#293e00">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                    </div>

                    <span style={{
                      display: 'inline-block',
                      backgroundColor: '#BEF264',
                      color: '#293e00',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '6px 14px',
                      borderRadius: '100px',
                      fontFamily: 'Lexend, sans-serif',
                      letterSpacing: '0.5px',
                      marginBottom: '16px'
                    }}>
                      PILIHAN TERATAS
                    </span>

                    <h3 style={{
                      fontSize: '22px',
                      fontWeight: '700',
                      color: '#131b2e',
                      fontFamily: 'Outfit, sans-serif',
                      marginBottom: '8px',
                      lineHeight: '1.3'
                    }}>
                      {collaborativeWinner.text}
                    </h3>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      color: '#584239',
                      fontSize: '14px',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      <span>{collaborativeWinner.votes}</span>
                      <span style={{ opacity: 0.5 }}>votes</span>
                    </div>

                    {/* Winner Supporting Opinions */}
                    {collaborativeWinner.supports && collaborativeWinner.supports.length > 0 && (
                      <div style={{
                        marginTop: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        padding: '16px',
                        backgroundColor: '#f5f3ff',
                        borderRadius: '16px',
                        border: '1.5px solid rgba(139, 92, 246, 0.08)',
                        textAlign: 'left'
                      }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: '800',
                          color: '#8B5CF6',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span>💬</span> Pendapat Pendukung ({collaborativeWinner.supports.length}):
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {collaborativeWinner.supports.map((sup, idx) => (
                            <span key={idx} style={{
                              fontSize: '12.5px',
                              fontStyle: 'italic',
                              color: '#584239',
                              fontFamily: 'Inter, sans-serif',
                              lineHeight: '1.4',
                              backgroundColor: 'white',
                              padding: '8px 12px',
                              borderRadius: '10px',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                            }}>
                              &quot;{sup}&quot;
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* All Options Vote Distribution */}
                {votingOptions.length > 0 && (
                  <div style={{
                    width: '100%',
                    backgroundColor: 'white',
                    borderRadius: '24px',
                    padding: '24px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
                    border: '1px solid rgba(139, 92, 246, 0.08)',
                    marginBottom: '24px',
                    textAlign: 'left'
                  }}>
                    <h4 style={{
                      fontSize: '15px',
                      fontWeight: '800',
                      color: '#131b2e',
                      fontFamily: 'Outfit, sans-serif',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>📊</span>
                      <span>Distribusi Suara Rapat</span>
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {votingOptions.map((option, index) => {
                        const totalVotes = dbVotes.length || 1;
                        const percentage = Math.round((option.votes / totalVotes) * 100);
                        return (
                          <div key={option.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '12px', borderBottom: index < votingOptions.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '13px', fontWeight: '700', fontFamily: 'Inter, sans-serif', gap: '12px' }}>
                              <span style={{ color: '#131b2e', flex: 1 }}>
                                {String.fromCharCode(65 + index)}. {option.text.split(': ').slice(1).join(': ') || option.text}
                              </span>
                              <span style={{ color: '#8B5CF6', whiteSpace: 'nowrap' }}>
                                {option.votes} {option.votes === 1 ? 'vote' : 'votes'} ({percentage}%)
                              </span>
                            </div>
                            <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '100px', overflow: 'hidden' }}>
                              <div 
                                className="progress-bar" 
                                style={{ 
                                  width: `${percentage}%`, 
                                  height: '100%', 
                                  borderRadius: '100px' 
                                }} 
                              />
                            </div>
                            {/* Option Supporting Opinions */}
                            {option.supports && option.supports.length > 0 && (
                              <div style={{
                                marginTop: '4px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                padding: '8px 10px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '8px',
                                border: '1px dashed #e2e8f0'
                              }}>
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: '800',
                                  color: '#64748b',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px'
                                }}>
                                  💬 Pendukung ({option.supports.length}):
                                </span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  {option.supports.map((sup, idx) => (
                                    <span key={idx} style={{
                                      fontSize: '11px',
                                      fontStyle: 'italic',
                                      color: '#475569',
                                      fontFamily: 'Inter, sans-serif',
                                      lineHeight: '1.35'
                                    }}>
                                      &quot;{sup}&quot;
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}



                {/* Share Decision Card (Only visible when room is finished) */}
                {room?.status === 'finished' && (
                  <div style={{
                    width: '100%',
                    backgroundColor: 'white',
                    borderRadius: '24px',
                    padding: '24px',
                    boxShadow: '0 8px 32px rgba(139, 92, 246, 0.08)',
                    border: '1.5px solid rgba(139, 92, 246, 0.15)',
                    marginBottom: '24px',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%)',
                    boxSizing: 'border-box'
                  }}>
                    <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>📢</span>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '800',
                      color: '#131b2e',
                      fontFamily: 'Outfit, sans-serif',
                      marginBottom: '6px',
                      margin: 0
                    }}>
                      Bagikan Hasil Keputusan
                    </h4>
                    <p style={{
                      fontSize: '12.5px',
                      color: '#584239',
                      lineHeight: 1.45,
                      fontFamily: 'Inter, sans-serif',
                      marginBottom: '16px',
                      marginTop: '6px'
                    }}>
                      Unduh infografis ringkasan keputusan rapat yang telah diselesaikan untuk dibagikan secara instan ke media sosial.
                    </p>
                    <button
                      onClick={handleGenerateShareImage}
                      className="btn-purple"
                      style={{
                        width: '100%',
                        padding: '12px 20px',
                        borderRadius: '14px',
                        border: 'none',
                        fontWeight: '800',
                        fontSize: '13px',
                        fontFamily: 'Lexend, sans-serif',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)'
                      }}
                    >
                      <span>🖼️</span>
                      <span>Buat Kartu Keputusan</span>
                    </button>
                  </div>
                )}

                {/* Session Info */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  width: '100%',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    flex: 1,
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <span style={{
                      fontSize: '24px',
                      fontWeight: '800',
                      color: '#8B5CF6',
                      fontFamily: 'Outfit, sans-serif'
                    }}>
                      {participantCount}
                    </span>
                    <p style={{
                      fontSize: '11px',
                      color: '#584239',
                      fontFamily: 'Inter, sans-serif',
                      margin: 0,
                      marginTop: '4px'
                    }}>
                      Participants
                    </p>
                  </div>
                  <div style={{
                    flex: 1,
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <span style={{
                      fontSize: '24px',
                      fontWeight: '800',
                      color: '#FF7A3D',
                      fontFamily: 'Outfit, sans-serif'
                    }}>
                      {sessionType === 'brainstorming' ? votingOptions.length : questions.length}
                    </span>
                    <p style={{
                      fontSize: '11px',
                      color: '#584239',
                      fontFamily: 'Inter, sans-serif',
                      margin: 0,
                      marginTop: '4px'
                    }}>
                      {sessionType === 'brainstorming' ? 'Gagasan Rapat' : 'Questions'}
                    </p>
                  </div>
                </div>

                {sessionType === 'brainstorming' ? null : (
                  <>
                    {/* Next Question Button */}
                    {currentQuestionIndex < questions.length - 1 && (
                      <button
                        onClick={handleNextQuestion}
                        className="btn-purple"
                        style={{
                          width: '100%',
                          padding: '16px 24px',
                          borderRadius: '16px',
                          border: 'none',
                          fontWeight: '700',
                          fontSize: '15px',
                          fontFamily: 'Lexend, sans-serif',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        Pertanyaan Berikutnya
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </button>
                    )}

                    {currentQuestionIndex === questions.length - 1 && (
                      <div style={{
                        textAlign: 'center',
                        color: '#584239',
                        fontSize: '13px',
                        fontFamily: 'Inter, sans-serif'
                      }}>
                        <p>🎉 Session selesai! Terima kasih sudah berpartisipasi.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* TAB 1: BRAINSTORM (CANVAS) */}
        {activeTab === 1 && (
          <CanvasTab roomId={room?.id} myParticipantId={myParticipant?.id} roomStatus={room?.status} />
        )}

        {/* TAB 2: VOTING PHASE */}
        {activeTab === 2 && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            flex: 1,
            animation: 'fadeInUp 0.5s ease-out'
          }}>
            {/* Timer Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <span style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#131b2e',
                fontFamily: 'Lexend, sans-serif'
              }}>
                Pilih voting kamu
              </span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: timer <= 10 ? 'rgba(186, 26, 26, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                padding: '8px 14px',
                borderRadius: '100px'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={timer <= 10 ? '#ba1a1a' : '#8B5CF6'} strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span style={{
                  fontSize: '16px',
                  fontWeight: '800',
                  color: timer <= 10 ? '#ba1a1a' : '#8B5CF6',
                  fontFamily: 'Outfit, sans-serif'
                }}>
                  {timer}s
                </span>
              </div>
            </div>

            {/* Question reminder */}
            <div style={{
              backgroundColor: '#eaedff',
              padding: '16px',
              borderRadius: '16px',
              marginBottom: '20px'
            }}>
              <span style={{
                fontSize: '13px',
                color: '#584239',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '500'
              }}>
                {room?.title || 'Tentukan pilihan terbaik untuk gagasan ini'}
              </span>
            </div>

            {/* 3D Horizontal Carousel Card Deck */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '370px',
              margin: '10px 0 15px 0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden'
            }}>
              {/* Track / Deck */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: '310px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {votingOptions.length === 0 ? (
                  <div style={{ color: '#584239', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
                    Menunggu opsi voting dimuat...
                  </div>
                ) : (
                  votingOptions.map((option, index) => {
                    const offset = index - currentSlide;
                    const isActive = offset === 0;
                    const isVisible = Math.abs(offset) <= 1;

                    if (!isVisible) return null;

                    return (
                      <div
                        key={option.id}
                        onClick={() => {
                          if (room?.status === 'finished') return; // Read-only
                          if (!isActive) {
                            setCurrentSlide(index);
                          } else {
                            setSelectedOption(option.id);
                          }
                        }}
                        className={`swipe-card ${selectedOption === option.id ? 'selected' : ''}`}
                        style={{
                          position: 'absolute',
                          width: '270px',
                          height: '290px',
                          backgroundColor: 'white',
                          borderRadius: '24px',
                          padding: '24px',
                          border: selectedOption === option.id ? '3px solid #BEF264' : '1.5px solid rgba(223, 192, 180, 0.4)',
                          boxShadow: selectedOption === option.id 
                            ? '0 12px 32px rgba(190, 242, 100, 0.3)' 
                            : isActive 
                              ? '0 10px 25px rgba(139, 92, 246, 0.08)' 
                              : '0 4px 12px rgba(0,0,0,0.03)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          transform: `translateX(${offset * 105}%) scale(${isActive ? 1 : 0.88})`,
                          opacity: isActive ? 1 : 0.4,
                          zIndex: isActive ? 10 : 5 - Math.abs(offset),
                          transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                          cursor: isActive ? 'default' : 'pointer',
                          pointerEvents: 'auto',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Card Header: Option Tag & Selection Icon */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            backgroundColor: selectedOption === option.id ? '#BEF264' : '#eaedff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '800',
                            fontSize: '16px',
                            color: selectedOption === option.id ? '#293e00' : '#8B5CF6',
                            fontFamily: 'Outfit, sans-serif'
                          }}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          {selectedOption === option.id && (
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: '#BEF264',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              animation: 'scaleIn 0.2s ease-out'
                            }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#293e00" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Option Text */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                          <span style={{
                            fontSize: '14px',
                            fontWeight: '700',
                            color: '#131b2e',
                            fontFamily: 'Outfit, sans-serif',
                            lineHeight: '1.4'
                          }}>
                            {option.text}
                          </span>

                          {/* Support comments inside card in speech bubble */}
                          {option.supports && option.supports.length > 0 && (
                            <div style={{
                              marginTop: 'auto',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              padding: '10px 12px',
                              backgroundColor: '#f5f3ff',
                              borderRadius: '12px',
                              border: '1.5px solid rgba(139, 92, 246, 0.05)'
                            }}>
                              <span style={{
                                fontSize: '10px',
                                fontWeight: '800',
                                color: '#8B5CF6',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                💬 Pendukung ({option.supports.length}):
                              </span>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '55px', overflowY: 'auto' }}>
                                {option.supports.map((sup, idx) => (
                                  <span key={idx} style={{
                                    fontSize: '11.5px',
                                    fontStyle: 'italic',
                                    color: '#584239',
                                    fontFamily: 'Inter, sans-serif',
                                    lineHeight: '1.3'
                                  }}>
                                    &quot;{sup}&quot;
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Floating Navigation Controls */}
                {votingOptions.length > 1 && (
                  <>
                    {/* Left Arrow */}
                    <button
                      onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                      disabled={currentSlide === 0}
                      style={{
                        position: 'absolute',
                        left: '4px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        border: '1.5px solid rgba(139, 92, 246, 0.15)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
                        opacity: currentSlide === 0 ? 0.3 : 0.9,
                        zIndex: 20,
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>

                    {/* Right Arrow */}
                    <button
                      onClick={() => setCurrentSlide(prev => Math.min(votingOptions.length - 1, prev + 1))}
                      disabled={currentSlide === votingOptions.length - 1}
                      style={{
                        position: 'absolute',
                        right: '4px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        border: '1.5px solid rgba(139, 92, 246, 0.15)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: currentSlide === votingOptions.length - 1 ? 'not-allowed' : 'pointer',
                        opacity: currentSlide === votingOptions.length - 1 ? 0.3 : 0.9,
                        zIndex: 20,
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Slide Indicator Dots */}
              {votingOptions.length > 1 && (
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  marginTop: '12px',
                  zIndex: 20
                }}>
                  {votingOptions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      style={{
                        width: index === currentSlide ? '18px' : '6px',
                        height: '6px',
                        borderRadius: '100px',
                        backgroundColor: index === currentSlide ? '#8B5CF6' : 'rgba(139, 92, 246, 0.2)',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        outline: 'none'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Vote Button */}
            <button
              onClick={handleVoteSubmit}
              disabled={!selectedOption || room?.status === 'finished'}
              className="btn-orange"
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: '16px',
                border: 'none',
                fontWeight: '700',
                fontSize: '15px',
                fontFamily: 'Lexend, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '15px'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Konfirmasi Vote
            </button>

            {/* Hint */}
            <div style={{
              textAlign: 'center',
              color: '#584239',
              fontSize: '11px',
              fontFamily: 'Inter, sans-serif',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              <span>Geser kartu atau klik tombol panah ◀ ▶ untuk melihat gagasan lainnya</span>
            </div>
          </div>
        )}

        {/* TAB 3: SETTINGS */}
        {activeTab === 3 && (
          <SettingsTabContent />
        )}
      </div>

      {/* Bottom Navigation spacer to prevent overlay cutoff */}
      <div style={{ height: '24px' }} />

      {/* SHARE IMAGE MODAL */}
      {shareImageModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 12, 26, 0.5)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
          animation: 'fadeInUp 0.3s ease-out'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '28px',
            padding: '24px',
            boxShadow: '0 24px 60px rgba(15, 12, 26, 0.16)',
            border: '1px solid rgba(139, 92, 246, 0.1)',
            width: '100%',
            maxWidth: '420px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '900',
                color: '#131b2e',
                fontFamily: 'Outfit, sans-serif',
                margin: 0
              }}>
                Kartu Keputusan Rapat
              </h3>
              <button 
                onClick={() => setShareImageModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  color: '#584239',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ✕
              </button>
            </div>
            
            <p style={{ fontSize: '13px', color: '#584239', lineHeight: 1.45, margin: 0 }}>
              Berikut adalah kartu infografis resolusi tinggi hasil keputusan rapat Anda. Siap dibagikan ke X (Twitter), LinkedIn, atau media sosial lainnya.
            </p>

            {/* Image Preview Container */}
            <div style={{
              width: '100%',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.05)',
              backgroundColor: '#0f172a'
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={shareImageUrl} 
                alt="Kartu Keputusan Rapa" 
                style={{ width: '100%', display: 'block', height: 'auto' }}
              />
            </div>

            {/* Actions Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.download = `Rapa_Rapat_${code}.png`;
                  link.href = shareImageUrl;
                  link.click();
                }}
                className="btn-purple"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '16px',
                  border: 'none',
                  fontWeight: '800',
                  fontSize: '13.5px',
                  fontFamily: 'Lexend, sans-serif',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(139, 92, 246, 0.2)'
                }}
              >
                <span>💾</span>
                <span>Unduh Gambar (PNG)</span>
              </button>

              <button
                onClick={handleCopyToClipboard}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '16px',
                  border: '1.5px solid rgba(139, 92, 246, 0.3)',
                  backgroundColor: '#faf8ff',
                  color: '#8B5CF6',
                  fontWeight: '800',
                  fontSize: '13.5px',
                  fontFamily: 'Lexend, sans-serif',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#faf8ff';
                }}
              >
                <span>📋</span>
                <span>Salin Gambar</span>
              </button>

              <button
                onClick={() => setShareImageModalOpen(false)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '16px',
                  border: 'none',
                  backgroundColor: '#f1f5f9',
                  color: '#584239',
                  fontWeight: '800',
                  fontSize: '13px',
                  fontFamily: 'Lexend, sans-serif',
                  cursor: 'pointer',
                  marginTop: '4px'
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}