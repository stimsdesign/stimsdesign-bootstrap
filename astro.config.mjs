// @ts-check 
/** Enables TypeScript type checking for this JavaScript configuration file */

// Import necessary modules
import { fontProviders } from "astro/config";
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import { Site } from "./src/site.config";
import path from "path";

// Export the Astro configuration https://astro.build/config
export default defineConfig({
  integrations: [],
  image: {
    domains: ['unsplash.it', 'picsum.photos'],
  },
  vite: {
    resolve: {
      alias: {
        '@theme': path.resolve(`./src/assets/css/themes/${Site.Theme}`),
        '@form-styles': path.resolve(`./src/assets/css/forms/${Site.Forms}`),
        '@images': path.resolve('./src/assets/images'),
        '@layouts': path.resolve('./src/layouts'),
        '@cards': path.resolve('./src/components/cards'),
        '@elements': path.resolve('./src/components/elements'),
        '@forms': path.resolve('./src/components/forms'),
        '@layout': path.resolve('./src/components/layout'),
        '@navigation': path.resolve('./src/components/navigation'),
        '@sections': path.resolve('./src/components/sections'),
        '@hero': path.resolve('./src/components/hero'),
        '@scripts': path.resolve('./src/assets/scripts'),
      },
    },
  },
  // Sets default to static; use 'export const prerender = false;' in pages/APIs to opt-into SSR/Dynamic mode.
  output: 'static',
  // Host environment – Tells Astro how to build the site for specific platforms (Netlify, Node, etc.)
  adapter: netlify(),
  // Disable "Pretty URLs" in Netlify Dashboard.
  trailingSlash: 'never',
  // Import Fonts
  fonts: [
      {
          provider: fontProviders.google(),
          name: 'Raleway',
          cssVariable: '--font-raleway',
          // weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
          weights: ['900']
      },
      {
          provider: fontProviders.google(),
          name: 'Quicksand',
          cssVariable: '--font-quicksand',
          // weights: ['300', '400', '500', '600', '700']
          weights: ['400', '700']
      },
      {
          provider: fontProviders.google(),
          name: 'Roboto Condensed',
          cssVariable: '--font-roboto-condensed',
          weights: ['500','900']
      },
  ], 
  // Prefetch Settings  
  prefetch: {
    defaultStrategy: 'viewport'
  },
  // Build Settings
  build: {
    format: 'file' // Output pages as standalone .html files (e.g., /services.html) to support clean URLs (/services)
  },
  // Server Settings
  server: {
    host: true,   // or '0.0.0.0'
    port: 4321,
  },
  // Dev Toolbar Settings
  devToolbar: {
    enabled: false,
  },
});