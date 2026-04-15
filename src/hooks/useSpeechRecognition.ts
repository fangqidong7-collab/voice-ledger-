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
  maxAlternatives: number;
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

export type VoiceState = 
  | 'idle' 
  | 'recording' 
  | 'processing' 
  | 'error' 
  | 'unsupported' 
  | 'permission_denied';

export type VoiceError = {
  type: 'not_supported' | 'permission_denied' | 'network' | 'no_speech' | 'unknown';
  message: string;
};

interface UseSpeechRecognitionReturn {
  state: VoiceState;
  transcript: string;
  error: VoiceError | null;
  startRecording: () => void;
  stopRecording: () => void;
  parseResult: (categories: Category[]) => ReturnType<typeof parseVoiceInput> | null;
  reset: () => void;
  getErrorMessage: () => string;
}

const ERROR_MESSAGES: Record<string, { message: string; type: VoiceError['type'] }> = {
  'not-allowed': { 
    message: '麦克风权限被拒绝，请在浏览器设置中允许使用麦克风', 
    type: 'permission_denied' 
  },
  'permission-denied': { 
    message: '麦克风权限被拒绝，请在浏览器设置中允许使用麦克风', 
    type: 'permission_denied' 
  },
  'no-speech': { 
    message: '未检测到语音输入，请重试', 
    type: 'no_speech' 
  },
  'network': { 
    message: '网络错误，请检查网络连接后重试', 
    type: 'network' 
  },
  'audio-capture': { 
    message: '未检测到麦克风设备，请确保麦克风已连接', 
    type: 'unknown' 
  },
  'aborted': { 
    message: '语音识别被中断', 
    type: 'unknown' 
  },
};

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<VoiceError | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isSupported = useRef(isSpeechRecognitionSupported());

  useEffect(() => {
    if (!isSupported.current) {
      setState('unsupported');
      setVoiceError({ 
        type: 'not_supported', 
        message: '您的浏览器不支持语音识别功能，请使用 Chrome 或 Edge 浏览器' 
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => {
      setState('recording');
      setVoiceError(null);
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
      const errorInfo = ERROR_MESSAGES[event.error] || { 
        message: `语音识别出错: ${event.error}`, 
        type: 'unknown' as VoiceError['type'] 
      };
      
      setVoiceError({
        type: errorInfo.type,
        message: errorInfo.message,
      });
      
      if (errorInfo.type === 'permission_denied') {
        setState('permission_denied');
      } else if (errorInfo.type === 'no_speech') {
        // no-speech 错误时直接回到 idle 状态
        setState('idle');
      } else {
        setState('error');
      }
    };
    
    recognition.onend = () => {
      if (state === 'recording') {
        setState('processing');
      }
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      try {
        recognition.abort();
      } catch {
        // 忽略
      }
    };
  }, []);

  const startRecording = useCallback(() => {
    if (!isSupported.current || !recognitionRef.current) return;
    
    setTranscript('');
    setVoiceError(null);
    
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
    setVoiceError(null);
  }, []);

  const getErrorMessage = useCallback(() => {
    if (!voiceError) return '';
    return voiceError.message;
  }, [voiceError]);

  return {
    state,
    transcript,
    error: voiceError,
    startRecording,
    stopRecording,
    parseResult,
    reset,
    getErrorMessage,
  };
}
