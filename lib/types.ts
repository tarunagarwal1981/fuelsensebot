// Type definitions for the application

export type Role = 'charterer' | 'operator' | 'vessel' | 'vessel_manager';

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
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
