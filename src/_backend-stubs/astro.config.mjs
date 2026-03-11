// @ts-check 
/** Enables TypeScript type checking for this JavaScript configuration file */

// Import necessary modules
import backendIntegration from '@stimsdesign/backend/integration';

// Export the Astro configuration https://astro.build/config
export default defineConfig({
  integrations: [
    backendIntegration(),
    {
      name: 'db-sync-on-build',
    hooks: {
      'astro:build:done': async () => {
        // Only run if DATABASE_URL is present (typical for Prod/Netlify)
        
        console.log('\n🚀 [Auto-DB-Sync] Build complete. Syncing database schema...');
        
        await new Promise((resolve, reject) => {
          const child = spawn('npm', ['run', 'db:sync'], { 
            stdio: 'inherit', 
            shell: true,
            env: { ...process.env, FORCE_COLOR: '1' } // Preserve colors
          });
          
          child.on('close', (code) => {
            if (code === 0) {
              console.log('✅ [Auto-DB-Sync] Schema synced successfully.\n');
              resolve(null);
            } else {
              console.error(`❌ [Auto-DB-Sync] Failed with exit code ${code}.\n`);
              reject(new Error(`DB Sync failed with code ${code}`));
            }
          });
        });
      }
    }
  }]
});