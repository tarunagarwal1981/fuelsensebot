// Realistic maritime data for testing
import type {
  VesselPosition,
  ROB,
  ConsumptionProfile,
  BunkerPort,
  Cargo,
  RouteAnalysis,
  AnalysisResult,
} from './types';

// Current vessel position (North Sea, heading to Rotterdam)
export const currentVesselPosition: VesselPosition = {
  lat: 52.0,
  lon: 4.5,
  currentPort: 'North Sea',
  nextPort: 'Rotterdam',
  eta: '2024-03-15T14:00:00Z',
  speed: 12.5, // knots
};

// Current ROBs: VLSFO: 180 MT, LSMGO: 45 MT (unverified initially)
export const currentROB: ROB = {
  VLSFO: 180,
  LSMGO: 45,
  verified: false,
  timestamp: '2024-03-15T08:00:00Z',
  vesselConfirmed: false,
};

// Consumption profile: Sea VLSFO: 28 MT/day, LSMGO: 2 MT/day, Port: 3 MT/day each
export const consumptionProfile: ConsumptionProfile = {
  seaVLSFO: 28, // MT/day
  seaLSMGO: 2, // MT/day
  portVLSFO: 3, // MT/day
  portLSMGO: 3, // MT/day
};

// Bunker ports with realistic prices
export const bunkerPorts: BunkerPort[] = [
  {
    name: 'Rotterdam',
    deviation_nm: 0,
    deviation_days: 0,
    VLSFO_available: true,
    LSMGO_available: true,
    VLSFO_price: 580, // $/MT
    LSMGO_price: 780, // $/MT
  },
  {
    name: 'Gibraltar',
    deviation_nm: 120,
    deviation_days: 0.5,
    VLSFO_available: true,
    LSMGO_available: true,
    VLSFO_price: 590, // $/MT
    LSMGO_price: 800, // $/MT
  },
  {
    name: 'Fujairah',
    deviation_nm: 50,
    deviation_days: 0.2,
    VLSFO_available: true,
    LSMGO_available: true,
    VLSFO_price: 550, // $/MT
    LSMGO_price: 720, // $/MT
  },
  {
    name: 'Panama',
    deviation_nm: 200,
    deviation_days: 0.8,
    VLSFO_available: true,
    LSMGO_available: true,
    VLSFO_price: 620, // $/MT
    LSMGO_price: 850, // $/MT
  },
];

// Sample cargoes
export const sampleCargoes: Cargo[] = [
  {
    id: 'CARGO-001',
    from: 'Rotterdam',
    to: 'Singapore',
    freight: 850000, // $850k
    loadingDate: '2024-03-20T00:00:00Z',
  },
  {
    id: 'CARGO-002',
    from: 'Rotterdam',
    to: 'US East Coast',
    freight: 620000, // $620k
    loadingDate: '2024-03-18T00:00:00Z',
  },
];

// Route data
export const routes: Record<string, RouteAnalysis> = {
  'Rotterdam-Singapore': {
    distance_nm: 8500,
    sailing_days: 18,
    weather_factor: 1.05,
    total_consumption: {
      VLSFO: 0, // Will be calculated
      LSMGO: 0, // Will be calculated
    },
  },
  'Rotterdam-US East Coast': {
    distance_nm: 3800,
    sailing_days: 12,
    SECA_distance_nm: 500, // SECA zone requires LSMGO
    weather_factor: 1.08,
    total_consumption: {
      VLSFO: 0, // Will be calculated
      LSMGO: 0, // Will be calculated
    },
  },
};

/**
 * Calculate fuel consumption for a route based on distance and consumption profile
 */
