// Agent logic for the chatbot
import type {
  ROB,
  VesselPosition,
  ConsumptionProfile,
  BunkerPort,
  Cargo,
  RouteAnalysis,
  AnalysisResult,
} from './types';
import {
  currentROB,
  currentVesselPosition,
  consumptionProfile,
  bunkerPorts,
  calculateRouteConsumption,
  calculateSailingDays,
  getBunkerPort,
  calculateBunkerCost,
} from './dummyData';

/**
 * 1. Get current vessel ROB with unverified badge
 */
export function getVesselROB(): ROB {
  return { ...currentROB };
}

/**
 * 2. Get current vessel position and next port
 */
export function getVesselPosition(): VesselPosition {
  return { ...currentVesselPosition };
}

/**
 * 3. Calculate port consumption to Rotterdam + 3 days port stay
 */
export function calculatePortConsumption(
  profile: ConsumptionProfile = consumptionProfile,
  portDays: number = 3
): { VLSFO: number; LSMGO: number } {
  // Calculate consumption to Rotterdam (assume 1 day sailing from current position)
  const distanceToRotterdam = 50; // nm (approximate from North Sea)
  const daysToRotterdam = calculateSailingDays(distanceToRotterdam);
  
  const seaConsumption = {
    VLSFO: daysToRotterdam * profile.seaVLSFO,
    LSMGO: daysToRotterdam * profile.seaLSMGO,
  };

  // Port consumption for 3 days
  const portConsumption = {
    VLSFO: portDays * profile.portVLSFO,
    LSMGO: portDays * profile.portLSMGO,
  };

  return {
    VLSFO: Math.ceil(seaConsumption.VLSFO + portConsumption.VLSFO),
    LSMGO: Math.ceil(seaConsumption.LSMGO + portConsumption.LSMGO),
  };
}

/**
 * 4. Calculate estimated departure ROB (current ROB minus estimated consumption)
 */
export function calculateDepartureROB(
  current: ROB = currentROB,
  portDays: number = 3
): ROB {
  const portConsumption = calculatePortConsumption(consumptionProfile, portDays);
  
  return {
    ...current,
    VLSFO: Math.max(0, current.VLSFO - portConsumption.VLSFO),
    LSMGO: Math.max(0, current.LSMGO - portConsumption.LSMGO),
    timestamp: new Date().toISOString(),
  };
}

/**
 * 5. Calculate route requirements (distance, days, consumption) - handles SECA for US route
 */
export function calculateRouteRequirements(
  from: string,
  to: string
): RouteAnalysis {
  // Route lookup based on port names
  const routeKey = `${from}-${to}`;
  
  // Known routes
  const knownRoutes: Record<string, Omit<RouteAnalysis, 'total_consumption'>> = {
    'Rotterdam-Singapore': {
      distance_nm: 8500,
      sailing_days: 18,
      weather_factor: 1.05,
    },
    'Rotterdam-US East Coast': {
      distance_nm: 3800,
      sailing_days: 12,
      SECA_distance_nm: 500, // SECA zone requires LSMGO
      weather_factor: 1.08,
    },
    'Singapore-Rotterdam': {
      distance_nm: 8500,
      sailing_days: 18,
      weather_factor: 1.05,
    },
    'US East Coast-Rotterdam': {
      distance_nm: 3800,
      sailing_days: 12,
      SECA_distance_nm: 500,
      weather_factor: 1.08,
    },
  };

  const routeData = knownRoutes[routeKey];
  
  if (!routeData) {
    // Default route calculation if not in known routes
    const distance_nm = 2000; // Default estimate
    const sailing_days = calculateSailingDays(distance_nm);
    routeData = {
      distance_nm,
      sailing_days,
      weather_factor: 1.05,
    };
  }

  const route: RouteAnalysis = {
    ...routeData,
    total_consumption: calculateRouteConsumption(
      { ...routeData, total_consumption: { VLSFO: 0, LSMGO: 0 } },
      consumptionProfile
    ),
  };

  return route;
}

/**
 * 6. Find available bunker ports for a route (from, to)
 */
export function findBunkerPorts(from: string, to: string): BunkerPort[] {
  // Filter bunker ports based on route
  // For Singapore route: Rotterdam, Gibraltar, Fujairah
  // For US route: Rotterdam, Panama
  
  const availablePorts: BunkerPort[] = [];
  
  if (to.toLowerCase().includes('singapore')) {
    // Singapore route ports
    const portNames = ['Rotterdam', 'Gibraltar', 'Fujairah'];
    portNames.forEach((name) => {
      const port = getBunkerPort(name);
      if (port) availablePorts.push(port);
    });
  } else if (to.toLowerCase().includes('us') || to.toLowerCase().includes('east coast')) {
    // US route ports
    const portNames = ['Rotterdam', 'Panama'];
    portNames.forEach((name) => {
      const port = getBunkerPort(name);
      if (port) availablePorts.push(port);
    });
  } else {
    // Default: return all ports
    availablePorts.push(...bunkerPorts);
  }

  return availablePorts;
}

