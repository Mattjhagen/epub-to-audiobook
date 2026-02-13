
export type TTSProvider = 'openai' | 'elevenlabs' | 'gemini';

export interface TTSOptions {
    apiKey: string;
    provider: TTSProvider;
    text: string;
    voiceId?: string; // For ElevenLabs
}

export async function generateAudio(options: TTSOptions): Promise<Blob> {
    const { provider, apiKey, text } = options;

    switch (provider) {
        case 'openai':
            return generateAudioOpenAI(text, apiKey);
        case 'elevenlabs':
            return generateAudioElevenLabs(text, apiKey, options.voiceId);
        case 'gemini':
            return generateAudioGemini(text, apiKey);
        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }
}

async function generateAudioOpenAI(text: string, apiKey: string): Promise<Blob> {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'tts-1',
            input: text,
            voice: 'alloy',
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenAI API Error: ${response.status} ${response.statusText}`);
    }

    return response.blob();
}

async function generateAudioElevenLabs(text: string, apiKey: string, voiceId: string = '21m00Tcm4TlvDq8ikWAM'): Promise<Blob> {
    const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
    // Maximum characters per request for ElevenLabs is higher, but good to chunk if needed. 
    // For simplicity here we assume chapter text fits or is reasonable, 
    // but for production robust chunking is recommended.
    // The previous implementation had chunking, let's bring it back purely if we want to be safe,
    // but strict "read whole chapter" might hit limits. 
    // For this iteration, let's keep it simple as per previous "working" state, 
    // or re-implement the chunking if the user's chapters are long.
    // Let's implement basic chunking for ElevenLabs as it was in the "ElevenLabs" version.

    const chunks = splitTextIntoChunks(text, 2500);
    const audioBlobs: Blob[] = [];

    for (const chunk of chunks) {
        const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
            },
            body: JSON.stringify({
                text: chunk,
                model_id: "eleven_monolingual_v1",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                }
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail?.message || errorData.message || `ElevenLabs API Error: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        audioBlobs.push(blob);
    }

    return new Blob(audioBlobs, { type: 'audio/mpeg' });
}

async function generateAudioGemini(text: string, apiKey: string): Promise<Blob> {
    // Model: gemini-2.0-flash (Stable version should support audio now)
    // Endpoint: v1alpha
    const model = 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1alpha/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: "Please read the following text naturally and clearly. Do not add any introductory or concluding remarks, just read the text: \n\n" + text }]
            }],
            generationConfig: {
                // responseModalities is essential for audio output
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName: "Aoede"
                        }
                    }
                }
            }
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Gemini API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    const candidate = data.candidates?.[0];
    const part = candidate?.content?.parts?.find((p: any) => p.inlineData);

    if (!part || !part.inlineData || !part.inlineData.data) {
        console.error('Unexpected Gemini response:', data);
        throw new Error('No audio content received from Gemini API.');
    }

    const base64Audio = part.inlineData.data;
    const mimeType = part.inlineData.mimeType || 'audio/wav';

    const byteCharacters = atob(base64Audio);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
}

function splitTextIntoChunks(text: string, maxLength: number): string[] {
    if (text.length <= maxLength) return [text];

    const chunks: string[] = [];
    let currentChunk = '';

    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length <= maxLength) {
            currentChunk += sentence;
        } else {
            if (currentChunk) chunks.push(currentChunk.trim());
            if (sentence.length > maxLength) {
                let tempSentence = sentence;
                while (tempSentence.length > 0) {
                    chunks.push(tempSentence.slice(0, maxLength));
                    tempSentence = tempSentence.slice(maxLength);
                }
                currentChunk = '';
            } else {
                currentChunk = sentence;
            }
        }
    }
    if (currentChunk) chunks.push(currentChunk.trim());

    return chunks;
}
