// Type definitions for the application

export type Role = 'charterer' | 'operator' | 'vessel' | 'vessel_manager';

export type MessageRole = 'user' | 'bot' | 'system';

export type MessageType = 'text' | 'analysis_cards' | 'streaming' | 'action_buttons';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  type: MessageType;
  // For analysis cards
  analysisData?: AnalysisResult[];
  // For action buttons
  actions?: {
    label: string;
    action: string;
    cargoId?: string;
  }[];
}

export interface Cargo {
  id: string;
  from: string;
  to: string;
  freight: number;
  loadingDate: string;
}

export interface ROB {
  VLSFO: number;
  LSMGO: number;
  verified: boolean;
  timestamp: string;
  vesselConfirmed?: boolean;
}

export interface VesselPosition {
  lat: number;
  lon: number;
  currentPort: string;
  nextPort: string;
  eta: string;
  speed: number;
}

export interface ConsumptionProfile {
  seaVLSFO: number; // MT/day
  seaLSMGO: number;
  portVLSFO: number;
  portLSMGO: number;
}

export interface BunkerPort {
  name: string;
  deviation_nm: number;
  deviation_days: number;
  VLSFO_available: boolean;
  LSMGO_available: boolean;
  VLSFO_price: number;
  LSMGO_price: number;
}

export interface RouteAnalysis {
  distance_nm: number;
  sailing_days: number;
  SECA_distance_nm?: number;
  weather_factor: number;
  total_consumption: {
    VLSFO: number;
    LSMGO: number;
  };
}

export interface AnalysisResult {
  cargoId: string;
  viable: boolean;
  currentROB: ROB;
  estimatedDepartureROB: ROB;
  requiredROB: {
    VLSFO: number;
    LSMGO: number;
  };
  shortfall: {
    VLSFO: number;
    LSMGO: number;
  };
  recommendedBunkerPort: BunkerPort;
  bunkerQuantity: {
    VLSFO: number;
    LSMGO: number;
  };
  totalBunkerCost: number;
  netProfit: number;
  route: RouteAnalysis;
}

// Add role-specific greeting function
export const getRoleGreeting = (role: Role, name: string = 'there'): string => {
  const greetings: Record<Role, string> = {
    charterer: `Hi ${name}! 👋 I'm your bunker planning assistant. Tell me which vessel and cargoes you'd like me to analyze.`,
    operator: `Hi ${name}! 📦 I'll help you plan bunkering operations. Which vessel's bunker plan do you need?`,
    vessel: `Good day! ⚓ Need to update ROBs or check your upcoming bunker schedule?`,
    vessel_manager: `Welcome ${name}! 📊 Let's review fleet performance and key metrics.`
  };
  return greetings[role] || `Hello! How can I help you today?`;
};

// Add helper to format timestamps
export const formatMessageTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};
