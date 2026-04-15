import { useEffect, useState, useRef } from 'react';
import { Mic, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { RecorderState } from '../hooks/useAudioRecorder';

interface VoiceButtonProps {
  state: RecorderState;
  onStart: () => void;
  onStop: () => void;
  error?: string | null;
}

export function VoiceButton({ state, onStart, onStop, error }: VoiceButtonProps) {
  const [ripples, setRipples] = useState<Array<{ id: number; scale: number; opacity: number }>>([]);
  const [isPressed, setIsPressed] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);
  
  useEffect(() => {
    if (state === 'recording') {
      // 创建新的波纹
      const createRipple = () => {
        setRipples(prev => {
          const newRipple = { id: Date.now(), scale: 1, opacity: 0.6 };
          const updated = [...prev, newRipple];
          return updated.length > 4 ? updated.slice(-4) : updated;
        });
      };
      
      createRipple();
      const rippleInterval = setInterval(createRipple, 800);
      
      // 波纹动画
      const animateRipples = () => {
        setRipples(prev => 
          prev
            .map(r => ({ 
              ...r, 
              scale: r.scale + 0.03, 
              opacity: Math.max(0, r.opacity - 0.015) 
            }))
            .filter(r => r.opacity > 0)
        );
        animationRef.current = requestAnimationFrame(animateRipples);
      };
      
      animationRef.current = requestAnimationFrame(animateRipples);
      
      return () => {
        clearInterval(rippleInterval);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } else {
      setRipples([]);
    }
  }, [state]);
  
  const isRecording = state === 'recording';
  const isUploading = state === 'uploading';
  const hasError = state === 'error';
  const isIdle = state === 'idle';
  
  const handleClick = () => {
    if (isIdle || hasError) {
      onStart();
    } else if (isRecording) {
      onStop();
    }
  };
  
  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleTouchStart = () => setIsPressed(true);
  const handleTouchEnd = () => setIsPressed(false);
  
  return (
    <div className="relative flex flex-col items-center justify-center py-8">
      {/* 外圈光晕 */}
      <div 
        className={cn(
          'absolute w-48 h-48 rounded-full transition-all duration-500',
          isRecording 
            ? 'bg-gradient-to-br from-red-400/20 to-red-500/20 scale-100' 
            : 'bg-gradient-to-br from-indigo-400/10 to-violet-500/10 scale-95',
          isPressed && 'scale-90'
        )}
      />
      
      {/* 波纹效果 */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute w-44 h-44 rounded-full transition-all duration-75"
          style={{
            background: 'radial-gradient(circle, rgba(239,68,68,0.3) 0%, transparent 70%)',
            transform: `scale(${ripple.scale})`,
            opacity: ripple.opacity,
          }}
        />
      ))}
      
      {/* 主按钮 - 更大更醒目 */}
      <button
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        disabled={isUploading}
        className={cn(
          'relative w-36 h-36 rounded-full flex items-center justify-center transition-all duration-200',
          'active:scale-95',
          isPressed && 'scale-95',
          isRecording && 'bg-gradient-to-br from-red-500 via-red-600 to-rose-600 shadow-red-200',
          !isRecording && !hasError && 'bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 shadow-indigo-300 shadow-2xl',
          hasError && 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-200'
        )}
      >
        {/* 外圈装饰 */}
        <div className={cn(
          'absolute inset-1 rounded-full border-2 transition-all duration-300',
          isRecording 
            ? 'border-white/40 scale-100' 
            : 'border-white/20 scale-[0.98]',
        )} />
        
        {/* 内圈 */}
        <div className={cn(
          'absolute inset-3 rounded-full transition-all duration-300',
          isRecording 
            ? 'bg-white/20 backdrop-blur-sm' 
            : 'bg-white/10'
        )} />
        
        {/* 麦克风图标 */}
        {isUploading ? (
          <div className="relative z-10">
            <Loader2 size={48} className="text-white animate-spin" strokeWidth={1.5} />
          </div>
        ) : hasError ? (
          <div className="relative z-10">
            <AlertCircle size={48} className="text-white" strokeWidth={1.5} />
          </div>
        ) : (
          <div className="relative z-10">
            <Mic size={48} className={cn(
              'text-white transition-transform',
              isRecording && 'animate-pulse'
            )} strokeWidth={1.5} />
          </div>
        )}
        
        {/* 录音时的声波指示器 */}
        {isRecording && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1 bg-white rounded-full animate-sound-wave"
                style={{
                  height: '8px',
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}
      </button>
      
      {/* 状态文字 */}
      <div className="mt-8 text-center">
        {isIdle && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-base font-medium text-slate-700">点击开始录音</span>
            <span className="text-xs text-slate-400">说出您的消费，如"午餐花了35元"</span>
          </div>
        )}
        {isRecording && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-base font-medium text-red-500">正在录音...</span>
            <span className="text-xs text-slate-400 animate-pulse">再次点击结束录音</span>
          </div>
        )}
        {isUploading && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-base font-medium text-slate-600">识别中...</span>
            <span className="text-xs text-slate-400">正在将语音转为文字</span>
          </div>
        )}
        {hasError && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-base font-medium text-amber-500">{error || '识别失败'}</span>
            <span className="text-xs text-slate-400">点击重试或使用手动输入</span>
          </div>
        )}
      </div>
    </div>
  );
}
