import type { IModuleDefinition } from './IModuleDefinition';

/**
 * Vite's `import.meta.glob` loads all `index.ts` files
 * under `src/modules/*index.ts` eagerly by default. 
 * (Change `{ eager: true }` to do lazy loading if desired.)
 */
const modules = import.meta.glob<{ default: IModuleDefinition }>(
  './*/index.ts',
  { eager: true }
);

/**
 * Convert modules to an array of IModuleDefinition
 */
const loadedModules: IModuleDefinition[] = Object.values(modules).map(
  (mod) => mod.default
);

export default loadedModules;