export function calculateRouteConsumption(
  route: RouteAnalysis,
  profile: ConsumptionProfile
): { VLSFO: number; LSMGO: number } {
  const { distance_nm, sailing_days, SECA_distance_nm, weather_factor } = route;

  // Calculate consumption for non-SECA areas (VLSFO)
  const nonSECA_distance_nm = SECA_distance_nm
    ? distance_nm - SECA_distance_nm
    : distance_nm;
  const nonSECA_days = SECA_distance_nm
    ? (nonSECA_distance_nm / distance_nm) * sailing_days
    : sailing_days;

  // Calculate consumption for SECA areas (LSMGO)
  const SECA_days = SECA_distance_nm
    ? (SECA_distance_nm / distance_nm) * sailing_days
    : 0;

  // Sea consumption
  // In non-SECA areas: VLSFO for main propulsion, LSMGO for auxiliary
  const seaVLSFO = nonSECA_days * profile.seaVLSFO * weather_factor;
  const seaLSMGO_normal = nonSECA_days * profile.seaLSMGO * weather_factor;
  
  // In SECA areas: LSMGO for main propulsion (use VLSFO rate as proxy since LSMGO is used for main engine)
  // Plus normal auxiliary consumption
  const seaLSMGO_SECA_main = SECA_days * profile.seaVLSFO * weather_factor; // Main propulsion in SECA
  const seaLSMGO_SECA_aux = SECA_days * profile.seaLSMGO * weather_factor; // Auxiliary in SECA

  // Port consumption (assume 1 day in port)
  const portVLSFO = profile.portVLSFO;
  const portLSMGO = profile.portLSMGO;

  return {
    VLSFO: Math.ceil(seaVLSFO + portVLSFO),
    LSMGO: Math.ceil(seaLSMGO_normal + seaLSMGO_SECA_main + seaLSMGO_SECA_aux + portLSMGO),
  };
}

/**
 * Calculate sailing days based on distance and average speed
 */
export function calculateSailingDays(distance_nm: number, speed_knots: number = 12.5): number {
  return Math.ceil(distance_nm / (speed_knots * 24));
}

/**
 * Initialize route consumption data
 */
export function initializeRouteConsumption(): void {
  Object.keys(routes).forEach((routeKey) => {
    const route = routes[routeKey];
    route.total_consumption = calculateRouteConsumption(route, consumptionProfile);
  });
}

// Initialize route consumption on module load
initializeRouteConsumption();

/**
 * Get bunker port by name
 */
export function getBunkerPort(name: string): BunkerPort | undefined {
  return bunkerPorts.find((port) => port.name === name);
}

/**
 * Calculate total bunker cost
 */
export function calculateBunkerCost(
  port: BunkerPort,
  quantity: { VLSFO: number; LSMGO: number }
): number {
  return (
    quantity.VLSFO * port.VLSFO_price + quantity.LSMGO * port.LSMGO_price
  );
}

/**
 * Generate analysis result for a cargo
 */
export function generateAnalysisResult(
  cargo: Cargo,
  currentROB: ROB,
  route: RouteAnalysis,
  bunkerPort: BunkerPort
): AnalysisResult {
  const requiredROB = route.total_consumption;
  const estimatedDepartureROB: ROB = {
    ...currentROB,
    VLSFO: currentROB.VLSFO - 5, // Assume some consumption before departure
    LSMGO: currentROB.LSMGO - 2,
    timestamp: cargo.loadingDate,
  };

  const shortfall = {
    VLSFO: Math.max(0, requiredROB.VLSFO - estimatedDepartureROB.VLSFO),
    LSMGO: Math.max(0, requiredROB.LSMGO - estimatedDepartureROB.LSMGO),
  };

  // Add safety margin (10%)
  const bunkerQuantity = {
    VLSFO: Math.ceil(shortfall.VLSFO * 1.1),
    LSMGO: Math.ceil(shortfall.LSMGO * 1.1),
  };

  const totalBunkerCost = calculateBunkerCost(bunkerPort, bunkerQuantity);
  const netProfit = cargo.freight - totalBunkerCost;

  return {
    cargoId: cargo.id,
    viable: netProfit > 0 && shortfall.VLSFO >= 0 && shortfall.LSMGO >= 0,
    currentROB,
    estimatedDepartureROB,
    requiredROB,
    shortfall,
    recommendedBunkerPort: bunkerPort,
    bunkerQuantity,
    totalBunkerCost,
    netProfit,
    route,
  };
}

// Export all dummy data
export const dummyMaritimeData = {
  currentVesselPosition,
  currentROB,
  consumptionProfile,
  bunkerPorts,
  sampleCargoes,
  routes,
};
