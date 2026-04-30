# Product Requirements Document (PRD): EpingJourney MVP

**Version:** 1.0  
**Status:** Draft  
**Product Manager:** Gemini (Parenting Startup PM)  
**Date:** April 2024

---

## 1. Project Overview
**EpingJourney** is a mobile-responsive web application designed specifically for "Exclusively Pumping" (EP) mothers. The application focuses on reducing the cognitive load of tracking milk output and managing a demanding 24-hour pumping schedule.

---

## 2. Problem Statement
Exclusively pumping is a logistics-heavy commitment. Moms often face "pumping brain"—extreme fatigue that makes calculating intervals and remembering output volumes difficult. Current solutions are either overly complex or too rigid to account for life's interruptions (e.g., a baby waking up late).

---

## 3. Target Audience
* **Primary:** Mothers who are exclusively pumping (EP).
* **Secondary:** Breastfeeding mothers who pump occasionally to build a stash.
* **Persona:** "The Logistics Mom" — Needs to know exactly when her next session is so she can plan her chores, sleep, and childcare around it.

---

## 4. MVP Feature Set (Phase 1)

### 4.1 Hybrid Tracker & Timer
* **Feature:** A one-tap timer located directly within the schedule view.
* **Functionality:**
    * Start/Stop timer for live sessions.
    * Manual entry for sessions missed in real-time.
    * Persistence: Timer must continue running even if the browser tab is closed (via LocalStorage).
* **User Value:** No more mental math on session duration.

### 4.2 "Hybrid" Smart Scheduler
* **Feature:** A dynamic schedule based on user-defined intervals.
* **Logic:**
    * Users set a "Frequency" (e.g., every 3 hours).
    * The app projects a 24-hour schedule (Today and Tomorrow).
    * **Shift Logic:** If a pump is finished later than scheduled, the app prompts: *"Would you like to shift your remaining sessions today?"*
* **User Value:** Provides structure while allowing for the unpredictability of parenting.

### 4.3 Output Tracking (The "Total")
* **Feature:** Volume input immediately following a session.
* **Functionality:**
    * Input in Ounces (oz) or Milliliters (ml).
    * Daily Total: A running sum of milk collected for the current day.
* **User Value:** Immediate gratification and data for tracking supply health.

---

## 5. User Experience & Design Requirements

### 5.1 The "3 AM" UI
* **Dark Mode:** Default high-contrast dark theme to prevent eye strain during night sessions.
* **One-Handed Operation:** Primary buttons (Start/Stop/Save) must be large and placed in the "Thumb Zone" (bottom 30% of the screen).

### 5.2 Accessibility
* **High Contrast:** Clear visual distinction for "Overdue" (Amber/Red) vs. "Upcoming" (Blue) sessions.

---

## 6. Technical Requirements
* **Platform:** Responsive Web / Progressive Web App (PWA).
* **Offline Support:** Basic capability to log a pump without an active internet connection.
* **Data Schema:**
    * `session_id`: Unique ID.
    * `start_time`: Timestamp.
    * `end_time`: Timestamp.
    * `volume`: Decimal.
    * `interval_pref`: Integer (minutes).

---

## 7. Success Metrics
* **Retention:** 60% of users logging at least 5 sessions per day for the first week.
* **Efficiency:** Average time to log a session (from site open to timer start) < 3 seconds.

---

## 8. Future Roadmap
* **Milk Stash Management:** Fridge/Freezer inventory tracking.
* **Reminders:** Push notifications for upcoming sessions.
* **Export:** CSV export for Pediatrician or Lactation Consultant visits.
