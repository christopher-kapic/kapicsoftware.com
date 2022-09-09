import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import partytown from "@astrojs/partytown";
import svelte from "@astrojs/svelte";
import sitemap from "@astrojs/sitemap";
import prefetch from "@astrojs/prefetch";
import { config } from "./src/config";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), partytown(), svelte(), sitemap(), prefetch()],
  site: config.site
});