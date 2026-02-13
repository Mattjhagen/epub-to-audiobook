# EPUB to Audiobook Utility

A web application that converts EPUB ebooks into audiobooks using high-quality Text-to-Speech (TTS) technology. Built with React, TypeScript, and Vite, with optional Electron desktop packaging.

## Features

- **EPUB Parsing**: Drag and drop EPUB files to automatically extract chapters and text.
- **Multiple TTS Providers**:
  - **OpenAI**: High-quality, natural-sounding voices (requires API Key).
  - **ElevenLabs**: Premium, ultra-realistic voices (requires API Key).
  - **Gemini (Google)**: Cost-effective and fast generation (requires API Key).
  - **Kokoro (Local)**: High-quality, completely free, and offline-capable TTS running directly on your device.
- **Audio Playback**: Integrated audio player with auto-play functionality for generated chapters.
- **Chapter Managment**: View chapter list and generate audio for specific sections.

## Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd epub-to-audiobook
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

## Usage (Web App)

1.  **Start the application**:
    ```bash
    npm run dev
    ```

2.  **Open in browser**:
    - Vite prints a local URL (usually `http://localhost:5173`).

3.  **Select TTS Provider**:
    - Choose your preferred provider from the dropdown.
    - If using OpenAI, ElevenLabs, or Gemini, enter your API Key.
    - If using **Kokoro**, no API key is needed (it runs locally).

4.  **Load EPUB**:
    - Drag and drop an `.epub` file into the dropzone.

5.  **Generate Audio**:
    - Click the **Read** button next to any chapter to generate audio.
    - The audio will start playing automatically once generated.

## Development

- **Frontend**: React + TypeScript + Vite
- **Desktop Packaging (Optional)**: Electron
- **Local AI**: `kokoro-js` (ONNX runtime)

## Building for Production (Web)

To build the web app:

```bash
npm run build
```

The web output is written to `dist/`.

## Optional Desktop Build

To run and package the Electron desktop version:

```bash
npm run dev:desktop
npm run build:desktop
```
