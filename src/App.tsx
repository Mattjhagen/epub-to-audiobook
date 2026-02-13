import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { generateAudio, TTSProvider } from './services/tts'
import './App.css'

interface Chapter {
  id: string
  title: string
  text: string
}

const getProviderLabel = (p: TTSProvider) => {
  switch (p) {
    case 'openai': return 'OpenAI';
    case 'elevenlabs': return 'ElevenLabs';
    case 'gemini': return 'Google (Gemini)';
    case 'kokoro': return 'Kokoro (Local)';
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

function App() {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [provider, setProvider] = useState<TTSProvider>('openai')

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && file.name.endsWith('.epub')) {
      setIsLoading(true)
      try {
        // @ts-ignore
        const filePath = file.path
        const parsedChapters = await window.ipcRenderer.invoke('parse-epub', filePath)
        setChapters(parsedChapters)
      } catch (error) {
        console.error('Error parsing epub:', error)
        alert('Failed to parse EPUB file.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/epub+zip': ['.epub'] },
    multiple: false
  })

  const handleRead = async (text: string, index: number) => {
    if (provider !== 'kokoro' && !apiKey) {
      alert(`Please enter your ${getProviderLabel(provider)} API Key first.`)
      return
    }

    setIsGenerating(true)
    setCurrentChapterIndex(index)

    // Stop previous audio if any
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }

    try {
      const blob = await generateAudio({
        provider,
        apiKey,
        text
      })
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
    } catch (error: any) {
      console.error('Error generating audio:', error)
      alert(`Failed to generate audio: ${error.message || error}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="container">
      <h1>Epub to Audiobook</h1>

      <div className="config-section">
        <div className="provider-select">
          <label>TTS Provider: </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as TTSProvider)}
            className="provider-dropdown"
          >
            <option value="openai">OpenAI</option>
            <option value="elevenlabs">ElevenLabs</option>
            <option value="gemini">Gemini (Google)</option>
            <option value="kokoro">Kokoro (Local - Free)</option>
          </select>
        </div>

        {provider !== 'kokoro' && (
          <div className="api-key-section">
            <label>{getProviderLabel(provider)} API Key: </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={getPlaceholder(provider)}
              className="api-input"
            />
          </div>
        )}
      </div>

      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        {
          isDragActive ?
            <p>Drop the file here ...</p> :
            <p>Drag 'n' drop an EPUB file here, or click to select one</p>
        }
      </div>

      {isLoading && <p className="loading">Parsing EPUB...</p>}

      {audioUrl && (
        <div className="audio-player sticky-player">
          <h3>Now Playing: {currentChapterIndex !== null ? chapters[currentChapterIndex].title : ''}</h3>
          <audio controls src={audioUrl} autoPlay className="w-full" />
        </div>
      )}

      <div className="chapter-list">
        {chapters.map((chapter, index) => (
          <div key={chapter.id} className={`chapter-item ${currentChapterIndex === index ? 'active' : ''}`}>
            <div className="chapter-header">
              <h3>{chapter.title}</h3>
              <button
                onClick={() => handleRead(chapter.text, index)}
                disabled={isGenerating}
              >
                {isGenerating && currentChapterIndex === index ? 'Generating...' : 'Read'}
              </button>
            </div>
            <details>
              <summary>View Text Preview</summary>
              <p className="chapter-preview">{chapter.text.slice(0, 300)}...</p>
            </details>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
