# Lotto Number Generator

## Overview

A web application that generates and displays random lottery numbers.

## Project Details

### Style and Design
*   **Layout:** A centered container for the lottery number generator.
*   **Typography:** Clear, readable font for the title and numbers.
*   **Color Scheme:** A vibrant, energetic palette using linear gradients and high-concentration hues.
*   **Effects:** 
    *   Glassmorphism (blur, semi-transparent border).
    *   Multi-layered drop shadows for depth.
    *   Subtle noise texture for a premium feel.
    *   Interactive glow effects on buttons.
*   **Animations:** Staggered "pop-in" animation for generated numbers.

### Features
*   **Number Generation:** Generates 6 unique random numbers between 1 and 45.
*   **Display:** Displays the generated numbers in colored circles with staggered animations.
*   **Interaction:** A button to trigger the generation of new numbers with visual feedback.
*   **Accessibility:** Screen reader support for generated numbers.

## Current Task: Enhancing Aesthetics & Animations

### Plan
1.  **Visual Enhancements (`style.css`):**
    *   Add a subtle noise texture to the body background.
    *   Implement multi-layered "lifted" shadows for the number balls.
    *   Add a "glow" effect to the "Generate" button on hover.
    *   Improve the container's glassmorphism effect.
2.  **Animations (`style.css` & `main.js`):**
    *   Define a `@keyframes` animation for the number balls to "pop in" with a slight bounce.
    *   Update `main.js` to apply the animation to each ball with a staggered delay for a more dynamic feel.
3.  **Accessibility Improvements:**
    *   Add `aria-live="polite"` to the numbers container to announce new numbers to screen readers.
    *   Ensure the button has proper focus states.
