# VoxSilent: Market Validation Master Plan
> Version: 1.0 | Date: 2026-05-19 | Status: Ready for Implementation

---

## Executive Summary

Projek VoxSilent akan melalui **dua fase validation** sebelum investment AI:

| Phase | Timeline | Focus | Target |
|-------|----------|-------|--------|
| **A: Quick Launch** | 2-4 minggu | Landing Page + Core Voting | Collect waitlist + early adopters |
| **B: Solid MVP** | 6-8 minggu | Full meeting flow (no AI) | User testing + retention data |

**TIDAK ADA AI features** sampai market validation berhasil.
**Biaya running per bulan:** ~Rp 15.000-50.000 (Supabase free tier + hosting)

---

## Phase A: Quick Launch (2-4 Minggu)

### Fitur yang Dibangun

| Feature | Priority | Complexity | Notes |
|---------|:--------:|:----------:|-------|
| Landing Page (follow design system) | ✅ MUST | Medium | Tidak ada mention AI |
| Email capture (waitlist) | ✅ MUST | Low | Simple form |
| Coming Soon state | ✅ MUST | Low | Jangan sampai error |
| Basic Create Room (mock) | 🟡 NICE | Low | Tidak harus functional |
| Social proof placeholder | 🟡 NICE | Low | Join 200+ teams waiting |

### Landing Page Structure

- Header: LOGO + Join Room + Login (sticky)
- Hero: Headline + Email Input + CTA
- How It Works: 3 steps visual
- Amazon Method Hook: Authority builder
- Waitlist Counter: Social proof
- Footer: Privacy | Terms | Contact

---

## Phase B: Solid MVP (6-8 Minggu)

### Fitur yang Dibangun

| Feature | Priority | Complexity | Notes |
|---------|:--------:|:----------:|-------|
| Room Creation (GM) | ✅ MUST | Medium | Title, session type, participant limit |
| Join Room (Participant) | ✅ MUST | Low | Enter Room ID → join |
| Anonymous Idea Submission | ✅ MUST | Low | Text input, no identity exposed |
| Manual Grouping (GM) | ✅ MUST | High | Swipe UI untuk mobile, drag-drop untuk desktop |
| Anonymous Voting | ✅ MUST | Medium | Simple voting flow |
| Results Display | ✅ MUST | Low | Show winning ideas |
| Export to WhatsApp | ✅ MUST | Low | Share decision link |
| GM Dashboard | 🟡 NICE | Medium | Dark mode, bento grid layout |
| Meeting History | 🟡 NICE | Medium | List of past rooms/decisions |

### YANG TIDAK PERLU DIBUAT

❌ AI Clustering / Grouping
❌ Sentiment Analysis
❌ Auto MoM (Minutes of Meeting)
❌ Real-time sync (pakai polling approach)
❌ Multi-tier pricing (Free only untuk Phase B)

---

## Cost Breakdown

### Phase A (Weeks 1-4)
| Item | Cost |
|------|-----:|
| Domain | Rp 12.500/month |
| Vercel Hosting | Rp 0 (free tier) |
| Supabase | Rp 0 (free tier) |
| **TOTAL** | **~Rp 12.500/month** |

### Phase B (Weeks 5-12)
| Item | Cost |
|------|-----:|
| Domain | Rp 12.500/month |
| Vercel Hosting | Rp 0 |
| Supabase Pro (if needed) | Rp 0-200.000 |
| **TOTAL** | **~Rp 12.500-50.000/month** |

---

## Success Metrics

### Phase A Target (4 weeks)
| Metric | Target |
|--------|--------|
| Waitlist signups | 100 emails |
| Landing page visitors | 2.000 |
| Conversion rate | 5%+ |
| Bounce rate | < 60% |

### Phase B Target (8 weeks)
| Metric | Target |
|--------|--------|
| Total rooms created | 20+ |
| Returning users (week 2) | 30%+ |
| NPS Score | 40+ |

### Go/No-Go Criteria
| Criteria | Go Signal | No-Go Signal |
|----------|-----------|--------------|
| Waitlist | 100+ emails in 4 weeks | < 30 emails |
| Engagement | 20+ rooms created | < 5 rooms |
| Retention | 30%+ week 2 retention | < 10% retention |

---

## Technical Stack

- Frontend: Next.js (existing)
- State: Redux Toolkit (existing)
- Backend: Supabase (Free tier)
- Real-time: Polling (3s interval)
- Styling: CSS variables (follow design system)

---

## Implementation Timeline

### Week 1-2: Phase A
Day 1-2: Setup Supabase project + schema
Day 3-5: Landing page components
Day 6-7: ROICalculator widget + email capture
Day 8-10: Polish landing page + mobile responsive
Day 11-14: Test + launch + collect waitlist

### Week 3-4: Phase A Continuation
Day 15-18: Analyze waitlist data
Day 19-21: Early follower outreach
Day 22-28: Prepare Phase B specs

### Week 5-8: Phase B (Sprint 1)
Day 29-35: Auth + Room creation flow
Day 36-42: Participant join + idea submission
Day 43-49: Manual grouping UI (swipe/drag)
Day 50-56: Voting system

### Week 9-12: Phase B (Sprint 2)
Day 57-63: Results display + export
Day 64-70: GM Dashboard + history
Day 71-77: Polish + bug fixes
Day 78-84: User testing + iteration

---

## Next Steps

1. Day 1: Setup Supabase project, create schema
2. Day 3: Start building landing page components
3. Day 14: Launch landing page + collect waitlist
4. Week 5: Start Phase B development
5. Week 13: User testing + iteration based on feedback

*Plan ini dibuat berdasarkan design system di design/gm/voxsilent_mobile_design_system/DESIGN.md*
