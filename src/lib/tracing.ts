/**
 * Tracing utility for monitoring application performance, navigation, and errors.
 * Uses the browser's built-in Performance API and structured console logging.
 */

export type TraceLevel = "info" | "warn" | "error" | "debug";

export interface TraceEvent {
  id: string;
  type: string;
  name: string;
  timestamp: number;
  duration?: number;
  level: TraceLevel;
  data?: Record<string, unknown>;
}

const SESSION_ID = `session_${crypto.randomUUID()}`;

function generateId(): string {
  return crypto.randomUUID();
}

function log(level: TraceLevel, message: string, data?: Record<string, unknown>) {
  const prefix = `[Trace][${new Date().toISOString()}]`;
  if (level === "error") {
    console.error(prefix, message, data ?? "");
  } else if (level === "warn") {
    console.warn(prefix, message, data ?? "");
  } else if (level === "debug") {
    console.debug(prefix, message, data ?? "");
  } else {
    console.info(prefix, message, data ?? "");
  }
}

/**
 * Record a trace event to the console.
 */
export function trace(
  name: string,
  type: string,
  level: TraceLevel = "info",
  data?: Record<string, unknown>
): TraceEvent {
  const event: TraceEvent = {
    id: generateId(),
    type,
    name,
    timestamp: performance.now(),
    level,
    data: { ...data, sessionId: SESSION_ID },
  };
  log(level, `[${type}] ${name}`, event.data);
  return event;
}

/**
 * Start a performance span. Returns a function to end the span and record its duration.
 */
export function startSpan(
  name: string,
  type: string,
  data?: Record<string, unknown>
): () => TraceEvent {
  const startTime = performance.now();
  const markName = `trace_start_${name}_${startTime}`;
  performance.mark(markName);

  return function endSpan(extraData?: Record<string, unknown>): TraceEvent {
    const endTime = performance.now();
    const duration = endTime - startTime;
    try {
      performance.measure(name, markName);
    } catch {
      // measurement may fail if marks were cleared
    }
    const event: TraceEvent = {
      id: generateId(),
      type,
      name,
      timestamp: startTime,
      duration,
      level: "info",
      data: { ...data, ...extraData, sessionId: SESSION_ID, durationMs: duration.toFixed(2) },
    };
    log("info", `[${type}] ${name} completed in ${duration.toFixed(2)}ms`, event.data);
    return event;
  };
}

/**
 * Track a page navigation event.
 */
export function traceNavigation(path: string, previousPath?: string): void {
  trace("page_navigation", "navigation", "info", { path, previousPath });
}

/**
 * Track a user interaction (click, form submit, etc.).
 */
export function traceInteraction(element: string, action: string, data?: Record<string, unknown>): void {
  trace(`${action}_${element}`, "interaction", "info", { element, action, ...data });
}

/**
 * Track an API call.
 */
export function traceApiCall(
  endpoint: string,
  method: string,
  data?: Record<string, unknown>
): () => TraceEvent {
  trace(`api_${method}_${endpoint}`, "api", "info", { endpoint, method, ...data });
  return startSpan(`api_${method}_${endpoint}`, "api", { endpoint, method, ...data });
}

/**
 * Track an error.
 */
export function traceError(error: Error | string, context?: string, data?: Record<string, unknown>): void {
  const message = error instanceof Error ? error.message : error;
  const stack = error instanceof Error ? error.stack : undefined;
  trace(`error_${context ?? "unknown"}`, "error", "error", { message, stack, context, ...data });
}

/**
 * Initialize tracing — sets up global error listeners and logs application startup.
 */
export function initTracing(): void {
  trace("app_start", "lifecycle", "info", {
    userAgent: navigator.userAgent,
    url: window.location.href,
    sessionId: SESSION_ID,
  });

  window.addEventListener("error", (event) => {
    traceError(event.error ?? event.message, "uncaught_error", {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason instanceof Error ? event.reason : String(event.reason);
    traceError(reason, "unhandled_promise_rejection");
  });

  log("info", "Tracing initialized", { sessionId: SESSION_ID });
}
