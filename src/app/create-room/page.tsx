"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import SubPageShell from '../../components/layout/SubPageShell';

type SessionType = 'brainstorming' | 'direct_voting';

interface Question {
  id: string;
  text: string;
  options: string[];
  timer: number;
  timerEnabled: boolean;
}

const ShareIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;

export default function CreateRoomPage() {
  const [sessionType, setSessionType] = useState<SessionType>('brainstorming');
  const [roomName, setRoomName] = useState('');
  const [votingTopic, setVotingTopic] = useState('');
  const [participants, setParticipants] = useState(50);
  const [duration, setDuration] = useState(45);
  const [isCreated, setIsCreated] = useState(false);
  const [copied, setCopied] = useState(false);

  // Direct voting dynamic questions list (matching screen.png)
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'q1',
      text: 'What should be our main priority for Q4?',
      options: ['Focus on User Retention', 'Expand to New Markets'],
      timer: 15,
      timerEnabled: true
    }
  ]);

  const handleCopy = () => {
    navigator.clipboard.writeText('https://voxsilent.app/room/8X4-V2');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Questions dynamic helper functions
  const handleAddNewQuestion = () => {
    const newId = 'q' + Date.now();
    setQuestions(prev => [
      ...prev,
      {
        id: newId,
        text: '',
        options: ['', ''],
        timer: 15,
        timerEnabled: true
      }
    ]);
  };

  const handleDeleteQuestion = (qId: string) => {
    if (questions.length <= 1) return;
    setQuestions(prev => prev.filter(q => q.id !== qId));
  };

  const handleUpdateQuestionText = (qId: string, text: string) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, text } : q));
  };

  const handleAddOption = (qId: string) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, options: [...q.options, ''] } : q));
  };

  const handleUpdateOptionText = (qId: string, optIdx: number, val: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        const nextOpts = [...q.options];
        nextOpts[optIdx] = val;
        return { ...q, options: nextOpts };
      }
      return q;
    }));
  };

  const handleDeleteOption = (qId: string, optIdx: number) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          options: q.options.filter((_, idx) => idx !== optIdx)
        };
      }
      return q;
    }));
  };

  const handleUpdateQuestionTimer = (qId: string, timer: number) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, timer } : q));
  };

  const handleToggleQuestionTimer = (qId: string) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, timerEnabled: !q.timerEnabled } : q));
  };

  if (isCreated) {
    return (
      <SubPageShell>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div onClick={() => setIsCreated(false)} style={{ cursor: 'pointer', color: 'var(--on-surface)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </div>
            <h1 style={{ fontWeight: '800', fontSize: '20px' }}>Ruang Siap!</h1>
          </div>
          <button style={{ background: 'rgba(107,56,212,0.1)', padding: '10px', borderRadius: '50%', border: 'none', color: 'var(--secondary)', cursor: 'pointer', display: 'flex' }}>
            <ShareIcon />
          </button>
        </header>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px 24px', width: '100%', textAlign: 'center', border: '1px solid rgba(223,192,180,0.4)', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', marginBottom: '20px' }}>
            <p style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '2px', color: 'var(--outline)', marginBottom: '12px' }}>KODE RUANG ANONIM</p>
            <div style={{ fontSize: '52px', fontWeight: '900', color: 'var(--action-orange)', letterSpacing: '8px', marginBottom: '28px' }}>8X4-V2</div>
            {/* QR Mock */}
            <div style={{ width: '160px', height: '160px', margin: '0 auto 24px auto', backgroundColor: 'rgba(107,56,212,0.06)', borderRadius: '20px', border: '2px dashed rgba(107,56,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '32px' }}>📱</span>
              <span style={{ fontSize: '12px', color: 'var(--secondary)', fontWeight: '800' }}>Scan QR Code</span>
            </div>
            <h4 style={{ fontWeight: '800', fontSize: '18px', marginBottom: '6px', letterSpacing: '-0.3px' }}>{roomName || (sessionType === 'direct_voting' ? 'Anonymous Direct Vote' : 'Sesi Brainstorm Baru')}</h4>
            <span style={{
              padding: '5px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: '800',
              backgroundColor: sessionType === 'direct_voting' ? 'rgba(255,122,61,0.12)' : 'rgba(107,56,212,0.1)',
              color: sessionType === 'direct_voting' ? 'var(--action-orange)' : 'var(--secondary)',
            }}>
              {sessionType === 'direct_voting' ? 'Direct Voting' : 'Brainstorming'}
            </span>
          </div>
          <button onClick={handleCopy} className="btn btn-secondary" style={{ width: '100%', height: '56px', borderRadius: '16px', fontSize: '15px' }}>
            {copied ? '✓ Tautan Disalin!' : '📋 Salin Tautan Undangan'}
          </button>
        </div>
      </SubPageShell>
    );
  }

  return (
    <SubPageShell>
      <header style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Link href="/" style={{ color: 'var(--on-surface)', textDecoration: 'none' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </Link>
        <h1 style={{ fontWeight: '900', fontSize: '28px', letterSpacing: '-0.5px' }}>
          {sessionType === 'direct_voting' ? 'Create Vote' : 'Create Session'}
        </h1>
      </header>
      <p className="text-body" style={{ marginBottom: '24px', fontSize: '14px', lineHeight: 1.45 }}>
        {sessionType === 'direct_voting' 
          ? 'Set up your anonymous voting session.' 
          : 'Configure your room settings and choose a playbook to get started.'}
      </p>

      {/* Session Type (Primary Fork placed at top for premium layout flow) */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div onClick={() => setSessionType('brainstorming')} style={{
          flex: 1, padding: '16px', borderRadius: '20px', cursor: 'pointer',
          backgroundColor: sessionType === 'brainstorming' ? 'rgba(107,56,212,0.06)' : 'white',
          border: `2px solid ${sessionType === 'brainstorming' ? 'rgba(107,56,212,0.3)' : 'rgba(223,192,180,0.4)'}`,
          transition: 'all 0.2s',
        }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>💡</div>
          <h4 style={{ fontWeight: '800', fontSize: '14px', marginBottom: '4px' }}>Brainstorming</h4>
          <p style={{ fontSize: '12px', color: 'var(--outline)', lineHeight: 1.4 }}>Collaborative ideation phase followed by voting.</p>
        </div>
        <div onClick={() => setSessionType('direct_voting')} style={{
          flex: 1, padding: '16px', borderRadius: '20px', cursor: 'pointer',
          backgroundColor: sessionType === 'direct_voting' ? 'rgba(255,122,61,0.08)' : 'white',
          border: `2px solid ${sessionType === 'direct_voting' ? 'var(--action-orange)' : 'rgba(223,192,180,0.4)'}`,
          transition: 'all 0.2s',
        }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>🗳</div>
          <h4 style={{ fontWeight: '800', fontSize: '14px', marginBottom: '4px' }}>Direct Voting</h4>
          <p style={{ fontSize: '12px', color: 'var(--outline)', lineHeight: 1.4 }}>Skip directly to decision making (swipe voting).</p>
        </div>
      </div>

      {/* Room Name */}
      <label style={{ fontWeight: '800', fontSize: '15px', marginBottom: '8px', display: 'block', color: 'var(--on-surface)' }}>Room Name</label>
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '16px' }}>✏️</span>
        <input type="text" className="input-field" placeholder="e.g., Q3 Strategy Brainstorm" style={{ paddingLeft: '44px', height: '52px', borderRadius: '14px' }} value={roomName} onChange={e => setRoomName(e.target.value)} />
      </div>

      {/* Conditionally Render Form based on Session Type Selection */}
      {sessionType === 'brainstorming' ? (
        <>
          {/* Voting Topic */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ color: 'var(--outline)' }}>≡</span>
            <label style={{ fontWeight: '800', fontSize: '15px', color: 'var(--on-surface)' }}>Voting Topic</label>
          </div>
          <textarea className="input-field" placeholder="Describe the specific goal or topic participants will vote on..." style={{ paddingLeft: '16px', paddingTop: '14px', height: '90px', resize: 'none', borderRadius: '14px', marginBottom: '20px' }} value={votingTopic} onChange={e => setVotingTopic(e.target.value)} />

          {/* Sliders Card */}
          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '20px', border: '1px solid rgba(223,192,180,0.4)', marginBottom: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '800', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--on-surface)' }}><span style={{ color: 'var(--secondary)' }}>👥</span> Participant Limit</span>
                <span style={{ fontWeight: '900', fontSize: '17px', color: 'var(--action-orange)' }}>{participants}</span>
              </div>
              <input type="range" min={2} max={100} value={participants} onChange={e => setParticipants(+e.target.value)} style={{ width: '100%', accentColor: 'var(--action-orange)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--outline)', marginTop: '4px', fontWeight: '700' }}><span>2</span><span>100</span></div>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid rgba(223,192,180,0.3)', marginBottom: '20px' }} />
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '800', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--on-surface)' }}><span style={{ color: 'var(--tertiary)' }}>⏱</span> Session Duration</span>
                <span style={{ fontWeight: '900', fontSize: '17px', color: 'var(--action-orange)' }}>{duration}m</span>
              </div>
              <input type="range" min={15} max={120} value={duration} onChange={e => setDuration(+e.target.value)} style={{ width: '100%', accentColor: 'var(--action-orange)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--outline)', marginTop: '4px', fontWeight: '700' }}><span>15m</span><span>120m</span></div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Direct Voting Questions Dynamic List - exactly matching screen.png */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
            {questions.map((q, idx) => (
              <div key={q.id} style={{
                backgroundColor: 'white', borderRadius: '24px', padding: '24px',
                border: '1.5px solid rgba(223,192,180,0.45)', boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
                display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative'
              }}>
                {/* Card Title & Trash Delete Button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--action-orange)',
                      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '800', fontSize: '11px'
                    }}>{idx + 1}</span>
                    <span style={{ fontWeight: '800', fontSize: '15px', color: 'var(--on-surface)' }}>Question {idx + 1}</span>
                  </div>
                  {questions.length > 1 && (
                    <button 
                      onClick={() => handleDeleteQuestion(q.id)}
                      style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center' }}
                      title="Hapus pertanyaan"
                    >
                      🗑
                    </button>
                  )}
                </div>

                {/* Question Input Text Area */}
                <textarea
                  value={q.text}
                  onChange={(e) => handleUpdateQuestionText(q.id, e.target.value)}
                  placeholder="What should be our main priority for Q4?"
                  style={{
                    width: '100%', height: '80px', borderRadius: '16px', border: 'none',
                    backgroundColor: 'rgba(107, 56, 212, 0.05)', color: 'var(--on-surface)',
                    padding: '14px 16px', fontSize: '14px', fontWeight: '700', outline: 'none',
                    resize: 'none', fontFamily: 'inherit', lineHeight: 1.45
                  }}
                />

                {/* Options List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} style={{
                      display: 'flex', alignItems: 'center',
                      backgroundColor: 'rgba(107, 56, 212, 0.04)', borderRadius: '16px',
                      border: '1px solid rgba(107, 56, 212, 0.08)'
                    }}>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleUpdateOptionText(q.id, optIdx, e.target.value)}
                        placeholder={`Option ${optIdx + 1}`}
                        style={{
                          flex: 1, border: 'none', background: 'transparent', outline: 'none',
                          padding: '12px 16px', fontSize: '13.5px', fontWeight: '700',
                          color: 'var(--on-surface)', fontFamily: 'inherit'
                        }}
                      />
                      <button
                        onClick={() => handleDeleteOption(q.id, optIdx)}
                        style={{ background: 'none', border: 'none', color: 'var(--outline)', fontSize: '18px', paddingRight: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {/* Add Option dashed border button */}
                  <button
                    onClick={() => handleAddOption(q.id)}
                    style={{
                      height: '44px', width: '100%', borderRadius: '100px',
                      border: '1.5px dashed rgba(255,122,61,0.4)', backgroundColor: 'transparent',
                      color: 'var(--action-orange)', fontWeight: '800', fontSize: '13px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      cursor: 'pointer', transition: 'all 0.2s', marginTop: '4px'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,122,61,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    + Add Option
                  </button>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid rgba(223, 192, 180, 0.25)', margin: '4px 0' }} />

                {/* Individual Question Timer Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h5 style={{ fontWeight: '800', fontSize: '14.5px', color: 'var(--on-surface)', marginBottom: '2px' }}>Question Timer</h5>
                    <span style={{ fontSize: '12px', color: 'var(--outline)', fontWeight: '600' }}>Auto-close question</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {/* Timer duration pill (visible when enabled) */}
                    {q.timerEnabled && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        backgroundColor: 'rgba(107, 56, 212, 0.05)', borderRadius: '100px',
                        padding: '6px 12px', border: '1px solid rgba(107, 56, 212, 0.08)'
                      }}>
                        <span style={{ fontSize: '12px' }}>🕒</span>
                        <input
                          type="number"
                          value={q.timer}
                          onChange={(e) => handleUpdateQuestionTimer(q.id, Math.max(1, +e.target.value))}
                          style={{
                            width: '28px', border: 'none', background: 'transparent', outline: 'none',
                            textAlign: 'center', fontWeight: '800', fontSize: '13px', color: 'var(--on-surface)',
                            fontFamily: 'inherit'
                          }}
                        />
                        <span style={{ fontSize: '11px', color: 'var(--outline)', fontWeight: '700' }}>min</span>
                      </div>
                    )}

                    {/* iOS Premium Toggle Switch */}
                    <div 
                      onClick={() => handleToggleQuestionTimer(q.id)} 
                      style={{ 
                        width: '46px', 
                        height: '26px', 
                        borderRadius: '100px', 
                        backgroundColor: q.timerEnabled ? 'var(--action-orange)' : 'rgba(0,0,0,0.1)', 
                        position: 'relative', 
                        cursor: 'pointer', 
                        transition: 'background-color 0.25s',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '2px'
                      }}
                    >
                      <div style={{ 
                        width: '22px', 
                        height: '22px', 
                        borderRadius: '50%', 
                        backgroundColor: 'white', 
                        position: 'absolute', 
                        left: q.timerEnabled ? '22px' : '2px', 
                        transition: 'left 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        color: 'var(--action-orange)',
                        fontWeight: '900'
                      }}>
                        {q.timerEnabled ? '✓' : ''}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Add New Question Button */}
          <button
            onClick={handleAddNewQuestion}
            style={{
              width: '100%', height: '52px', borderRadius: '16px',
              border: '1.5px dashed var(--action-orange)', backgroundColor: 'transparent',
              color: 'var(--action-orange)', fontWeight: '800', fontSize: '14.5px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              cursor: 'pointer', transition: 'all 0.2s', marginBottom: '24px'
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,122,61,0.04)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span>📋</span>
            <span>Add New Question</span>
          </button>

          {/* Direct Voting Session Settings Card (matching screen.png) */}
          <div style={{
            backgroundColor: 'white', borderRadius: '24px', padding: '24px',
            border: '1.5px solid rgba(223, 192, 180, 0.45)', boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '16px' }}>⚙️</span>
              <h4 style={{ fontWeight: '800', fontSize: '15px', color: 'var(--on-surface)', letterSpacing: '-0.3px' }}>Session Settings</h4>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: '800', fontSize: '14px', color: 'var(--on-surface)' }}>Participant Limit</span>
              <span style={{
                backgroundColor: '#bef264', color: '#3f5d00', padding: '4px 10px',
                borderRadius: '8px', fontSize: '12px', fontWeight: '800'
              }}>{participants}</span>
            </div>

            <input 
              type="range" 
              min={2} 
              max={100} 
              value={participants} 
              onChange={e => setParticipants(+e.target.value)} 
              style={{ width: '100%', accentColor: 'var(--action-orange)', marginBottom: '4px' }} 
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--outline)', fontWeight: '700' }}>
              <span>2</span>
              <span>100</span>
            </div>
          </div>
        </>
      )}

      {/* Bottom Main Action Button */}
      <button onClick={() => setIsCreated(true)} className="btn btn-primary" style={{ width: '100%', height: '56px', borderRadius: '100px', fontSize: '16px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        {sessionType === 'direct_voting' ? (
          <>
            <span>🚀</span>
            <span>Launch Voting Room</span>
          </>
        ) : (
          <>
            <span>▶</span>
            <span>Launch Room</span>
          </>
        )}
      </button>
    </SubPageShell>
  );
}
