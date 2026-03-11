// @ts-check 
/** Enables TypeScript type checking for this JavaScript configuration file */

// Import necessary modules
import { defineConfig, fontProviders } from 'astro/config';
import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';
import { spawn } from 'node:child_process';

// Export the Astro configuration https://astro.build/config
export default defineConfig({
  // Sets default to static; use 'export const prerender = false;' in pages/APIs to opt-into SSR/Dynamic mode.
  output: 'static',
  // Host environment – Tells Astro how to build the site for specific platforms (Netlify, Node, etc.)
  adapter: netlify(),
  // Disable "Pretty URLs" in Netlify Dashboard.
  trailingSlash: 'never',
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-inter',
    },
    {
      provider: fontProviders.google(),
      name: 'Quicksand',
      cssVariable: '--font-quicksand',
    }
  ],
  build: {
    format: 'file' // Output pages as standalone .html files (e.g., /services.html) to support clean URLs (/services)
  },
  server: {
    host: true,   // or '0.0.0.0'
    port: 4321,
  },
  devToolbar: {
    enabled: false,
  },
  vite: {
    plugins: [tailwindcss()],
  }
});