/**
 * 7. Calculate optimal bunkering (quantity needed + 3-4 day buffer)
 */
export function calculateOptimalBunkering(
  shortfall: { VLSFO: number; LSMGO: number },
  bufferDays: number = 3.5
): { VLSFO: number; LSMGO: number } {
  // Calculate buffer consumption
  const bufferConsumption = {
    VLSFO: bufferDays * consumptionProfile.seaVLSFO,
    LSMGO: bufferDays * consumptionProfile.seaLSMGO,
  };

  // Add buffer to shortfall
  return {
    VLSFO: Math.ceil(shortfall.VLSFO + bufferConsumption.VLSFO),
    LSMGO: Math.ceil(shortfall.LSMGO + bufferConsumption.LSMGO),
  };
}

/**
 * 8. Complete cargo analysis returning AnalysisResult
 */
export function analyzeCargo(cargo: Cargo): AnalysisResult {
  // Get current ROB
  const current = getVesselROB();
  
  // Calculate departure ROB (after consumption to Rotterdam + port stay)
  const estimatedDepartureROB = calculateDepartureROB(current, 3);
  
  // Calculate route requirements
  const route = calculateRouteRequirements(cargo.from, cargo.to);
  const requiredROB = route.total_consumption;
  
  // Calculate shortfall
  const shortfall = {
    VLSFO: Math.max(0, requiredROB.VLSFO - estimatedDepartureROB.VLSFO),
    LSMGO: Math.max(0, requiredROB.LSMGO - estimatedDepartureROB.LSMGO),
  };
  
  // Find available bunker ports
  const availablePorts = findBunkerPorts(cargo.from, cargo.to);
  
  // Select optimal bunker port (lowest cost that meets requirements)
  let recommendedBunkerPort: BunkerPort = availablePorts[0];
  let lowestCost = Infinity;
  
  for (const port of availablePorts) {
    if (!port.VLSFO_available || !port.LSMGO_available) continue;
    
    const bunkerQuantity = calculateOptimalBunkering(shortfall);
    const cost = calculateBunkerCost(port, bunkerQuantity);
    
    if (cost < lowestCost) {
      lowestCost = cost;
      recommendedBunkerPort = port;
    }
  }
  
  // Calculate final bunker quantity with buffer
  const bunkerQuantity = calculateOptimalBunkering(shortfall);
  const totalBunkerCost = calculateBunkerCost(recommendedBunkerPort, bunkerQuantity);
  
  // Calculate net profit
  const netProfit = cargo.freight - totalBunkerCost;
  
  // Determine viability
  const viable = 
    netProfit > 0 && 
    shortfall.VLSFO >= 0 && 
    shortfall.LSMGO >= 0 &&
    recommendedBunkerPort.VLSFO_available &&
    recommendedBunkerPort.LSMGO_available;
  
  return {
    cargoId: cargo.id,
    viable,
    currentROB: current,
    estimatedDepartureROB,
    requiredROB,
    shortfall,
    recommendedBunkerPort,
    bunkerQuantity,
    totalBunkerCost,
    netProfit,
    route,
  };
}

/**
 * Parse cargo input from user message (extract ports)
 */
export function parseCargoInput(input: string): { from: string; to: string } | null {
  // Try to extract port names from input
  const commonPorts = [
    'Rotterdam',
    'Singapore',
    'US East Coast',
    'Gibraltar',
    'Fujairah',
    'Panama',
    'New York',
    'Houston',
    'Los Angeles',
  ];
  
  const foundPorts: string[] = [];
  
  for (const port of commonPorts) {
    if (input.toLowerCase().includes(port.toLowerCase())) {
      foundPorts.push(port);
    }
  }
  
  if (foundPorts.length >= 2) {
    // Assume first is 'from', second is 'to'
    return {
      from: foundPorts[0],
      to: foundPorts[1],
    };
  }
  
  // Try to match common patterns
  const fromMatch = input.match(/from\s+([A-Za-z\s]+)/i);
  const toMatch = input.match(/to\s+([A-Za-z\s]+)/i);
  
  if (fromMatch && toMatch) {
    return {
      from: fromMatch[1].trim(),
      to: toMatch[1].trim(),
    };
  }
  
  return null;
}
