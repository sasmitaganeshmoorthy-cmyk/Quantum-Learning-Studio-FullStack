# Interactive 3D Frontend

The public landing page and the core learner journey use optimized local Next.js image assets and a shared cinematic interaction system.

## Interaction model

- The hero image moves subtly with fine-pointer cursor movement.
- A cursor-following cyan light reveals depth without obscuring text.
- The quantum-state glass panel uses perspective rotation and an animated orbital state.
- The Quantum Lab and framework cards use restrained pointer-based tilt and lighting.
- Touch devices receive a stable, non-tilting layout.
- `prefers-reduced-motion: reduce` disables parallax, orbital animation and floating motion.
- Dashboard, catalogue, module and lesson heroes share a reusable cursor-parallax component.
- The Quantum Lab uses a shallow cinematic command header so the circuit workspace keeps most of the viewport.
- Course, module and recommendation cards use restrained lift, depth lighting and clear focus states.

## Image assets

- `public/images/quantum/quantum-processor.jpg` — hero background.
- `public/images/quantum/quantum-torus.jpg` — Quantum Lab feature panel.
- `public/images/quantum/quantum-core.jpg` — framework-neutral platform panel.
- `public/images/quantum/dashboard-command-center.png` — learner dashboard hero.
- `public/images/quantum/learning-pathway.png` — catalogue and foundations learning visual.
- `public/images/quantum/entanglement-module.png` — entanglement module and lesson visual.
- `public/images/quantum/quantum-lab-workbench.png` — Quantum Lab command header.

The images are rendered through `next/image` with responsive `sizes`, fill positioning and priority loading only for the above-the-fold hero.

## Responsive behavior

- 320px+: single-column hero, stable cards and touch-friendly controls.
- 768px+: expanded spacing and richer section typography.
- 1024px+: split hero layout and paired 3D image cards.
- 1440px+: capped content width to preserve composition and readability.

## Main implementation files

- `src/app/page.tsx`
- `src/app/globals.css`
- `src/components/visual/interactive-page-hero.tsx`
- `src/app/app/dashboard/page.tsx`
- `src/app/app/catalog/page.tsx`
- `src/app/app/courses/[courseId]/page.tsx`
- `src/app/app/lessons/[lessonId]/page.tsx`
- `src/app/app/lab/page.tsx`

Backend routes, MongoDB integration, authentication behavior and the existing learning data flow remain unchanged.
