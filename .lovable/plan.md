## Goal

Transform the Marketplace from a static editorial grid into a fun, intuitive browsing experience — without losing the premium light/editorial aesthetic established on the rest of the site.

## What changes

### 1. Hero strip with live stats
Replace the plain header with a compact, animated banner:
- Animated counters: total agents, total sales, average price, unique creators
- Subtle floating gradient blob behind the title (reuse existing blob assets)
- Friendlier subtitle copy and a "Surprise me" button that scrolls to a random agent

### 2. Smarter, more playful filter bar (sticky)
- Sticky on scroll so filters stay accessible
- Replace the native `<select>` with a styled dropdown (shadcn Select) matching the rest of the UI
- Category buttons get emoji/icon glyphs + active count badge (e.g. "Trading · 4")
- Add a price range slider (min/max 0G)
- Add a quick-toggle row: "Newest", "Trending 🔥", "Under 1 0G", "Top creators" — one-tap presets
- Active-filter chips appear below with an "x" to remove and a "Clear all" link
- Search gets ⌘K keyboard shortcut hint and live result count

### 3. View toggle: Grid ↔ List
- Grid (current) for visual browsing
- List view for dense scanning: thumbnail, name, category tag, price, owner, sales — sortable column headers
- Toggle persists in localStorage

### 4. Richer Agent Cards
- Hover: card lifts subtly (translateY + soft shadow), accent gradient sweeps the top border
- Add a small sparkline / sales pill ("▲ 24 sales") for social proof
- "New" ribbon for agents listed in the last 7 days
- Quick-peek: hovering shows a "View details →" affordance with a micro-animation
- Tap-to-favorite heart (localStorage), with a "Favorites" filter preset

### 5. Empty & loading states with personality
- Skeletons shimmer instead of plain pulse
- Empty state: friendly illustration/emoji + "Reset filters" CTA
- First-visit tooltip on the search bar (dismissible)

### 6. Micro-interactions
- Stagger card entrance using framer-motion (already installed)
- Filter changes animate the grid with FLIP-style layout transitions (`layout` prop on motion.div)
- Soft haptic-feel button press (scale 0.97 on tap)

## Technical notes

- All new UI uses existing semantic tokens from `src/styles.css` — no raw colors
- Sticky filter bar via `sticky top-0` with a translucent backdrop blur
- Price slider: shadcn `Slider`; dropdowns: shadcn `Select`; chips: small custom component reused from filter bar
- Persist view mode + favorites in `localStorage` (no backend needed)
- Stats computed client-side from the existing `useAgents()` hook
- Keep the `text-lg font-serif font-semibold` body styling on the wrapper as-is
- Files touched: `src/routes/marketplace.tsx`, `src/components/AgentCard.tsx`, plus a new `src/components/MarketplaceFilters.tsx` to keep the route clean

## Out of scope
- No changes to home, dashboard, agent detail, or contract logic
- No new dependencies (uses existing framer-motion, lucide-react, shadcn/ui)
