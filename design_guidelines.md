# Design Guidelines: VocabMaster - English Vocabulary Learning Platform

## Design Philosophy

**Vibrant, Modern & Engaging** - Inspired by Quizlet and modern edtech platforms. Focus on:
- Bold, colorful gradients and cards
- Smooth, purposeful animations (flip, slide, bounce, pulse effects)
- Gamification through visual feedback
- Card-based layouts with depth and interactivity
- Playful typography and spacious layouts

---

## Color Palette

### Primary Gradient Colors (Per Collection/Mode)
- **Blue Gradient**: `from-blue-500 to-blue-600` - Primary study mode
- **Purple Gradient**: `from-purple-500 to-purple-600` - Flashcards
- **Green Gradient**: `from-green-500 to-green-600` - Success/Mastered
- **Orange Gradient**: `from-orange-500 to-orange-600` - Achievements
- **Pink Gradient**: `from-pink-500 to-pink-600` - Featured content
- **Indigo Gradient**: `from-indigo-500 to-indigo-600` - Collections

### Semantic Colors
- Success: `#10b981` (emerald)
- Warning: `#f59e0b` (amber)
- Error: `#ef4444` (red)
- Info: `#3b82f6` (blue)

### Backgrounds
- Light: `#ffffff`
- Light Secondary: `#f9fafb`
- Dark: `#111827`
- Dark Secondary: `#1f2937`

---

## Typography

**Font Stack**: 
- Headings: `Inter, sans-serif` - Bold, modern
- Body: `System font stack` - Readable
- Monospace: `Menlo, Monaco` - For code/hints

**Hierarchy**:
- Page title: `text-4xl md:text-5xl font-extrabold`
- Section header: `text-2xl md:text-3xl font-bold`
- Card title: `text-xl font-semibold`
- Body text: `text-base font-normal`
- Small text: `text-sm text-muted-foreground`
- Flashcard word: `text-5xl md:text-6xl font-extrabold`

---

## Component Design

### Stats Cards
- Gradient backgrounds with shadow depth
- Large icon (48px) with vibrant color
- Big number display (text-3xl)
- Hover: Scale up + enhance shadow
- Animation on load: Fade in + slide up

### Collection Cards
- Gradient background using collection color
- Rounded corners: `rounded-2xl`
- Hover elevation: `hover:shadow-2xl hover:scale-105`
- Progress bar: Animated fill with gradient
- Text: White/light foreground on colored background

### Learning Cards (Quiz/Flashcard)
- Large centered card (max-w-2xl) with rounded corners
- Flashcard: 3D flip animation on click
- Quiz options: Animated slide-in, glow on hover
- Success/Error: Color burst animation, confetti-like effect

### Buttons
- Gradient backgrounds matching theme
- Hover: Brighten + shadow depth
- Active: Scale slightly (0.95)
- Disabled: Opacity reduction
- Smooth transitions: `transition-all duration-300`

### Progress Elements
- Animated progress bars with gradient fill
- Circular progress: Rotating animation
- Smooth easing: `cubic-bezier(0.4, 0, 0.2, 1)`

---

## Animations

### Entrance Animations
- **Fade In**: 300ms - Default for modals, cards
- **Slide Up**: 300ms - Content reveal
- **Bounce In**: 500ms - Achievement moments
- **Scale In**: 250ms - Interactive elements

### Interaction Animations
- **Flip**: 600ms - Flashcard reveal (3D perspective)
- **Pulse**: 2s infinite - Loading states, highlights
- **Bounce**: 500ms - Button press feedback
- **Glow**: 400ms - Focus states, correct answers

### Transition Animations
- **Page Change**: Fade out (150ms) + fade in (300ms)
- **Hover Effects**: 200ms smooth transition
- **Color Change**: 300ms smooth gradient transition

### CSS Keyframes to Add:
```css
@keyframes flip-in { /* Flashcard flip */ }
@keyframes slide-up { /* Content entrance */ }
@keyframes bounce-in { /* Achievement celebration */ }
@keyframes pulse-glow { /* Active state */ }
@keyframes gradient-shift { /* Gradient animation */ }
```

---

## Layout

### Spacing System
- Micro: `2px (0.5)`
- Small: `8px (2)`
- Medium: `16px (4)`
- Large: `24px (6)`
- XLarge: `32px (8)`

### Grid Layouts
- Stats: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`
- Collections: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Learn Mode: Centered `max-w-2xl` with `mx-auto`

### Card Styling
- Padding: `p-6 md:p-8`
- Border Radius: `rounded-2xl` (cards), `rounded-xl` (buttons)
- Shadow: `shadow-lg hover:shadow-2xl`
- Backdrop Blur: `backdrop-blur-sm` for overlays

---

## Interactive Elements

### Hover States
- Cards: Lift + shadow increase + scale 1.02
- Buttons: Brightness increase + shadow depth
- Images: Slight zoom (scale 1.03)

### Active States
- Press down (scale 0.95) with enhanced shadow
- Color intensification for selected states

### Focus States
- Focus ring: `ring-2 ring-offset-2 ring-primary`
- High contrast indicator

### Loading States
- Pulse animation on skeleton loaders
- Spinner with rotation animation
- Gradual content reveal (staggered)

---

## Page-Specific Layouts

### Dashboard
- Hero section with gradient background
- Large stat cards in colorful grid (1, 2, 3, 4 pattern matching card colors)
- "Quick Study" section with 3 large action buttons
- Collection cards in responsive grid with hover elevation
- Trending badges and achievement highlights

### Collections
- Header with hero background gradient
- Collection cards as large, vibrant tiles
- Edit/delete buttons appear on hover (not on click)
- Category color indicators (large colored dot or gradient bar)

### Learning Modes
- Large centered card with gradient header bar
- Progress bar at top with animated fill
- Question/card display area with shadow depth
- Answer buttons stack vertically with hover glow
- Result screen with celebration animation + confetti effect
- Navigation buttons with clear visual hierarchy

### Flashcard
- Front: Large bold text on gradient card, centered
- Back: Meaning + example on same card, reversed
- Flip animation: 3D rotation effect
- Navigation: Previous/Next arrows with hover effects
- Mark learned: Toggle button with visual state change

---

## Visual Effects

### Gradients
- Use vibrant, contrasting color pairs
- Apply to backgrounds, buttons, progress bars
- Animate gradient-position on hover for subtle effect

### Shadows
- Cards: `0 10px 25px rgba(0,0,0,0.1)` (light mode)
- Elevated: `0 20px 40px rgba(0,0,0,0.15)`
- Focus: Color-based glow

### Borders
- Subtle: `1px border border-gray-200/50` (light)
- Accent: `2px border` on focus states only
- Gradient borders: Using background-clip for advanced effects

---

## Accessibility

- High contrast text (minimum WCAG AA standard)
- Focus ring always visible (not removed)
- Color not sole indicator (add icons/text)
- Animation: Respects `prefers-reduced-motion`
- Touch targets: Minimum 48px
- Keyboard navigation throughout

---

## Mobile Optimization

- Stack layouts vertically
- Increase touch target sizes
- Simplify animations (reduce motion)
- Full-width cards with padding
- Readable font sizes (min 16px)
- Tap feedback: Visual color change immediately

---

## Design System Components

All built from Shadcn/UI with custom styling for:
- Buttons (all variants with gradients)
- Cards (with depth and hover effects)
- Progress bars (animated with gradients)
- Input fields (focus glow effects)
- Selects/Dropdowns (smooth open animation)
- Modals/Dialogs (fade + scale entrance)
- Toasts (slide-in from corner)
