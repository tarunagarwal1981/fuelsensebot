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

  // Find best option for analysis cards (highest net profit)
  const bestOptionId = message.analysisData && message.analysisData.length > 0
    ? message.analysisData.reduce((best, current) => 
        current.netProfit > best.netProfit ? current : best
      ).cargoId
    : null;

  return (
    <div
      className={`flex w-full mb-4 animate-fade-in ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
      style={{ animationDelay: '0.1s' }}
    >
      <div
        className={`flex flex-col max-w-[80%] ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        {/* Message Content */}
        <div
          className={`rounded-lg px-4 py-3 shadow-sm ${
            isUser
              ? 'bg-blue-600 text-white'
              : isSystem
              ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          {/* Text Content */}
          {message.type === 'text' && (
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )}

          {/* Streaming Content */}
          {message.type === 'streaming' && (
            <div className="flex items-center gap-2">
              <span>{message.content}</span>
              <span className="streaming-dots"></span>
            </div>
          )}

          {/* Analysis Cards */}
          {message.type === 'analysis_cards' && message.analysisData && (
            <div className="space-y-4 mt-2">
              {message.analysisData.map((analysis, index) => {
                const cargo = sampleCargoes.find(c => c.id === analysis.cargoId);
                return (
                  <div
                    key={analysis.cargoId}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <AnalysisCard
                      analysis={analysis}
                      role={role}
                      cargo={cargo}
                      isBestOption={analysis.cargoId === bestOptionId}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Buttons */}
          {message.type === 'action_buttons' && message.actions && (
            <div className="flex flex-col gap-2 mt-2">
              {message.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => onActionClick?.(action.action, action.cargoId)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    isUser
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Mixed Content: Text + Analysis Cards */}
          {message.type === 'text' && message.analysisData && message.analysisData.length > 0 && (
            <div className="mt-4 space-y-4">
              {message.analysisData.map((analysis, index) => {
                const cargo = sampleCargoes.find(c => c.id === analysis.cargoId);
                return (
                  <div
                    key={analysis.cargoId}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <AnalysisCard
                      analysis={analysis}
                      role={role}
                      cargo={cargo}
                      isBestOption={analysis.cargoId === bestOptionId}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div
          className={`text-xs text-gray-500 mt-1 px-1 ${
            isUser ? 'text-right' : 'text-left'
          }`}
        >
          {formatMessageTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}

