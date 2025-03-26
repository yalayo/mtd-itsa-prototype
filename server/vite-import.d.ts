/** 
 * Type declaration for vite.config import 
 */

declare module '../vite.config' {
  import { UserConfig } from 'vite';
  const config: UserConfig;
  export default config;
}