/**
 * Active adapter set. This is the single swap point for a second pass:
 *
 *   import { createRealAdapters } from './real';   // watsonx Orchestrate,
 *   export const adapters = createRealAdapters();  // watsonx.governance, Ignite FHIR
 *
 * Everything in src/components and src/lib/store imports `adapters` from
 * here and never touches fixture data or fetch directly for "calls".
 */

import { createMockAdapters } from './mock';

export type { Adapters, GovernanceAdapter, ModelRouterAdapter, OrchestratorAdapter, SystemOfRecordAdapter } from './types';

export const ADAPTER_MODE = 'mock' as const;

export const adapters = createMockAdapters();
