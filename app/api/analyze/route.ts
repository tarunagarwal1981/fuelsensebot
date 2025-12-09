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
    const { cargoInput } = body;

    // Create a ReadableStream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Helper to send SSE message
        const sendMessage = (type: string, data: unknown) => {
          const message = createSSEMessage(type, data);
          controller.enqueue(encoder.encode(message));
        };

        try {
          // Step 1: Getting vessel ROBs
          sendMessage('status', { message: '🔍 Getting vessel ROBs...' });
          await delay(500);

          // Step 2: Parse cargo input
          sendMessage('status', { message: '📋 Parsing cargo information...' });
          await delay(500);

          let cargoesToAnalyze: Cargo[] = [];

          if (cargoInput) {
            // Try to parse from user input
            const parsed = parseCargoInput(cargoInput);
            if (parsed) {
              // Create a cargo from parsed input
              cargoesToAnalyze.push({
                id: `CARGO-${Date.now()}`,
                from: parsed.from,
                to: parsed.to,
                freight: 700000, // Default freight
                loadingDate: new Date().toISOString(),
              });
            }
          }

          // If no valid input, analyze both sample cargoes
          if (cargoesToAnalyze.length === 0) {
            cargoesToAnalyze = sampleCargoes;
          }

          // Step 3: Calculate route
          sendMessage('status', { message: '📍 Calculating route requirements...' });
          await delay(500);

          // Step 4: Finding bunker ports
          sendMessage('status', { message: '⛽ Finding bunker ports...' });
          await delay(500);

          // Step 5: Analyzing costs
          sendMessage('status', { message: '💰 Analyzing costs and profitability...' });
          await delay(500);

          // Analyze each cargo
          const results: AnalysisResult[] = [];

          for (let i = 0; i < cargoesToAnalyze.length; i++) {
            const cargo = cargoesToAnalyze[i];
            
            if (i > 0) {
              sendMessage('status', {
                message: `📊 Analyzing cargo ${i + 1}/${cargoesToAnalyze.length}...`,
              });
              await delay(500);
            }

            const analysis = analyzeCargo(cargo);
            results.push(analysis);

            // Send individual result
            sendMessage('result', {
              cargoId: cargo.id,
              analysis,
            });
            await delay(300);
          }

          // Step 6: Complete
          sendMessage('status', { message: '✅ Analysis complete!' });
          await delay(300);

          // Send final summary
          sendMessage('complete', {
            results,
            summary: {
              totalCargoes: results.length,
              viableCargoes: results.filter((r) => r.viable).length,
              totalProfit: results.reduce((sum, r) => sum + r.netProfit, 0),
            },
          });

          // Close the stream
          controller.close();
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred';
          sendMessage('error', { message: errorMessage });
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
