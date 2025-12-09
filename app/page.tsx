'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import RoleSelector from '@/components/RoleSelector';
import MessageBubble from '@/components/MessageBubble';
import { NotificationPanel } from '@/components/NotificationBadge';
import CargoSelector from '@/components/CargoSelector';
import type { Role, ChatMessage, AnalysisResult } from '@/lib/types';
import { getRoleGreeting } from '@/lib/types';
import { sampleCargoes } from '@/lib/dummyData';

// Notification interface
interface Notification {
  id: string;
  type: 'verify' | 'approve' | 'review' | 'complete';
  title: string;
  description: string;
  timestamp: Date;
  action?: {
    label: string;
    handler: () => void;
  };
}

// Format currency helper
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<Role>('charterer');
  const [fixedCargoId, setFixedCargoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [robVerified, setRobVerified] = useState(false);
  const [showCargoSelector, setShowCargoSelector] = useState(false);
  const [cargoSelections, setCargoSelections] = useState<{
    vessel: string;
    fromPort: string;
    toPorts: string[];
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Persist analysis results across role changes
  const [latestAnalysisResults, setLatestAnalysisResults] = useState<AnalysisResult[]>([]);
  
  // Notifications state
  const [notifications, setNotifications] = useState<Record<Role, Notification[]>>({
    charterer: [],
    operator: [],
    vessel: [],
    vessel_manager: []
  });

  // Notification counts for badges
  const notificationCounts: Record<Role, number> = {
    charterer: notifications.charterer.length,
    operator: notifications.operator.length,
    vessel: notifications.vessel.length,
    vessel_manager: notifications.vessel_manager.length
  };

  // Initialize with greeting message when role changes
  useEffect(() => {
    let greeting: ChatMessage;
    const roleNotifs = notifications[selectedRole];

    if (roleNotifs.length > 0) {
      // Show notification summary
      greeting = {
        id: Date.now().toString(),
        role: 'bot',
        content: `You have ${roleNotifs.length} pending notification${roleNotifs.length > 1 ? 's' : ''}. Let me help you with that.`,
        timestamp: new Date(),
        type: 'text'
      };

      setMessages([greeting]);

      // Add notification details as messages
      roleNotifs.forEach((notif, idx) => {
        setTimeout(() => {
          const notifMsg: ChatMessage = {
            id: (Date.now() + idx + 1).toString(),
            role: 'bot',
            content: `${notif.title}\n${notif.description}`,
            timestamp: new Date(),
            type: notif.action ? 'action_buttons' : 'text',
            actions: notif.action ? [{
              label: notif.action.label,
              action: notif.type,
              cargoId: notif.id
            }] : undefined
          };
          setMessages(prev => [...prev, notifMsg]);
        }, (idx + 1) * 400);
      });

    } else if (selectedRole === 'vessel' && roleNotifs.length > 0) {
      // Vessel has verification notification
      greeting = {
        id: Date.now().toString(),
        role: 'bot',
        content: `Good day! ⚓ You have ROBs pending verification.`,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([greeting]);

      // Show current ROBs that need verification
      setTimeout(() => {
        const robMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          content: `Current ROBs (Unverified):\n\n📊 VLSFO: 180 MT\n📊 LSMGO: 45 MT\n\n⚠️ These values are being used for analysis but need your confirmation.`,
          timestamp: new Date(),
          type: 'action_buttons',
          actions: [{
            label: '✅ Verify ROBs',
            action: 'verify',
            cargoId: 'rob-verification'
          }, {
            label: '✏️ Edit & Verify',
            action: 'edit_rob',
            cargoId: 'rob-edit'
          }]
        };
        setMessages(prev => [...prev, robMsg]);
      }, 600);

    } else if (selectedRole === 'vessel_manager' && (roleNotifs.length > 0 || latestAnalysisResults.length > 0)) {
      greeting = {
        id: Date.now().toString(),
        role: 'bot',
        content: latestAnalysisResults.length > 0 
          ? `Welcome! 📊 Cargo analysis available for review.`
          : `Welcome! 📊 You have ${roleNotifs.length} pending notification(s).`,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([greeting]);

      if (latestAnalysisResults.length > 0) {
        setTimeout(() => {
          const summaryMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'bot',
            content: `Analysis Summary for MV Ocean Pride:`,
            timestamp: new Date(),
            type: 'text'
          };

          const analysisMsg: ChatMessage = {
            id: (Date.now() + 2).toString(),
            role: 'bot',
            content: '',
            timestamp: new Date(),
            type: 'analysis_cards',
            analysisData: latestAnalysisResults
          };

          setMessages(prev => [...prev, summaryMsg, analysisMsg]);
        }, 600);
      } else if (roleNotifs.length > 0) {
        // Fallback: show text summary
        setTimeout(() => {
          const summaryMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'bot',
            content: `📊 Fleet Overview:\n\n✅ MV Ocean Pride: 2 cargoes analyzed\n⚠️ ROBs unverified (pending vessel confirmation)\n💰 Best option: Singapore route ($287K profit)\n🚨 Action needed: Approve charterer's cargo selection`,
            timestamp: new Date(),
            type: 'action_buttons',
            actions: [{
              label: 'View Full Analysis',
              action: 'review',
              cargoId: 'vessel-manager-review'
            }]
          };
          setMessages(prev => [...prev, summaryMsg]);
        }, 600);
      }

    } else if (selectedRole === 'operator' && fixedCargoId) {
      greeting = {
        id: Date.now().toString(),
        role: 'bot',
        content: `Hi! Cargo has been fixed. Let me prepare the bunker plan...`,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([greeting]);

      // Auto-show bunker options for operator
      setTimeout(() => {
        const bunkerMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          content: 'Here are the available bunker ports. You can ask me to show bunker options for the fixed cargo.',
          timestamp: new Date(),
          type: 'text'
        };
        setMessages(prev => [...prev, bunkerMsg]);
      }, 800);

    } else {
      greeting = {
        id: Date.now().toString(),
        role: 'bot',
        content: selectedRole === 'charterer' 
          ? getRoleGreeting(selectedRole, 'Tarun') + '\n\nWould you like to analyze cargo options? Click "Select Cargo" to choose vessel and ports.'
          : getRoleGreeting(selectedRole, 'Tarun'),
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([greeting]);
      
      // For charterer, show cargo selector option
      if (selectedRole === 'charterer') {
        setTimeout(() => {
          const selectorMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'bot',
            content: '',
            timestamp: new Date(),
            type: 'action_buttons',
            actions: [{
              label: '📋 Select Cargo',
              action: 'show_cargo_selector',
              cargoId: undefined
            }]
          };
          setMessages(prev => [...prev, selectorMsg]);
        }, 500);
      }
    }
  }, [selectedRole, fixedCargoId, notifications, latestAnalysisResults]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFixCargo = (cargoId: string) => {
    setFixedCargoId(cargoId);
    
    // Add confirmation message
    const confirmMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'bot',
      content: `✅ Cargo fixed! The operator has been notified and can now proceed with bunker booking.`,
      timestamp: new Date(),
      type: 'text'
    };
    setMessages(prev => [...prev, confirmMessage]);
  };

  const handleBookBunker = (analysis: AnalysisResult) => {
    const bookingMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'bot',
      content: `📦 Bunker booking confirmed at ${analysis.recommendedBunkerPort.name}\n\nQuantity: ${analysis.bunkerQuantity.VLSFO} MT VLSFO, ${analysis.bunkerQuantity.LSMGO} MT LSMGO\nTotal Cost: $${analysis.totalBunkerCost.toLocaleString()}`,
      timestamp: new Date(),
      type: 'text'
    };
    setMessages(prev => [...prev, bookingMessage]);
  };

  const handleVerifyROB = () => {
    setRobVerified(true);
    
    const verifyMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'bot',
      content: `✅ ROBs verified! All analysis has been updated with confirmed fuel levels.`,
      timestamp: new Date(),
      type: 'text'
    };
    setMessages(prev => [...prev, verifyMessage]);
  };

  const handleCargoSelection = (selections: {
    vessel: string;
    fromPort: string;
    toPorts: string[];
  }) => {
    setShowCargoSelector(false);
    
    // Create cargoes from selections
    const cargoes = selections.toPorts.map((toPort, index) => ({
      id: `CARGO-${Date.now()}-${index}`,
      from: selections.fromPort,
      to: toPort,
      freight: toPort.includes('Singapore') ? 850000 : 620000,
      loadingDate: new Date().toISOString(),
    }));
    
    // Add confirmation message
    const confirmMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'bot',
      content: `✅ Analyzing ${selections.toPorts.length} cargo option${selections.toPorts.length > 1 ? 's' : ''}:\n\n🚢 Vessel: ${selections.vessel}\n📍 From: ${selections.fromPort}\n🎯 To: ${selections.toPorts.join(', ')}\n\nLet me calculate the bunker requirements...`,
      timestamp: new Date(),
      type: 'text'
    };
    setMessages(prev => [...prev, confirmMsg]);
    
    // Trigger analysis using existing handleSendMessage logic but with cargoes
    setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            cargoes: cargoes.map(c => ({
              from: c.from,
              to: c.to,
              freight: c.freight
            }))
          })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.status) {
                  const statusMsg: ChatMessage = {
                    id: Date.now().toString() + Math.random(),
                    role: 'bot',
                    content: parsed.status,
                    timestamp: new Date(),
                    type: 'text'
                  };
                  setMessages(prev => [...prev, statusMsg]);
                  await new Promise(resolve => setTimeout(resolve, 400));
                }

                if (parsed.analyses && Array.isArray(parsed.analyses)) {
                  setLatestAnalysisResults(parsed.analyses);
                  const resultsMsg: ChatMessage = {
                    id: Date.now().toString(),
                    role: 'bot',
                    content: `Here's my analysis for ${parsed.analyses.length} cargo option${parsed.analyses.length > 1 ? 's' : ''}:`,
                    timestamp: new Date(),
                    type: 'text'
                  };
                  const cardsMsg: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'bot',
                    content: '',
                    timestamp: new Date(),
                    type: 'analysis_cards',
                    analysisData: parsed.analyses
                  };
                  const bestCargo = parsed.analyses.reduce((best: AnalysisResult, current: AnalysisResult) => 
                    current.netProfit > best.netProfit ? current : best
                  );
                  const recommendationMsg: ChatMessage = {
                    id: (Date.now() + 2).toString(),
                    role: 'bot',
                    content: `Based on the analysis, ${bestCargo.cargoId} shows better economics with ${formatCurrency(bestCargo.netProfit)} net profit. Which cargo would you like to fix?`,
                    timestamp: new Date(),
                    type: 'action_buttons',
                    actions: parsed.analyses.map((a: AnalysisResult) => ({
                      label: `Fix ${a.cargoId}`,
                      action: 'fix_cargo',
                      cargoId: a.cargoId
                    }))
                  };
                  setMessages(prev => [...prev, resultsMsg, cardsMsg, recommendationMsg]);
                  setNotifications(prev => ({
                    ...prev,
                    vessel: [...prev.vessel, {
                      id: Date.now().toString(),
                      type: 'verify',
                      title: '⚠️ ROB Verification Needed',
                      description: 'Current ROBs are unverified. Please confirm fuel levels.',
                      timestamp: new Date(),
                      action: {
                        label: 'Verify ROBs',
                        handler: () => setSelectedRole('vessel')
                      }
                    }],
                    vessel_manager: [...prev.vessel_manager, {
                      id: Date.now().toString(),
                      type: 'review',
                      title: '📊 New Analysis Available',
                      description: 'Cargo analysis completed for MV Ocean Pride',
                      timestamp: new Date(),
                      action: {
                        label: 'Review',
                        handler: () => setSelectedRole('vessel_manager')
                      }
                    }]
                  }));
                }
              } catch (e) {
                console.error('Parse error:', e);
              }
            }
          }
        }
      } catch (error) {
        const errorMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'bot',
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
          type: 'text'
        };
        setMessages(prev => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    }, 800);
  };

  const handleMessageAction = (action: string, cargoId?: string) => {
    if (action === 'show_cargo_selector') {
      setShowCargoSelector(true);
      return;
    }
    if (action === 'fix_cargo') {
      const confirmMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'bot',
        content: `✅ Cargo fixed! I've notified the operations team.`,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, confirmMsg]);
      setFixedCargoId(cargoId || null);
      
      // Notify operator
      const fixedCargo = sampleCargoes.find(c => c.id === cargoId);
      setNotifications(prev => ({
        ...prev,
        operator: [...prev.operator, {
          id: Date.now().toString(),
          type: 'approve',
          title: '📦 New Cargo Fixed',
          description: `${fixedCargo?.from || 'Port'} → ${fixedCargo?.to || 'Port'} cargo ready for bunker planning`,
          timestamp: new Date(),
          action: {
            label: 'Plan Bunker',
            handler: () => setSelectedRole('operator')
          }
        }]
      }));
    } else if (action === 'verify') {
      // Vessel verifies ROBs
      const verifyMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'bot',
        content: '✅ ROBs verified! Thank you. The analysis has been updated.',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, verifyMsg]);
      
      // Clear vessel notification
      setNotifications(prev => ({
        ...prev,
        vessel: prev.vessel.filter(n => n.type !== 'verify')
      }));
      
      // Update ROB verified state
      setRobVerified(true);
    } else if (action === 'approve') {
      // Operator approves bunker plan
      const approveMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'bot',
        content: '✅ Bunker plan approved! I\'ve notified the vessel and supplier.',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, approveMsg]);
      
      // Clear operator notification
      setNotifications(prev => ({
        ...prev,
        operator: prev.operator.filter(n => n.type !== 'approve')
      }));
    } else if (action === 'book_bunker' && cargoId) {
      // Find analysis for this cargo
      const analysis = messages
        .find(m => m.analysisData?.some(a => a.cargoId === cargoId))
        ?.analysisData?.find(a => a.cargoId === cargoId);
      if (analysis) {
        handleBookBunker(analysis);
      }
    } else if (action === 'verify_rob') {
      handleVerifyROB();
    }
  };

  // Get role-specific placeholder text
  const getPlaceholder = (role: Role): string => {
    const placeholders: Record<Role, string> = {
      charterer: "e.g., 'MV Ocean Pride from Rotterdam to Singapore and New York'",
      operator: "e.g., 'Show bunker options for MV Ocean Pride'",
      vessel: "e.g., 'Update ROBs' or 'Current position'",
      vessel_manager: "e.g., 'Fleet summary' or 'This week's bunker spend'"
    };
    return placeholders[role];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    // Add bot acknowledgment
    const ackMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'bot',
      content: "Got it! Let me analyze those cargoes for you...",
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, ackMessage]);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();

            if (data === '[DONE]') {
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              console.log('Parsed SSE data:', parsed); // Debug log

              // Add each status update as a bot message
              if (parsed.status) {
                const statusMsg: ChatMessage = {
                  id: Date.now().toString() + Math.random(),
                  role: 'bot',
                  content: parsed.status,
                  timestamp: new Date(),
                  type: 'text'
                };
                setMessages(prev => [...prev, statusMsg]);

                // Small delay for readability
                await new Promise(resolve => setTimeout(resolve, 400));
              }

              // When analysis is complete
              if (parsed.analyses && Array.isArray(parsed.analyses)) {
                console.log('✅ Received analyses:', parsed.analyses); // Debug log
                console.log('✅ Analysis count:', parsed.analyses.length);
                console.log('✅ First analysis:', parsed.analyses[0]);

                // SAVE ANALYSIS RESULTS
                setLatestAnalysisResults(parsed.analyses);

                const resultsMsg: ChatMessage = {
                  id: Date.now().toString(),
                  role: 'bot',
                  content: "Here's my analysis for both cargoes:",
                  timestamp: new Date(),
                  type: 'text'
                };

                const cardsMsg: ChatMessage = {
                  id: (Date.now() + 1).toString(),
                  role: 'bot',
                  content: '',
                  timestamp: new Date(),
                  type: 'analysis_cards',
                  analysisData: parsed.analyses  // Make sure this is being set correctly
                };

                console.log('✅ Cards message created:', {
                  type: cardsMsg.type,
                  hasData: !!cardsMsg.analysisData,
                  dataLength: cardsMsg.analysisData?.length
                });

                // Determine best option
                const bestCargo = parsed.analyses.reduce((best: AnalysisResult, current: AnalysisResult) => 
                  current.netProfit > best.netProfit ? current : best
                );

                const recommendationMsg: ChatMessage = {
                  id: (Date.now() + 2).toString(),
                  role: 'bot',
                  content: `Based on the analysis, ${bestCargo.cargoId} shows better economics with ${formatCurrency(bestCargo.netProfit)} net profit. Which cargo would you like to fix?`,
                  timestamp: new Date(),
                  type: 'action_buttons',
                  actions: parsed.analyses.map((a: AnalysisResult) => ({
                    label: `Fix ${a.cargoId}`,
                    action: 'fix_cargo',
                    cargoId: a.cargoId
                  }))
                };

                console.log('✅ Adding messages to chat:', {
                  resultsMsg: resultsMsg.id,
                  cardsMsg: cardsMsg.id,
                  recommendationMsg: recommendationMsg.id
                });

                setMessages(prev => {
                  const newMessages = [...prev, resultsMsg, cardsMsg, recommendationMsg];
                  console.log('✅ Total messages after adding:', newMessages.length);
                  return newMessages;
                });
                
                // Create notifications for other roles
                
                // Notify vessel to verify ROBs
                setNotifications(prev => ({
                  ...prev,
                  vessel: [...prev.vessel, {
                    id: Date.now().toString(),
                    type: 'verify',
                    title: '⚠️ ROB Verification Needed',
                    description: 'Current ROBs are unverified. Please confirm fuel levels.',
                    timestamp: new Date(),
                    action: {
                      label: 'Verify ROBs',
                      handler: () => {
                        setSelectedRole('vessel');
                        // Will show verification in vessel chat
                      }
                    }
                  }]
                }));
                
                // Notify vessel manager
                setNotifications(prev => ({
                  ...prev,
                  vessel_manager: [...prev.vessel_manager, {
                    id: Date.now().toString(),
                    type: 'review',
                    title: '📊 New Analysis Available',
                    description: 'Cargo analysis completed for MV Ocean Pride',
                    timestamp: new Date(),
                    action: {
                      label: 'Review',
                      handler: () => setSelectedRole('vessel_manager')
                    }
                  }]
                }));
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'bot',
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            FuelSense Bot
          </h1>
          <p className="text-gray-600">
            Maritime fuel analysis and cargo optimization platform
          </p>
        </div>

        {/* Role Selector */}
        <div className="mb-6">
          <RoleSelector 
            selectedRole={selectedRole} 
            onRoleChange={setSelectedRole}
            notifications={notificationCounts}
          />
        </div>

        {/* Chat Interface - Full Height */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-[600px]">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-500" />
              <span className="font-semibold text-gray-700">FuelSense Assistant</span>
            </div>
            <span className="text-sm text-gray-500">
              {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
            </span>
          </div>

          {/* Messages Area - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
            {/* Show notifications for current role if any exist */}
            {notifications[selectedRole].length > 0 && (
              <div className="mb-4">
                <NotificationPanel notifications={notifications[selectedRole]} />
              </div>
            )}
            
            {/* Cargo Selector */}
            {showCargoSelector && (
              <div className="mb-4">
                <CargoSelector
                  onConfirm={handleCargoSelection}
                  onCancel={() => setShowCargoSelector(false)}
                />
              </div>
            )}
            
            {messages.map(msg => (
              <div key={msg.id} className="hover:opacity-95 transition-opacity">
                <MessageBubble
                  message={msg}
                  role={selectedRole}
                  onActionClick={handleMessageAction}
                />
              </div>
            ))}
            {isLoading && (
              <MessageBubble
                message={{
                  id: 'loading',
                  role: 'bot',
                  content: 'Thinking',
                  timestamp: new Date(),
                  type: 'streaming'
                }}
                role={selectedRole}
              />
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Fixed at bottom */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!isLoading && inputValue.trim()) {
                      handleSendMessage();
                    }
                  }
                }}
                placeholder={getPlaceholder(selectedRole)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputValue.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
