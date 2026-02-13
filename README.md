1. Launch the App
Ensure the Electron window opens with the title "Epub to Audiobook".
Confirm the UI shows a "TTS Provider" dropdown and an API Key input.
2. Configure Provider
Select your desired provider from the dropdown (e.g., OpenAI, ElevenLabs, or Gemini).
Paste the corresponding API Key into the input field.
3. Upload EPUB
Drag and drop an .epub file into the target area.
Expected: A "Parsing EPUB..." message appears, followed by a list of chapters.
4. Read a Chapter
Click the "Read" button next to a chapter.
Expected:
Button text changes to "Generating...".
After a few seconds (depending on length), an audio player appears at the top.
Audio starts playing automatically.
You should hear the text content of the chapter.
5. Playback Controls
Use the audio player controls (Play/Pause, Seek, Volume) to verify they work.
Troubleshooting
Parsing fails: Ensure the EPUB is valid and not DRM-protected.
Audio not generating: Check the console (Cmd+Option+I) for errors. Verify your API Key has credits.
