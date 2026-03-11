/**
 * Global Actions Registry (The Switchboard)
 * 
 * ASTRO REQUIREMENT:
 * This is a 'Reserved File' required by Astro's internal build engine. It serves 
 * as the central RPC (Remote Procedure Call) entry point for the entire application.
 * 
 * PURPOSE:
 * 1. Framework Registration: Astro reads this file to generate the hidden API routes (e.g. /_actions/...)
 * 2. Type Safety: It enables the 'astro:actions' virtual module, providing Intellisense in the IDE.
 * 3. Modularity: Actual logic is decentralised into module folders. This file simply 'publishes' 
 *    them to the framework.
 *
 * Related files:
 * Related files:
 *   - src/backend/modules/[module]/actions.ts (The logic)
 *   - src/backend/actions.ts (The backend registry)
 */
import { backendActions } from "@stimsdesign/backend/actions";

export const server = {
    ...backendActions,
    // Note: Future frontend-only actions (like a public contact form) can be added directly to this object!
};
