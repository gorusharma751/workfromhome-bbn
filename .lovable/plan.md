
# Work From Home — Earning Platform

## Overview
A mobile-first web platform where users complete simple tasks (Google reviews, app ratings) to earn money. Built with React + Tailwind CSS + Supabase, featuring glassmorphism UI, smooth animations, and an integrated admin panel.

**Phase 1: UI/Design First (mock data, no backend yet)**

---

## 1. App Shell & Navigation
- Mobile app-style layout with bottom navigation bar (3 tabs): **Tasks**, **Refer & Earn**, **Profile**
- Glassmorphism theme: frosted glass cards, soft gradients (purple/blue tones), subtle shadows
- Smooth page transitions between tabs

## 2. Tasks Page
- 3D animated task cards showing: title, reward (₹), points, slots remaining, "Start Task" button
- Hover/tap animations on cards
- **Task Detail Flow** (multi-step modal):
  - Step 1: "Copy Review Text" button → copies to clipboard
  - Step 2: "Open Task Link" button → opens external link
  - Step 3: Proof submission form (screenshot upload + optional comment)
- Task status badges: Pending / Approved / Rejected

## 3. Refer & Earn Page
- Referral dashboard showing: referral code, referral link
- Copy Link, Share WhatsApp, Share Telegram buttons
- 3-level referral stats display (L1: 15%, L2: 10%, L3: 5%)
- Referral tree list and statistics (total, active, earnings)

## 4. Profile Page
- User info display: name, mobile, wallet balance, total earnings, referral code, tasks completed
- Action buttons: Withdraw, Add UPI ID, Add Binance Wallet, Install PWA, Logout
- Wallet section: Main Balance, Points, Referral Earnings

## 5. Wallet & Withdrawal UI
- Wallet overview with balance cards
- Points-to-money conversion UI
- Withdrawal form: choose UPI or Binance, enter details, submit request
- Withdrawal history with status tracking

## 6. Auth Pages
- Login / Signup screens with mobile-first design
- Referral code field on signup

## 7. Admin Panel (/admin routes)
- Admin login gate (role-based access)
- **Dashboard**: stats cards (total users, tasks, pending submissions, earnings paid)
- **Task Management**: create/edit/delete/pause tasks with all fields (title, description, review text, link, reward, points, slots, dates)
- **Submissions Panel**: table with user, task, screenshot preview, status, approve/reject buttons
- **Referral Settings**: edit L1/L2/L3 percentages, enable/disable
- **Withdraw Requests**: table with approve/reject/mark paid actions

## 8. Design System
- Glassmorphism cards with backdrop-blur and gradient borders
- Color palette: deep purple/blue gradients, glass white surfaces
- Smooth animations: fade-in, scale, slide transitions
- 3D card tilt effects on task cards
- Loading skeletons for async content

## 9. PWA Setup
- Service worker and manifest for installability
- App icons and splash screens
- "Install App" prompt on Profile page

---

**Phase 2 (future):** Connect Supabase backend — auth, database tables, file storage, edge functions for referral calculations, RLS policies, and security features (IP tracking, device fingerprinting, duplicate detection).
