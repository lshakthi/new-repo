import { useState, useEffect } from 'react';

interface StreamingTextProps {
  text: string;
  speed?: number; // ms per character
  onComplete?: () => void;
  className?: string;
}

export function StreamingText({ text, speed = 15, onComplete, className = '' }: StreamingTextProps) {
  const [displayed, setDisplayed] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isComplete) return;

    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayed(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, onComplete, isComplete]);

  return (
    <span className={className}>
      {displayed}
      {!isComplete && <span className="inline-block w-0.5 h-4 bg-cei-blue-light animate-pulse ml-0.5" aria-hidden="true" />}
    </span>
  );
}
