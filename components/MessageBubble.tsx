'use client';

import { formatMessageTime } from '@/lib/types';
import type { ChatMessage, Role } from '@/lib/types';
import AnalysisCard from './AnalysisCard';
import { sampleCargoes } from '@/lib/dummyData';

interface MessageBubbleProps {
  message: ChatMessage;
  role: Role;
  onActionClick?: (action: string, cargoId?: string) => void;
}

export default function MessageBubble({ message, role, onActionClick }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isBot = message.role === 'bot';
  const isSystem = message.role === 'system';

  // Debug logging
  console.log('MessageBubble render:', {
    messageType: message.type,
    hasAnalysisData: !!message.analysisData,
    analysisCount: message.analysisData?.length || 0,
    role: role
  });

  // Find best option for analysis cards (highest net profit)
  const bestOptionId = message.analysisData && message.analysisData.length > 0
    ? message.analysisData.reduce((best, current) => 
        current.netProfit > best.netProfit ? current : best
      ).cargoId
    : null;

  return (
    <div className={`flex w-full mb-4 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full w-full`}>
        
        {/* Regular message bubble for text/streaming/action buttons */}
        {message.type !== 'analysis_cards' && (
          <div className={`rounded-lg px-4 py-3 shadow-sm max-w-[80%] ${
            isUser
              ? 'bg-blue-600 text-white'
              : isSystem
              ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
              : 'bg-gray-100 text-gray-900'
          }`}>
            {/* Text Content */}
            {message.type === 'text' && (
              <div className="whitespace-pre-wrap break-words">{message.content}</div>
            )}

            {/* Streaming Content */}
            {message.type === 'streaming' && (
              <div className="flex items-center gap-2">
                <span>{message.content}</span>
                <span className="streaming-dots"></span>
              </div>
            )}

            {/* Action Buttons */}
            {message.type === 'action_buttons' && message.actions && (
              <div className="flex flex-col gap-2 mt-2">
                {message.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => onActionClick?.(action.action, action.cargoId)}
                    className="px-4 py-2 rounded-lg font-semibold text-sm transition-all bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analysis Cards - FULL WIDTH, OUTSIDE bubble */}
        {message.type === 'analysis_cards' && message.analysisData && message.analysisData.length > 0 && (
          <div className="w-full space-y-4">
            {message.analysisData.map((analysis, index) => {
              const cargo = sampleCargoes.find(c => c.id === analysis.cargoId);
              const isBest = analysis.cargoId === bestOptionId;
              
              return (
                <div key={analysis.cargoId || index} className="w-full">
                  <AnalysisCard
                    analysis={analysis}
                    role={role}
                    cargo={cargo}
                    isBestOption={isBest}
                    onFixCargo={(id) => onActionClick?.('fix_cargo', id)}
                    onBookBunker={(a) => onActionClick?.('book_bunker', a.cargoId)}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Timestamp */}
        {message.type !== 'analysis_cards' && (
          <div className={`text-xs text-gray-500 mt-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {formatMessageTime(message.timestamp)}
          </div>
        )}
      </div>
    </div>
  );
}
