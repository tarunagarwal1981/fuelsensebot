'use client';

interface StreamingStatusProps {
  message: string;
  isStreaming?: boolean;
}

export default function StreamingStatus({ message, isStreaming = false }: StreamingStatusProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 animate-slide-in">
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse-slow"></div>
      <span>
        {message}
        {isStreaming && <span className="streaming-dots"></span>}
      </span>
    </div>
  );
}
