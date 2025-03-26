/**
 * This provides type declarations for the '../vite.config' import in server/vite.ts
 */

declare module '../vite.config' {
  import { UserConfig } from 'vite';
  const config: UserConfig;
  export default config;
}