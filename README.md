# Quantum Learning Studio

An AI-powered interactive quantum-computing education platform where students, researchers, and professionals can learn quantum mechanics, build circuits visually or programmatically, and receive targeted conceptual debugging.

---

## 1. Getting Started

### Prerequisites
- Node.js 20 or newer
- npm 10 or newer

### Installation
1. Clone or copy the project into your workspace.
2. Install the required dependencies:
   ```bash
   npm ci
   ```

### Development Server
Run the local Next.js development server:
   ```bash
   npm run dev
   ```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Test Execution
We use Vitest for unit and integration testing. Run the test suite with:
   ```bash
   npm test
   ```

### Production verification

```bash
npm run lint
npm test
npm run build
```

The frontend acceptance checklist, responsive matrix, image guidance, and Lighthouse budgets are documented in [`FRONTEND_QA.md`](./FRONTEND_QA.md).

---

## 2. Directory Structure

```text
src/
  app/
    layout.tsx           # Global metadata, viewport, and blocking theme script
    page.tsx             # Marketing landing page with animated circuit
    globals.css          # CSS Variables, Tailwind v4 theme, scrollbars, KaTeX styles
    auth/                # User login and registration screens
    onboarding/          # Questionnaire and diagnostic path calculations
    app/                 # Student routes wrapped in NavShell
      dashboard/         # Progress metrics, streaks, recommendations
      catalog/           # Search and filterable course catalogue
      courses/           # Course outcomes, pre-requisites, outline syllabus
      lessons/           # Interactive theory viewer, KaTeX formulas, AI tutor sidebar
      lab/               # Visual grid canvas, conversions, simulation result bars
      challenges/        # Debugging tasks and hint requests
      progress/          # Concept prerequisite mastery maps
      settings/          # Theme, font-scaling, and screen reader overrides
    instructor/          # Educator routes (anonymized rosters, misconception flags)
  components/
    layout/
      nav-shell.tsx      # Responsive sidebar/bottom navbar frame
    quantum/
      circuit-builder.tsx# Click-to-place and keyboard-accessible canvas grid
      bloch-sphere.tsx   # Responsive 2D SVG Projection with coordinates table
    learning/
      ai-tutor.tsx       # Contextual streamed chatbot with quick prompts
  stores/
    use-ui-store.ts      # Zustand client UI and accessibility variables
  lib/
    api/
      types.ts           # Strictly typed TypeScript domain interfaces
      mock-client.ts     # Service emulator with misconception checkers
    tokens/
      tokens.json        # Design Token specifications (Figma exportable)
  tests/
    circuit-builder.test.tsx # Component test for keyboard navigation
    theme-switch.test.tsx    # Test for theme toggle updates
```

---

## 3. Keyboard Accessible Circuit Builder

To meet WCAG 2.1 AA requirements, the circuit canvas in the Quantum Lab does not depend solely on mouse actions:

1. **Select a Gate**: Tab to the Gate Palette or press keys to focus a gate, then press **Enter** or **Space** to load it into the buffer.
2. **Navigate Grid Cells**: Use the **Arrow Keys** (Up, Down, Left, Right) to move the cursor focus between qubit wires and time steps on the canvas.
3. **Place the Gate**: Press **Enter** to place the buffered gate at the active cell. A hidden live announcer (`aria-live="polite"`) announces the placement to screen readers (e.g. *"Placed Hadamard gate on qubit 0 at step 0"*).
4. **Remove a Gate**: Focus any populated grid cell and press **Delete** or **Backspace** to remove the gate.

---

## 4. Design Token System

Primacy values are stored centrally in `src/lib/tokens/tokens.json` and parsed inside `@theme` in `src/app/globals.css`. Color variables are updated dynamically using classes:
- **Light mode**: Default class configuration.
- **Dark mode**: Appends the `.dark` class to the `<html>` document root, updating background variables instantly.
- **Font Scaling**: Updates the CSS root `font-size` (`14px` for small, `16px` for comfortable, `18px` for large), causing all child `rem`-based properties to scale proportionally.

---

## 5. Responsive architecture

- **320–767px:** single-column pages, mobile navigation, simplified tabbed workspaces, horizontally contained circuit canvases, and full-width primary actions.
- **768–1023px:** tablet grids, desktop sidebar navigation, responsive drawers, and collapsible data regions.
- **1024–1439px:** multi-column dashboards and expanded workspaces.
- **1440px+:** bounded 1440px content layouts with full three-region lab experiences.

All standard buttons, form fields, navigation links, and quantum-grid cells meet or exceed a 44px interaction target. The global CSS prevents page-level horizontal overflow while allowing explicitly labelled inner regions such as code blocks and data tables to scroll when their data cannot be meaningfully collapsed.

---

## 6. Backend

The application includes Next.js Route Handler APIs, a server-only data-access layer, MongoDB persistence, input validation, rate limiting, health checks, and an OpenAI-compatible AI provider with a local fallback. Configure it using `.env.example`; full setup and endpoint documentation are in [`BACKEND_SETUP.md`](./BACKEND_SETUP.md).

Chat persistence and external AI are separate learner-controlled options. The default experience remains session-local and privacy-first.

## 7. Quantum Companion

Learning routes include a compact floating chatbot named **Qubit**. It is implemented in `src/components/learning/quantum-companion.tsx`, with its local knowledge and response policy in `src/lib/quantum-companion.ts`.

Capabilities:

- Route-aware context for lessons, courses, the lab, challenges, progress and the catalog
- Beginner, intermediate and advanced explanation modes
- Curated coverage of fundamentals, algorithms, hardware, error correction, frameworks and applications
- Personalized research, industry-career and general-literacy roadmaps
- Progress summaries and next-activity suggestions
- Hint-first challenge support; full solutions are shown only when explicitly requested
- Session-only chat persistence with a 40-message limit
- Five-minute inactivity detection and page-visibility awareness
- Focus mode, minimization and `Ctrl/Cmd + /` keyboard access
- Responsive mobile placement above the bottom navigation
- Opt-in enhanced AI with automatic local fallback and response cancellation
- Optional MongoDB chat persistence, separate from external-AI consent
- Responsive mobile panel and automatic suppression beside the desktop lesson tutor

The companion calls `/api/v1/companion/chat`. The server selects the configured AI provider only after explicit consent; otherwise it answers locally. Provider failure also falls back locally so the learning session remains usable.
