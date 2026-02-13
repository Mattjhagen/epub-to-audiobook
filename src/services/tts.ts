export async function generateAudio(text: string, apiKey: string): Promise<Blob> {
    // Use the native Gemini multimodal generation capability.
    // Model: gemini-2.0-flash (or gemini-2.0-flash-exp)
    const model = 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName: "Aoede" // Options: "Puck", "Charon", "Kore", "Fenrir", "Aoede"
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

    // Parse response for audio data
    // Expected structure: candidates[0].content.parts[0].inlineData.data
    const candidate = data.candidates?.[0];
    const part = candidate?.content?.parts?.find((p: any) => p.inlineData);

    if (!part || !part.inlineData || !part.inlineData.data) {
        console.error('Unexpected Gemini response:', data);
        throw new Error('No audio content received from Gemini API. The model might have refused or generated text instead.');
    }

    const base64Audio = part.inlineData.data;
    const mimeType = part.inlineData.mimeType || 'audio/wav'; // usually audio/wav or audio/mp3

    // Decode base64 to Blob
    const byteCharacters = atob(base64Audio);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
}
