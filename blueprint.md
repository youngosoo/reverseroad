# Local WAV to MP3 Converter

## Overview

A high-performance, privacy-focused web application that converts WAV files to MP3 format locally in the browser. No audio data is uploaded to a server, ensuring total privacy.

## Project Details

### Style and Design
*   **Framework:** Tailwind CSS for modern, utility-first styling.
*   **Theme:** Deep slate/indigo dark theme with glassmorphism effects.
*   **Typography:** Inter and Noto Sans KR for a clean, professional look.
*   **Components:** 
    *   Sticky header with status indicators.
    *   Drag & Drop file upload zone.
    *   Interactive bitrate configuration.
    *   Progress monitoring dashboard.
    *   Embedded audio player for results.

### Features
*   **Local Encoding:** Uses `lamejs` for client-side MP3 encoding.
*   **Privacy First:** All processing happens in the browser's memory.
*   **Metadata Analysis:** Parses WAV headers to display technical details (samplerate, channels, etc.).
*   **Non-blocking Processing:** Implements an asynchronous chunked renderer to keep the UI responsive during conversion.
*   **Download Options:** Allows saving the converted MP3 and the entire app as a standalone HTML file.
*   **Theme Management:** Professional dark/light themes with persistence.
*   **Partnership Inquiry:** Formspree-powered business inquiry form with specific fields.
*   **Ad Integration:** Google AdSense placeholders for monetization.

## Completed Tasks

1.  **Pivot:** Refactored the entire project from a Lotto Generator to an Audio Converter.
2.  **Core Implementation:** Integrated WAV parsing and MP3 encoding logic.
3.  **UI/UX:** Designed a modern dashboard with real-time feedback and technical details.
4.  **Security:** Ensured no external tracking or server-side dependencies for audio data.
5.  **Theme & Navigation:** Added Dark/Light mode toggle and a top navigation menu.
6.  **Inquiry Form:** Integrated Formspree with business fields and automatic redirection.
7.  **Monetization:** Added Google AdSense script and responsive ad unit placeholders.
