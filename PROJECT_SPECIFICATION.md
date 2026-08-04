# Recomp: End-to-End System Specification & Architecture Document

**Version:** 2.4.0  
**Date:** August 2026  
**Status:** Living Specification & Production Baseline  

---

## 1. Executive Summary & Vision

**Recomp** is a body recomposition tracking platform designed for athletes, fitness enthusiasts, and body recomposition practitioners. Unlike traditional weight-loss calorie counters, Recomp evaluates concurrent muscle gain (hypertrophy) and fat loss (lipolysis) using dual-metric target analytics, Evolt 360 body composition scan integration, and tactile edge gesture interactions.

### Core Objectives
1. **Precision Nutrition Tracking:** High-density, progressive disclosure logging for Calories, Protein, Carbs, Fats, Fiber, and key micronutrients.
2. **Body Composition vs. Scale Weight:** Integration of 5-point DEXA/Evolt 360 scan metrics (Skeletal Muscle Mass, Fat Mass, Visceral Fat Rating, Body Fat %, Lean Mass) alongside scale weight.
3. **Calm, Tactile Edge Gesture Navigation:** Edge drag gestures featuring a luminous 50% width overlay with haptic ticks instead of traditional pagination buttons.
4. **Multi-Modal Fast Logging:** AI Voice parsing, Barcode Scanning, Multimodal Photo Analysis, and Quick Search.

---

## 2. Design System & Visual Architecture

### 2.1 Color Palette & Neutrals
Recomp utilizes a dark theme (`#090A0F` base canvas) engineered to eliminate high-contrast glare while maintaining WCAG AAA legibility.

| Token | Hex / CSS Value | Description & Purpose |
| :--- | :--- | :--- |
| **Canvas Base** | `#090A0F` | Deep dark obsidian base shell |
| **Container Surface** | `#0D0E12` | Elevation Layer 1: Main screen wrapper |
| **Card Surface** | `#181A20` | Elevation Layer 2: Interactive cards, inputs & banners |
| **Card Border** | `rgba(255, 255, 255, 0.1)` | 1px hairline border separation |
| **Accent Primary** | `#6366F1` / `indigo-500` | Calories, primary CTAs, active tab accents |
| **Accent Secondary**| `#10B981` / `emerald-500`| Protein, muscle gain, positive trends, gesture overlays |
| **Warning / Fat** | `#F59E0B` / `amber-500` | Fat macros, visceral fat alerts |
| **Muted Text** | `#A1A1AA` / `zinc-400` | Secondary metadata, labels, timestamps |

### 2.2 Typography & Scale
- **Primary Sans:** Inter / System UI Font Stack
- **Display Headings:** Plus Jakarta Sans (`font-black`, `tracking-tight`)
- **Mathematical Scale:** Major Second (1.125) for dense data clarity.

```
Hero Display:     28px / 1.2 line-height / font-black
Section Title:    18px / 1.3 line-height / font-bold
Card Title:       14px / 1.4 line-height / font-black
Body Text:        14px / 1.5 line-height / font-normal
Subtext / Label:  11px / 1.4 line-height / font-bold / uppercase tracking-wider
```

### 2.3 Edge Gesture Interaction System
Inspired by iOS / VisionOS tactile edge gestures, day navigation uses an Edge Drag Gesture:

1. **Touch Zone:** User touches near the left or right edge of the screen and drags horizontally.
2. **Luminous Overlay:** A gradient overlay (`from-emerald-600/80 via-emerald-500/45 to-transparent`) expands smoothly from the screen edge matching finger displacement up to **50% of screen width**.
3. **Progressive Labeling:** Displays directional arrows (`← Yesterday` or `Tomorrow →`), contextual subtitle text (`Drag right to reveal`), and a threshold meter bar.
4. **Haptic Feedback:**
   - **Threshold Tick:** 10ms haptic vibration when crossing the 50% screen width mark (`~160px`).
   - **Confirmation Pulse:** Patterned haptic pulse (`[12ms, 18ms]`) upon releasing past the threshold as the new day settles into view.
5. **Reversibility:** Releasing before the threshold smoothly collapses the overlay back into the edge without changing dates.

---

## 3. Screen-by-Screen Component Architecture

