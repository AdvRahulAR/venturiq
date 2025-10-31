import React, { useRef, useEffect } from 'react';

interface LiveWaveformProps {
  analyserNode: AnalyserNode | null;
  active: boolean;
  barWidth?: number;
  barGap?: number;
  barColor?: string;
  height?: number;
  fadeEdges?: boolean;
}

export const LiveWaveform: React.FC<LiveWaveformProps> = ({
  analyserNode,
  active,
  barWidth = 4,
  barGap = 2,
  barColor = "#3b82f6",
  height = 100,
  fadeEdges = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserNode) return;

    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    // Set canvas dimensions based on its container
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = height;
    }

    const draw = () => {
      if (!active || !analyserNode) {
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        animationFrameId.current = requestAnimationFrame(draw);
        return;
      }
      
      animationFrameId.current = requestAnimationFrame(draw);
      
      const bufferLength = analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserNode.getByteFrequencyData(dataArray);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barCount = Math.floor(canvas.width / (barWidth + barGap));
      const step = Math.floor(bufferLength / barCount);
      let x = 0;

      for (let i = 0; i < barCount; i++) {
        // Use a power scale for more visual impact
        const barHeight = Math.pow(dataArray[i * step] / 255, 2.5) * canvas.height;
        
        let color = barColor;
        if (fadeEdges) {
            const distanceFromCenter = Math.abs(i - barCount / 2);
            const fadeFactor = Math.max(0, 1 - (distanceFromCenter / (barCount / 2)) * 1.5);
            
            // Convert hex to rgb to apply opacity
            const r = parseInt(barColor.slice(1, 3), 16);
            const g = parseInt(barColor.slice(3, 5), 16);
            const b = parseInt(barColor.slice(5, 7), 16);
            color = `rgba(${r}, ${g}, ${b}, ${fadeFactor * fadeFactor})`;
        }

        canvasCtx.fillStyle = color;
        canvasCtx.fillRect(
          x,
          canvas.height - barHeight,
          barWidth,
          barHeight
        );

        x += barWidth + barGap;
      }
    };

    draw();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [analyserNode, active, barWidth, barGap, barColor, height, fadeEdges]);

  return <canvas ref={canvasRef} />;
};
