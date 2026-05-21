"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
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

function AnonymousAvatar({ size = 60, showExpression = true, avatarIndex = 0 }: { size?: number; showExpression?: boolean; avatarIndex?: number }) {
  const color = getAvatarColorByIndex(avatarIndex);
  const expressionOffset = 0;
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
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
  const dispatch = useAppDispatch();
  
  const isGMLoggedIn = useAppSelector((state) => state.ui.isGMLoggedIn);
  const [isStarting, setIsStarting] = useState(false);
  
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionState, setSessionState] = useState<SessionState>('waiting');
  const [sessionType, setSessionType] = useState<SessionType>('direct_voting');
  
  // Real-time Collaborative States
  const [myParticipant, setMyParticipant] = useState<RoomParticipant | null>(null);
  const [participantsList, setParticipantsList] = useState<RoomParticipant[]>([]);
  const participantCount = participantsList.length || 8; // dynamic from DB, fallback to 8
  
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
    if (sessionState === 'input') {
      dispatch(setActiveTab(1)); // Brainstorm
    } else if (sessionState === 'voting') {
      dispatch(setActiveTab(2)); // Vote
    } else if (sessionState === 'waiting' || sessionState === 'results') {
      dispatch(setActiveTab(0)); // Rooms
    }
  }, [sessionState, dispatch]);

  // Keep current slide within bounds of voting options
  useEffect(() => {
    if (currentSlide >= votingOptions.length && votingOptions.length > 0) {
      setCurrentSlide(votingOptions.length - 1);
    }
  }, [votingOptions, currentSlide]);

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
    if (!room?.id || isGMLoggedIn || myParticipant) return;
    
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
  }, [room?.id, isGMLoggedIn, myParticipant]);

  // 2. Questions & Votes Synchronization
  useEffect(() => {
    if (!room?.id) return;
    
    const loadQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('room_id', room.id)
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
          const stored = localStorage.getItem('recentRoomsParticipant');
          let list = [];
          if (stored) {
            try { list = JSON.parse(stored); } catch (e) {}
          }
          if (!Array.isArray(list)) list = [];
          
          list = list.filter((item: any) => item.code !== foundRoom.code);
          list.unshift({
            code: foundRoom.code,
            title: foundRoom.title,
            joinedAt: new Date().toISOString()
          });

          if (list.length > 5) list = list.slice(0, 5);
          localStorage.setItem('recentRoomsParticipant', JSON.stringify(list));

          setSessionType(foundRoom.sessionType as SessionType);

          const { data: qData } = await supabase
            .from('questions')
            .select('id')
            .eq('room_id', foundRoom.id);
          const qCount = qData?.length || 0;

          setSessionState(
            foundRoom.status === 'waiting' ? 'waiting' : 
            foundRoom.status === 'voting' ? 'voting' : 
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
              .eq('room_id', updatedRoom.id);
            const updatedQCount = updatedQData?.length || 0;

            setSessionState(
              updatedRoom.status === 'waiting' ? 'waiting' : 
              updatedRoom.status === 'voting' ? 'voting' : 
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
        await supabase
          .from('votes')
          .insert({
            question_id: selected,
            participant_id: pId,
            target_id: selected
          });
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="7" cy="14" r="5.2" fill="#FF7A3D" />
            <circle cx="16" cy="9" r="5.2" fill="#FF7A3D" />
            <circle cx="15.5" cy="15.5" r="4.8" fill="#FF7A3D" />
          </svg>
          <span style={{ 
            color: '#FF7A3D', 
            fontWeight: '800', 
            fontSize: '18px',
            fontFamily: 'Outfit, sans-serif',
            letterSpacing: '-0.5px'
          }}>
            VoxSilent
          </span>
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
                        .eq('room_id', room.id);
                        
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
                    if (room) await roomRepo.update(room.id, { status: 'finished' });
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
              <button
                onClick={async () => {
                  try {
                    const roomRepo = new SupabaseRoomRepository();
                    if (room) {
                      // 1. Delete old questions (cascade will delete votes)
                      await supabase
                        .from('questions')
                        .delete()
                        .eq('room_id', room.id);
                        
                      // 2. Reset session status to waiting
                      await roomRepo.update(room.id, { status: 'waiting' });
                      
                      // 3. Reset local states
                      setWinner(null);
                      setSelectedOption(null);
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
            )}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="app-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', padding: '20px 20px 120px 20px' }}>
        
        {/* WAITING STATE */}
        {sessionState === 'waiting' && (
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
              Ruang discussion
            </h1>
            
            <p style={{
              fontSize: '14px',
              color: '#584239',
              fontFamily: 'Inter, sans-serif',
              marginBottom: '24px'
            }}>
              Partisipasi anonim untuk hasil optimal
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
                {participantCount} Peserta
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
                <span>Menunggu GM memulai...</span>
              </div>
            )}
          </div>
        )}

        {/* INPUT PHASE */}
        {sessionState === 'input' && (
          <CanvasTab roomId={room?.id} isGMMode={false} />
        )}

        {/* VOTING PHASE */}
        {sessionState === 'voting' && (
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
              disabled={!selectedOption}
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

        {/* RESULTS PHASE */}
        {sessionState === 'results' && (
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
                      <div key={option.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: '700', fontFamily: 'Inter, sans-serif' }}>
                          <span style={{ color: '#131b2e', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '12px' }}>
                            {String.fromCharCode(65 + index)}. {option.text.split(': ').slice(1).join(': ') || option.text}
                          </span>
                          <span style={{ color: '#8B5CF6' }}>
                            {option.votes} vote ({percentage}%)
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
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Decision Summary */}
            <div style={{
              width: '100%',
              backgroundColor: '#eaedff',
              borderRadius: '20px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <AnonymousAvatar size={40} />
                <div>
                  <span style={{
                    fontSize: '13px',
                    color: '#584239',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    Silent Hero
                  </span>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#131b2e',
                    fontFamily: 'Outfit, sans-serif',
                    margin: 0
                  }}>
                    Penyumbang voting paling relevan
                  </h4>
                </div>
              </div>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '13px',
                color: '#584239',
                fontFamily: 'Inter, sans-serif',
                fontStyle: 'italic'
              }}>
                &quot;Keputusan final akan dikelompokkan oleh GM untuk hasil optimal&quot;
              </div>
            </div>

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
                  {questions.length}
                </span>
                <p style={{
                  fontSize: '11px',
                  color: '#584239',
                  fontFamily: 'Inter, sans-serif',
                  margin: 0,
                  marginTop: '4px'
                }}>
                  Questions
                </p>
              </div>
            </div>

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
          </div>
        )}
      </div>

      {/* Bottom Navigation - Session Status */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        backgroundColor: 'white',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        padding: '16px 20px 28px 20px',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.06)',
        zIndex: 20
      }}>
        {/* Session Type Indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: sessionState === 'waiting' ? '#8B5CF6' : sessionState === 'input' ? '#FF7A3D' : sessionState === 'voting' ? '#BEF264' : '#06b6d4',
            animation: 'pulseScale 2s ease-in-out infinite'
          }} />
          <span style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#584239',
            fontFamily: 'Lexend, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {sessionState === 'waiting' ? 'Menunggu' : 
             sessionState === 'input' ? 'Input' : 
             sessionState === 'voting' ? 'Voting' : 'Selesai'}
          </span>
        </div>
        
        {/* Active Members Avatars Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '-8px',
          position: 'relative',
          paddingTop: '6px' // space for the crown
        }}>
          {/* 1. GM Avatar (Always present with a crown) */}
          <div style={{ 
            position: 'relative', 
            zIndex: 10,
            marginRight: '2px'
          }}>
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '50%',
              transform: 'translateX(-50%) rotate(-5px)',
              fontSize: '14px',
              zIndex: 15,
              filter: 'drop-shadow(0 2px 4px rgba(255, 122, 61, 0.25))'
            }}>
              👑
            </div>
            <AnonymousAvatar size={36} showExpression={true} avatarIndex={0} />
          </div>

          {/* 2. Participant Avatars */}
          {participantsList.length > 0 ? (
            participantsList.slice(0, 4).map((p, i) => {
              let avatarIdx = i + 1; // offset from GM
              if (p.avatarSeed) {
                let hash = 0;
                for (let c = 0; c < p.avatarSeed.length; c++) {
                  hash = p.avatarSeed.charCodeAt(c) + ((hash << 5) - hash);
                }
                avatarIdx = Math.abs(hash);
              }
              return (
                <div 
                  key={p.id} 
                  style={{ 
                    marginLeft: '-8px',
                    zIndex: 9 - i
                  }}
                >
                  <AnonymousAvatar size={36} showExpression={false} avatarIndex={avatarIdx} />
                </div>
              );
            })
          ) : (
            Array.from({ length: Math.min(participantCount, 4) }).map((_, i) => (
              <div 
                key={i} 
                style={{ 
                  marginLeft: '-8px',
                  zIndex: 9 - i
                }}
              >
                <AnonymousAvatar size={36} showExpression={false} avatarIndex={i + 1} />
              </div>
            ))
          )}
          {participantsList.length > 4 && (
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#eaedff',
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '-8px',
              fontSize: '11px',
              fontWeight: '700',
              color: '#8B5CF6',
              fontFamily: 'Lexend, sans-serif',
              zIndex: 4
            }}>
              +{participantsList.length - 4}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}