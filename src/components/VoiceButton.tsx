import { useEffect, useState } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { VoiceState } from '../hooks/useSpeechRecognition';

interface VoiceButtonProps {
  state: VoiceState;
  onStart: () => void;
  onStop: () => void;
}

export function VoiceButton({ state, onStart, onStop }: VoiceButtonProps) {
  const [ripples, setRipples] = useState<Array<{ id: number; size: number }>>([]);
  
  useEffect(() => {
    if (state === 'recording') {
      const interval = setInterval(() => {
        setRipples(prev => {
          const newRipple = { id: Date.now(), size: 0 };
          const updated = [...prev, newRipple];
          // 限制最大波纹数
          if (updated.length > 3) {
            return updated.slice(-3);
          }
          return updated;
        });
      }, 600);
      
      return () => clearInterval(interval);
    } else {
      setRipples([]);
    }
  }, [state]);
  
  useEffect(() => {
    // 动画波纹扩散
    const animateRipples = () => {
      setRipples(prev => 
        prev
          .map(r => ({ ...r, size: r.size + 4 }))
          .filter(r => r.size < 60)
      );
    };
    
    const interval = setInterval(animateRipples, 50);
    return () => clearInterval(interval);
  }, [ripples.length]);
  
  const handleClick = () => {
    if (state === 'idle' || state === 'error') {
      onStart();
    } else if (state === 'recording') {
      onStop();
    }
  };
  
  const isRecording = state === 'recording';
  const isProcessing = state === 'processing';
  const isUnsupported = state === 'unsupported';
  
  return (
    <div className="relative flex items-center justify-center">
      {/* 脉冲波纹 */}
      {isRecording && ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute w-32 h-32 rounded-full bg-red-400/30 animate-ping"
          style={{
            transform: `scale(${1 + ripple.size / 40})`,
            opacity: 1 - ripple.size / 60,
          }}
        />
      ))}
      
      {/* 主按钮 */}
      <button
        onClick={handleClick}
        disabled={isProcessing || isUnsupported}
        className={cn(
          'relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300',
          'shadow-lg hover:shadow-xl active:scale-95',
          isUnsupported && 'bg-slate-300 cursor-not-allowed',
          isRecording && 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-200',
          !isRecording && !isUnsupported && 'bg-gradient-to-br from-indigo-500 to-violet-500 shadow-indigo-200',
          isProcessing && 'bg-gradient-to-br from-slate-400 to-slate-500 cursor-wait'
        )}
      >
        {/* 内圈动画 */}
        {isRecording && (
          <div className="absolute inset-2 rounded-full border-2 border-white/30 animate-pulse" />
        )}
        
        {/* 图标 */}
        {isUnsupported ? (
          <MicOff size={40} className="text-white/70" />
        ) : isProcessing ? (
          <Loader2 size={40} className="text-white animate-spin" />
        ) : (
          <Mic size={40} className="text-white" />
        )}
      </button>
      
      {/* 状态文字 */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
        {state === 'idle' && (
          <span className="text-sm text-slate-500">点击说话</span>
        )}
        {state === 'recording' && (
          <span className="text-sm text-red-500 font-medium animate-pulse">录音中...</span>
        )}
        {state === 'processing' && (
          <span className="text-sm text-slate-500">识别中...</span>
        )}
        {state === 'error' && (
          <span className="text-sm text-red-500">出错了</span>
        )}
        {state === 'unsupported' && (
          <span className="text-xs text-slate-400">浏览器不支持语音</span>
        )}
      </div>
    </div>
  );
}
