import { useEffect, useState } from "react";
import { fetchResults } from "@/lib/api";
import type { Candidate } from "@/lib/types";

const POLL_INTERVAL_MS = 2500;
const TIMEOUT_MS = 90000;

interface PollState {
  candidates: Candidate[];
  processedCount: number;
  isComplete: boolean;
  timedOut: boolean;
  error: string | null;
}

export function usePollResults(batchId: string | null, expected: number, enabled: boolean): PollState {
  const [state, setState] = useState<PollState>({
    candidates: [],
    processedCount: 0,
    isComplete: false,
    timedOut: false,
    error: null,
  });

  useEffect(() => {
    if (!enabled || !batchId) return;

    let cancelled = false;
    const startedAt = Date.now();

    async function poll() {
      try {
        const result = await fetchResults(batchId as string, expected);
        if (cancelled) return;

        const timedOut = !result.isComplete && Date.now() - startedAt > TIMEOUT_MS;

        setState({
          candidates: result.candidates,
          processedCount: result.processedCount,
          isComplete: result.isComplete,
          timedOut,
          error: null,
        });

        if (!result.isComplete && !timedOut) {
          timer = setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch (err) {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : "Failed to fetch results.",
        }));
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }

    let timer: ReturnType<typeof setTimeout> = setTimeout(poll, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [batchId, expected, enabled]);

  return state;
}
