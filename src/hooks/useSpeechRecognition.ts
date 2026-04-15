import { useState, useCallback, useRef, useEffect } from 'react';
import { parseVoiceInput, isSpeechRecognitionSupported } from '../utils/parser';
import { Category } from '../types';

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onstart: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export type VoiceState = 'idle' | 'recording' | 'processing' | 'error' | 'unsupported';

interface UseSpeechRecognitionReturn {
  state: VoiceState;
  transcript: string;
  error: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  parseResult: (categories: Category[]) => ReturnType<typeof parseVoiceInput> | null;
  reset: () => void;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isSupported = useRef(isSpeechRecognitionSupported());

  useEffect(() => {
    if (!isSupported.current) {
      setState('unsupported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';
    
    recognition.onstart = () => {
      setState('recording');
      setError(null);
    };
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptText = result[0]?.transcript || '';
        if (result.isFinal) {
          finalTranscript += transcriptText;
        } else {
          interimTranscript += transcriptText;
        }
      }
      
      setTranscript(finalTranscript || interimTranscript);
    };
    
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') {
        setState('idle');
        return;
      }
      if (event.error === 'not-allowed') {
        setError('麦克风权限被拒绝');
        setState('error');
        return;
      }
      setError('语音识别出错');
      setState('error');
    };
    
    recognition.onend = () => {
      if (state === 'recording') {
        setState('processing');
      }
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      recognition.abort();
    };
  }, [state]);

  const startRecording = useCallback(() => {
    if (!isSupported.current || !recognitionRef.current) return;
    
    setTranscript('');
    setError(null);
    
    try {
      recognitionRef.current.start();
    } catch {
      // 可能已经在运行，忽略
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
    } catch {
      // 忽略
    }
  }, []);

  const parseResult = useCallback((categories: Category[]) => {
    if (!transcript) return null;
    return parseVoiceInput(transcript, categories);
  }, [transcript]);

  const reset = useCallback(() => {
    setState('idle');
    setTranscript('');
    setError(null);
  }, []);

  return {
    state,
    transcript,
    error,
    startRecording,
    stopRecording,
    parseResult,
    reset,
  };
}
