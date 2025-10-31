import React, { useState, useEffect, useContext, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { AppContext } from '../context/AppContext';
import { Analysis } from '../types';
import { XIcon, MicIcon, MicOffIcon } from './icons';
import { createBlob, decode, decodeAudioData } from '../utils/audioUtils';
import { LiveWaveform } from './LiveWaveform';

interface LiveChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: Analysis;
}

type SessionStatus = 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'ERROR' | 'CLOSED';

const createLiveSystemPrompt = (analysis: Analysis): string => {
  const investmentThesisText = Array.isArray(analysis.fullAnalysis.investmentThesis)
    ? analysis.fullAnalysis.investmentThesis.join('\n')
    : analysis.fullAnalysis.investmentThesis;

  return `You are the legendary venture capital analyst who performed the original analysis for '${analysis.companyName}'. You are now in a live voice Q&A session to discuss your findings. Be conversational, direct, and insightful.

  **IMPORTANT: You MUST detect the language the user is speaking and respond fluently in that same language.**

  Your knowledge base is the analysis you already completed:
  - Recommendation: ${analysis.recommendation} (Score: ${analysis.score}/100, Confidence: ${analysis.confidence})
  - Summary: ${analysis.fullAnalysis.executiveSummary}
  - Investment Thesis: ${investmentThesisText}
  - Key Risks: ${analysis.fullAnalysis.keyRisks.map(r => `${r.risk} (Severity: ${r.severity})`).join(', ')}

  Answer questions concisely based on this data. If the original analysis lacks certain information, state that clearly. If a question requires new, up-to-the-minute information beyond the report, use your general market knowledge and search abilities to provide a relevant, current answer.
  `;
};

export const LiveChatModal: React.FC<LiveChatModalProps> = ({ isOpen, onClose, analysis }) => {
  const { setToast } = useContext(AppContext);
  const [status, setStatus] = useState<SessionStatus>('IDLE');
  const [error, setError] = useState<string | null>(null);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const inputAnalyserNodeRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserNodeRef = useRef<AnalyserNode | null>(null);

  const cleanup = () => {
      if (sessionPromiseRef.current) {
          sessionPromiseRef.current.then(session => session.close());
          sessionPromiseRef.current = null;
      }

      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;

      scriptProcessorRef.current?.disconnect();
      mediaStreamSourceRef.current?.disconnect();
      inputAnalyserNodeRef.current?.disconnect();
      outputAnalyserNodeRef.current?.disconnect();
      
      inputAudioContextRef.current?.close();
      outputAudioContextRef.current?.close();

      audioSourcesRef.current.forEach(source => source.stop());
      audioSourcesRef.current.clear();
      
      nextStartTimeRef.current = 0;
      setIsAiSpeaking(false);
      setStatus('IDLE');
  };

  const handleStartSession = async () => {
    setError(null);
    setStatus('CONNECTING');

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      inputAnalyserNodeRef.current = inputAudioContextRef.current.createAnalyser();
      inputAnalyserNodeRef.current.fftSize = 256;
      outputAnalyserNodeRef.current = outputAudioContextRef.current.createAnalyser();
      outputAnalyserNodeRef.current.fftSize = 256;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          systemInstruction: createLiveSystemPrompt(analysis),
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' }}},
        },
        callbacks: {
          onopen: () => {
            setStatus('CONNECTED');
            mediaStreamSourceRef.current = inputAudioContextRef.current!.createMediaStreamSource(streamRef.current!);
            scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              }
            };
            
            mediaStreamSourceRef.current.connect(inputAnalyserNodeRef.current!);
            inputAnalyserNodeRef.current!.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
            if (base64Audio) {
              setIsAiSpeaking(true);
              const outCtx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = audioBuffer;
              
              source.connect(outputAnalyserNodeRef.current!);
              outputAnalyserNodeRef.current!.connect(outCtx.destination);

              source.addEventListener('ended', () => {
                audioSourcesRef.current.delete(source);
                if (audioSourcesRef.current.size === 0) {
                    setIsAiSpeaking(false);
                }
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              audioSourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
                audioSourcesRef.current.forEach(source => source.stop());
                audioSourcesRef.current.clear();
                nextStartTimeRef.current = 0;
                setIsAiSpeaking(false);
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Live session error:', e);
            setError('An error occurred during the session.');
            setStatus('ERROR');
            cleanup();
          },
          onclose: () => {
            setStatus('CLOSED');
          },
        },
      });

    } catch (err) {
      console.error('Failed to start session:', err);
      setError('Failed to get microphone permissions.');
      setStatus('ERROR');
    }
  };

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const handleClose = () => {
      cleanup();
      onClose();
  }

  if (!isOpen) return null;

  const isSessionActive = status === 'CONNECTING' || status === 'CONNECTED';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg relative">
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
          <XIcon className="w-6 h-6" />
        </button>
        <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Live Q&amp;A with VenturIQ Analyst</h2>
            <p className="text-sm text-slate-500 mt-1">Ask questions about {analysis.companyName}</p>

            <div className="my-8 flex flex-col items-center justify-center space-y-2 h-48">
              {/* FIX: Changed condition from isSessionActive to status === 'CONNECTED' to differentiate connecting and connected states for the UI. */}
              {status === 'CONNECTED' ? (
                <>
                  <div className="w-full">
                    <p className="text-xs text-slate-400 mb-1">You</p>
                    <LiveWaveform
                      analyserNode={inputAnalyserNodeRef.current}
                      active={!isAiSpeaking}
                      barColor="#4f46e5"
                      height={60}
                    />
                  </div>
                  <div className="w-full">
                     <p className="text-xs text-slate-400 mb-1">AI Analyst</p>
                    <LiveWaveform
                      analyserNode={outputAnalyserNodeRef.current}
                      active={isAiSpeaking}
                      barColor="#10b981"
                      height={60}
                    />
                  </div>
                </>
              ) : (
                  <div className="flex items-center justify-center h-full">
                    {status === 'IDLE' && <p>Click the button to start the session.</p>}
                    {status === 'CONNECTING' && <p>Connecting...</p>}
                    {status === 'ERROR' && <p className="text-red-500">{error}</p>}
                    {status === 'CLOSED' && <p>Session ended. You can start a new one.</p>}
                  </div>
              )}
            </div>

            <button
                onClick={isSessionActive ? cleanup : handleStartSession}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors
                    ${isSessionActive ? 'bg-red-500 hover:bg-red-600' : 'bg-brand-primary hover:bg-brand-primary/90'}
                    text-white mx-auto`}
            >
                {isSessionActive ? <MicOffIcon className="w-8 h-8"/> : <MicIcon className="w-8 h-8"/>}
            </button>
            <p className="text-xs text-slate-400 mt-4">{isSessionActive ? 'Click to end session' : 'Click to start session'}</p>
        </div>
      </div>
    </div>
  );
};