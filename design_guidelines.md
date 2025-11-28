# Design Guidelines: English Vocabulary Learning Platform

## Design Approach

**Selected Framework:** Hybrid approach combining Material Design principles with educational app patterns inspired by Duolingo and Quizlet. Focus on clarity, engagement, and learning-first interactions.

**Core Principles:**
- Learning-optimized: Remove distractions, focus attention on vocabulary content
- Progressive disclosure: Show information as needed, not all at once
- Immediate feedback: Visual responses to user actions (correct/incorrect answers, progress updates)
- Gamification elements: Subtle progress indicators and achievement moments

---

## Typography System

**Font Families:**
- Primary: Inter (headings, UI elements) - CDN via Google Fonts
- Secondary: System font stack for body text (reading optimization)

**Hierarchy:**
- Page titles: text-4xl font-bold (36px)
- Section headers: text-2xl font-semibold (24px)
- Card titles: text-lg font-medium (18px)
- Body text: text-base (16px)
- Vocabulary words (flashcards): text-3xl font-bold (30px)
- Small labels/hints: text-sm (14px)

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, and 16 consistently
- Component padding: p-6 or p-8
- Card spacing: gap-4 or gap-6
- Section margins: mb-8 or mb-12
- Button padding: px-6 py-3

**Grid Structure:**
- Dashboard: 2-column layout (lg:grid-cols-2) for stats cards
- Vocabulary lists: Single column cards with proper spacing
- Quiz mode: Centered single-column layout (max-w-2xl)
- Collections grid: 3-column (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)

---

## Component Library

### Navigation
- Top navigation bar with logo, main nav links, user profile dropdown
- Sticky header with subtle shadow on scroll
- Mobile: Hamburger menu with slide-in drawer

### Dashboard Components
**Stats Cards (4 cards in 2x2 grid):**
- Total words learned
- Current streak
- Study time this week
- Vocabulary collections count
Each card: rounded-xl, p-6, shadow-sm with icon, large number, and descriptive label

**Recent Collections List:**
- Card-based list showing collection name, word count, last studied date, progress bar
- Click to enter collection

### Vocabulary Management
**Collection Cards:**
- Rounded corners (rounded-xl), p-6
- Collection name (text-xl font-semibold)
- Word count badge
- Progress indicator (circular or linear)
- Quick action buttons (study, edit, delete)

**Vocabulary Entry Cards:**
- Word in bold (text-2xl)
- Meaning below (text-base)
- Example sentence in italics (text-sm)
- Edit/delete icons in top-right corner

**Import Interface:**
- Drag-and-drop zone with dashed border
- File upload button
- CSV/JSON format instructions

### Learning Modes

**Multiple Choice Quiz:**
- Question card at top: "What does [word] mean?"
- 3 answer buttons stacked vertically (w-full, p-4, rounded-lg, text-left)
- Correct answer: green background with checkmark
- Incorrect answer: red background with X
- Progress bar at top showing question number
- Next button appears after answer selection

**Flashcard Mode:**
- Large centered card (max-w-lg, aspect-square approximation)
- Front: English word (text-4xl, centered)
- Back: Meaning + example (revealed on flip)
- Flip animation on click
- Previous/Next navigation arrows
- "Mark as learned" button below card

**Spelling Test:**
- Word pronunciation (audio icon or text hint)
- Large text input field (text-2xl, p-4, rounded-lg)
- Submit button
- Instant feedback (correct: green border, incorrect: red border with correct answer shown)

### Forms
**Profile Update:**
- Avatar upload with preview (circular, 80px diameter)
- Text inputs for username, email
- Password change section (collapsible)
- Save changes button (primary CTA)

**Collection Creation/Edit:**
- Collection name input
- Optional description textarea
- Color picker or preset color options for collection theme
- Save button

### Progress Tracking
**Per-Collection Progress:**
- Horizontal progress bar (h-2, rounded-full)
- Percentage label
- "Words mastered" vs "Total words" counter
- Last studied timestamp

**Global Dashboard:**
- Weekly study calendar heatmap
- Pie chart or bar graph for words by collection
- Recent activity timeline

---

## Images

**No Traditional Hero Image:** This learning platform prioritizes immediate functionality over marketing aesthetics. Users should land directly on their dashboard or learning interface.

**Illustrations/Icons:**
- Use Heroicons (outline style) throughout for consistency
- Empty states: Add simple educational illustrations (books, lightbulbs, graduation caps) via placeholder comments
- Achievement moments: Celebratory icons when completing a quiz or reaching milestones

---

## Interaction Patterns

**Card Interactions:**
- Hover: subtle shadow increase (hover:shadow-lg transition)
- Active learning cards: Scale slightly (hover:scale-105)

**Button States:**
- Primary CTA: Solid background, white text
- Secondary: Outline style
- Danger (delete): Red treatment
- All buttons: px-6 py-3, rounded-lg, font-medium

**Feedback Mechanisms:**
- Loading states: Spinner for async operations
- Success messages: Toast notifications (top-right corner)
- Error messages: Inline below form fields with red text-sm
- Quiz feedback: Immediate visual change (green/red) with brief animation

**Animations:** Minimal and purposeful
- Flashcard flip: 3D rotation transition
- Progress bar fills: Smooth animation over 0.5s
- Page transitions: Subtle fade-in

---

## Accessibility

- Focus states: 2px solid ring on all interactive elements
- High contrast text (minimum WCAG AA)
- Keyboard navigation for all learning modes
- ARIA labels for icon-only buttons
- Skip to content link

---

## Responsive Behavior

**Mobile (< 768px):**
- Single column layouts
- Full-width buttons
- Stacked navigation
- Touch-optimized tap targets (min 44px)

**Tablet (768px - 1024px):**
- 2-column grids where appropriate
- Sidebar navigation remains accessible

**Desktop (> 1024px):**
- Multi-column layouts
- Persistent sidebar for collections
- Larger flashcard sizes

---

## Page-Specific Layouts

**Landing/Login Page:** Centered authentication form (max-w-md), logo above, simple illustration to the side on desktop

**Dashboard:** 2-column stats grid at top, recent collections list below, quick action CTA for "Study Now"

**Collection View:** List of vocabulary cards with search/filter bar, add new word CTA prominent

**Learning Mode Pages:** Centered content (max-w-2xl), minimal distractions, progress always visible at top