import React from 'react';

interface LandingPageProps {
    onPreview: (title: string, author: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onPreview }) => {
    return (
        <div className="landing-page">
            <header>
                <h1>AI Audiobook Reader</h1>
                <p className="subtitle">Transform any EPUB into an immersive audiobook with local, privacy-first AI voices. Powered by Kokoro TTS.</p>

                <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#64748b' }}>
                    ⚠️ Web App Demo. <br />
                    Download the desktop app for local processing of large files.
                </p>

                <div className="btn-group">
                    <a href="#download" className="btn btn-primary">Get Desktop App</a>
                </div>
            </header>

            <div className="features">
                <div className="card">
                    <h3>🔒 Local & Private</h3>
                    <p>Processing happens entirely on your device. No data is sent to the cloud.</p>
                </div>
                <div className="card">
                    <h3>🗣️ Natural Voices</h3>
                    <p>Experience high-quality, human-like narration powered by the Kokoro AI model.</p>
                </div>
                <div className="card">
                    <h3>📚 Smart Parsing</h3>
                    <p>Automatically extracts text from EPUB chapters for seamless listening.</p>
                </div>
            </div>

            <section className="public-library">
                <div className="library-header">
                    <h2>Public Library</h2>
                </div>

                <div className="book-grid">
                    <div className="book-card" onClick={() => onPreview("Pride and Prejudice", "Jane Austen")}>
                        <div className="cover-container">
                            <img src="https://covers.openlibrary.org/b/id/10521258-L.jpg" alt="Pride and Prejudice" />
                        </div>
                        <div className="book-info">
                            <h4>Pride and Prejudice</h4>
                            <p className="author">Jane Austen</p>
                            <p className="duration">~11 hours</p>
                        </div>
                    </div>

                    <div className="book-card" onClick={() => onPreview("Moby-Dick", "Herman Melville")}>
                        <div className="cover-container">
                            <img src="https://covers.openlibrary.org/b/id/7222246-L.jpg" alt="Moby Dick" />
                        </div>
                        <div className="book-info">
                            <h4>Moby-Dick</h4>
                            <p className="author">Herman Melville</p>
                            <p className="duration">~24 hours</p>
                        </div>
                    </div>

                    <div className="book-card" onClick={() => onPreview("The Odyssey", "Homer")}>
                        <div className="cover-container">
                            <img src="https://covers.openlibrary.org/b/id/8231856-L.jpg" alt="The Odyssey" />
                        </div>
                        <div className="book-info">
                            <h4>The Odyssey</h4>
                            <p className="author">Homer</p>
                            <p className="duration">~14 hours</p>
                        </div>
                    </div>

                    <div className="book-card" onClick={() => onPreview("Frankenstein", "Mary Shelley")}>
                        <div className="cover-container">
                            <img src="https://covers.openlibrary.org/b/id/8773270-L.jpg" alt="Frankenstein" />
                        </div>
                        <div className="book-info">
                            <h4>Frankenstein</h4>
                            <p className="author">Mary Shelley</p>
                            <p className="duration">~8 hours</p>
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                    <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
                        Drag & Drop your own EPUB file to start listening
                    </p>
                </div>
            </section>

            <div id="download" className="download-section">
                <h2>Download for Desktop</h2>
                <p>Current Version: v0.0.0 (Alpha)</p>

                <div className="btn-group">
                    <a href="https://github.com/Mattjhagen/epub-to-audiobook/releases/latest/download/YourAppName-Mac-0.0.0-Installer.dmg" className="btn btn-primary">
                        <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.21-1.98 1.07-3.11-1.05.05-2.31.72-3.06 1.64-.68.86-1.27 2.11-1.08 3.23 1.19.09 2.4-.62 3.07-1.76z" />
                        </svg>
                        Download for Mac
                    </a>
                </div>
            </div>

            <footer>
                <p>&copy; 2026 AI Audiobook Reader. Open Source on GitHub.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
