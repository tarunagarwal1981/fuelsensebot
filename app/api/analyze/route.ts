import { NextRequest } from 'next/server';
import { analyzeCargo, parseCargoInput } from '@/lib/agents';
import { sampleCargoes } from '@/lib/dummyData';
import type { Cargo, AnalysisResult } from '@/lib/types';

// Helper to create SSE message
function createSSEMessage(type: string, data: unknown): string {
  return `data: ${JSON.stringify({ type, data })}\n\n`;
}

// Helper to delay execution
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, cargoInput, cargoes } = body;
    const input = message || cargoInput;

    // Create a ReadableStream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Helper to send SSE message in simple format
        const sendStatus = (status: string) => {
          const message = `data: ${JSON.stringify({ status })}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        const sendAnalyses = (analyses: AnalysisResult[]) => {
          const message = `data: ${JSON.stringify({ analyses })}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        try {
          // Step 1: Getting vessel ROBs
          sendStatus('🔍 Getting vessel ROBs...');
          await delay(500);

          // Step 2: Parse cargo input
          sendStatus('📋 Parsing cargo information...');
          await delay(500);

          let cargoesToAnalyze: Cargo[] = [];

          // Priority 1: Use cargoes from selection interface
          if (cargoes && Array.isArray(cargoes) && cargoes.length > 0) {
            cargoesToAnalyze = cargoes.map((c: any, index: number) => ({
              id: `CARGO-${Date.now()}-${index}`,
              from: c.from,
              to: c.to,
              freight: c.freight || 700000,
              loadingDate: new Date().toISOString(),
            }));
          } else if (input) {
            // Priority 2: Try to parse from user input
            const parsed = parseCargoInput(input);
            if (parsed) {
              cargoesToAnalyze.push({
                id: `CARGO-${Date.now()}`,
                from: parsed.from,
                to: parsed.to,
                freight: 700000,
                loadingDate: new Date().toISOString(),
              });
            }
          }

          // Priority 3: Fallback to sample cargoes
          if (cargoesToAnalyze.length === 0) {
            cargoesToAnalyze = [...sampleCargoes];
          }
          
          console.log(`Analyzing ${cargoesToAnalyze.length} cargoes:`, cargoesToAnalyze.map(c => `${c.from} → ${c.to}`));

          // Step 3: Calculate route
          sendStatus('📍 Calculating route requirements...');
          await delay(500);

          // Step 4: Finding bunker ports
          sendStatus('⛽ Finding bunker ports...');
          await delay(500);

          // Step 5: Analyzing costs
          sendStatus('💰 Analyzing costs and profitability...');
          await delay(500);

          // Analyze each cargo
          const results: AnalysisResult[] = [];

          for (let i = 0; i < cargoesToAnalyze.length; i++) {
            const cargo = cargoesToAnalyze[i];
            
            if (i > 0) {
              sendStatus(`📊 Analyzing cargo ${i + 1}/${cargoesToAnalyze.length}...`);
              await delay(500);
            }

            const analysis = analyzeCargo(cargo);
            results.push(analysis);
            await delay(300);
          }

          // Step 6: Complete
          sendStatus('✅ Analysis complete!');
          await delay(300);

          // Send final analyses
          sendAnalyses(results);

          // Close the stream
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred';
          const errorMsg = `data: ${JSON.stringify({ error: errorMessage })}\n\n`;
          controller.enqueue(encoder.encode(errorMsg));
          controller.close();
        }
      },
    });

    // Return SSE response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