```
App Shell (App.tsx)
├── NavigationHeader
├── Primary Views (AnimatePresence Container)
│   ├── FoodHomeView (Log Tab)
│   ├── BodyView (Body Tab)
│   ├── ProgressView (Progress Tab)
│   └── ProfileView (Profile Tab)
├── BottomNavBar (Fixed Navigation)
└── Modal Stack (Lazy Rendered Overlays)
    ├── EvoltUploadModal
    ├── LogFoodModal
    ├── BarcodeScannerModal
    ├── PhotoLogModal
    ├── VoiceLogModal
    ├── FoodSearchModal
    ├── FoodDetailView
    ├── LoggedFoodDetailModal
    ├── NutrientDetailModal
    ├── OnboardingWizard
    ├── SpecExportModal
    └── SignInModal
```

### 3.1 Log View (`FoodHomeView.tsx`)
- **Date Header:** Centered date banner displaying current date, day name, and quick datepicker trigger.
- **Calorie & Protein Dual Cards:**
  - Real-time consumed vs. remaining macro targets.
  - Interactive progress meters with dynamic visual state changes upon goal completion.
- **Carbs, Fat, Fiber Breakdown Bar:** Mini progress pills for secondary macronutrients with click-to-view micronutrient details.
- **Meal Category Accordions:**
  - Breakfast, Lunch, Dinner, Snacks.
  - Logged food list items showing brand, serving counts, calories, and protein.
  - Long-press / context menu to move meals between categories or change serving sizes.

### 3.2 Body View (`BodyView.tsx`)
- **Current Weight Card:** Displaying scale weight, target weight, and recent weight change trends.
- **Evolt 360 Scan Scanner & Manual Entry Card:**
  - Upload PDF / Image trigger for automated OCR parsing of Evolt 360 printouts.
  - Interactive 5-point body composition breakdown:
    1. **Skeletal Muscle Mass (SMM)**
    2. **Total Body Fat Mass (FM)**
    3. **Body Fat Percentage (BFP)**
    4. **Visceral Fat Rating (VFR)**
    5. **Total Lean Mass**
- **Historical Scan Log Timeline:** Chronological list of past scan logs with edit, deletion, and comparison capabilities.

### 3.3 Progress View (`ProgressView.tsx`)
- **Recomposition Matrix Index:** Ratio algorithm quantifying concurrent muscle gain and fat reduction.
- **Interactive Recharts Charts:**
  - Weight vs. Skeletal Muscle Mass trendlines.
  - Body Fat % vs. Fat Mass trajectories.
  - Caloric adherence consistency chart over 7, 30, and 90-day periods.
- **Projected Recomp Completion Timeline:** Algorithmic estimated completion date based on current caloric deficit and protein intake.

### 3.4 Profile View (`ProfileView.tsx`)
- **User Demographics:** Name, Age, Gender, Height, Activity Level, Fitness Goal (Recomp / Cut / Lean Bulk).
- **Automated Macro & BMR Calculator:**
  - Mifflin-St Jeor BMR & TDEE calculation engine.
  - Customizable calorie and protein target sliders.
- **Specification & Documentation Export Trigger:** Dedicated modal trigger to review and export the full project specification document.

---

## 4. Modal & Tool Ecosystem

### 4.1 Evolt 360 OCR Upload Modal (`EvoltUploadModal.tsx`)
- Supports drag-and-drop PDF scan report uploads or manual parameter override.
- Extracts parameters automatically: Weight, SMM, Fat Mass, Lean Mass, Visceral Fat, Body Fat %, Total Body Water, and BMR.

### 4.2 Multi-Modal Logging Tools
- **Voice Logger (`VoiceLogModal.tsx`):** Natural speech-to-text parsing converting queries like "2 scrambled eggs and 1 slice of whole wheat toast for breakfast" into structured food items.
- **Barcode Scanner (`BarcodeScannerModal.tsx`):** Camera stream scanner integrating OpenFoodFacts API lookups with offline product fallback database.
- **Photo Food Logger (`PhotoLogModal.tsx`):** Visual recognition AI simulation estimating portion size, macro split, and calorie count.
- **Food Search Modal (`FoodSearchModal.tsx`):** Database lookup spanning USDA databases, branded items, and custom user-created recipes.

---

## 5. Technical Stack & Data Persistence

- **Frontend Runtime:** React 18+, TypeScript 5+, Vite, Tailwind CSS v4
- **Animation Framework:** `motion/react` (Framer Motion v11+)
- **Icons Library:** `lucide-react`
- **Charts Library:** `recharts`
- **Data Persistence Strategy:** LocalStorage engine syncing across `recomp_user_profile`, `recomp_logged_entries`, `recomp_weight_entries`, and `recomp_bodyscan_entries`.

---
*End of Specification Document*
