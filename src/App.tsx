import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import './App.css';
import { generateAudio, TTSProvider } from './services/tts';
import { getFileService, Chapter } from './services/fileService';
import LandingPage from './components/LandingPage';

const SAMPLE_TEXTS: Record<string, string> = {
  "Pride and Prejudice": "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
  "Moby-Dick": "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.",
  "The Odyssey": "Tell me, O muse, of that ingenious hero who travelled far and wide after he had sacked the famous town of Troy.",
  "Frankenstein": "You will rejoice to hear that no disaster has accompanied the commencement of an enterprise which you have regarded with such evil forebodings."
};

function App() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<TTSProvider>('kokoro'); // Default to local
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.name.endsWith('.epub')) {
      setIsLoading(true);
      try {
        const fileService = getFileService();
        // Pass the File object directly. 
        // ElectronFileService will look for .path, WebFileService will use the File.
        const parsedChapters = await fileService.parseEpub(file);
        setChapters(parsedChapters);
      } catch (error: any) {
        console.error('Error parsing epub:', error);
        alert(`Failed to parse EPUB file: ${error.message || error}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/epub+zip': ['.epub']
    },
    noClick: chapters.length === 0 // Disable click on root if landing page is shown (dropzone is global wrapper?)
    // Actually, we probably want the dropzone to be the wrapper or specific area?
    // Let's make the dropzone wrapping ONLY relevant parts or handling drag events globally but click locally?
    // For now, let's keep it simple: Drag anywhere to load.
  });

  const getProviderLabel = (p: TTSProvider) => {
    switch (p) {
      case 'openai': return 'OpenAI';
      case 'elevenlabs': return 'ElevenLabs';
      case 'gemini': return 'Google (Gemini)';
      case 'kokoro': return 'Kokoro (Local - Free)';
      default: return '';
    }
  }

  const getPlaceholder = (p: TTSProvider) => {
    switch (p) {
      case 'openai': return 'sk-...';
      case 'elevenlabs': return 'xi-...';
      case 'gemini': return 'AIza...';
      default: return '';
    }
  }


  const handleRead = async (text: string, index: number | null) => {
    if (provider !== 'kokoro' && !apiKey) {
      alert(`Please enter your ${getProviderLabel(provider)} API Key first.`);
      return;
    }

    setIsGenerating(true);
    setCurrentChapterIndex(index);

    // Stop previous audio if any
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    try {
      const blob = await generateAudio({
        provider,
        apiKey,
        text
      });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (error: any) {
      console.error('Error generating audio:', error);
      alert(`Failed to generate audio: ${error.message || error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = (title: string, author: string) => {
    const text = SAMPLE_TEXTS[title];
    if (text) {
      // Play preview (treat as chapter -1 or just null index but playing)
      // We can set a dummy chapter
      handleRead(`Preview of ${title} by ${author}. ${text}`, null);
    } else {
      alert(`Preview for ${title} not available yet.`);
    }
  };

  return (
    <div className="container" {...getRootProps()}>
      <input {...getInputProps()} />

      {/* If we have chapters, show the Reader view */}
      {chapters.length > 0 ? (
        <div className="reader-view">
          <header className="reader-header">
            <button onClick={() => { setChapters([]); setAudioUrl(null); }} className="btn btn-outline" style={{ float: 'right', padding: '0.5rem' }}>Back</button>
            <h1>AI Audiobook Reader</h1>
          </header>

          <div className="settings-panel">
            <label>
              TTS Provider:
              <select value={provider} onChange={(e) => setProvider(e.target.value as TTSProvider)}>
                <option value="kokoro">Kokoro (Local - Free)</option>
                <option value="openai">OpenAI</option>
                <option value="elevenlabs">ElevenLabs</option>
                <option value="gemini">Google Gemini</option>
              </select>
            </label>

            {provider !== 'kokoro' && (
              <label>
                API Key:
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={getPlaceholder(provider)}
                />
              </label>
            )}
          </div>

          {isLoading && <p>Parsing EPUB...</p>}

          {chapters.length > 0 && (
            <div className="chapters-list">
              <h2>Chapters</h2>
              {chapters.map((chapter, index) => (
                <div key={index} className={`chapter-item ${currentChapterIndex === index ? 'active' : ''}`}>
                  <h3>{chapter.title}</h3>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRead(chapter.content, index); }}
                    disabled={isGenerating}
                  >
                    {isGenerating && currentChapterIndex === index ? 'Generating...' : 'Read'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {audioUrl && (
            <div className="audio-player">
              <audio controls autoPlay src={audioUrl} />
            </div>
          )}
        </div>
      ) : (
        /* Show Landing Page if no chapters/file */
        <LandingPage onPreview={handlePreview} />
      )}

      {/* Drag Overlay */}
      {isDragActive && (
        <div className="drag-overlay">
          <div className="drag-content">
            <h3>Drop EPUB here to listen!</h3>
          </div>
        </div>
      )}
    </div>
  )
}

export default App;
