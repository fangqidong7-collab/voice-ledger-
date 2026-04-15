import { useState, useRef, useCallback } from 'react';

export type RecorderState = 'idle' | 'recording' | 'uploading' | 'error';

interface UseAudioRecorderReturn {
  state: RecorderState;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string>;
  error: string | null;
  reset: () => void;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [state, setState] = useState<RecorderState>('idle');
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
        } 
      });
      
      // 选择浏览器支持的音频格式
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100); // 每100ms收集一次数据
      setState('recording');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('麦克风权限被拒绝，请在浏览器设置中允许使用麦克风');
      } else {
        setError('无法启动录音，请检查麦克风设备');
      }
      setState('error');
      throw err;
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        reject(new Error('录音未启动'));
        return;
      }

      mediaRecorder.onstop = async () => {
        // 停止所有音轨
        mediaRecorder.stream.getTracks().forEach(track => track.stop());

        const audioBlob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        
        if (audioBlob.size === 0) {
          setError('未录制到音频');
          setState('error');
          reject(new Error('空录音'));
          return;
        }

        setState('uploading');

        try {
          // 上传到后端进行语音识别
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');

          const response = await fetch('/api/speech-to-text', {
            method: 'POST',
            body: formData,
          });

          const result = await response.json() as {
            success: boolean;
            text?: string;
            error?: string;
          };

          if (result.success && result.text) {
            setState('idle');
            resolve(result.text);
          } else {
            setError(result.error || '语音识别失败，请重试');
            setState('error');
            reject(new Error(result.error || '识别失败'));
          }
        } catch (err) {
          setError('网络请求失败，请检查网络连接');
          setState('error');
          reject(err);
        }
      };

      mediaRecorder.stop();
    });
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setError(null);
  }, []);

  return { state, startRecording, stopRecording, error, reset };
}
