import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Theme entry modules and the id the inline script in index.html uses.
const THEME_ENTRIES: Record<string, RegExp> = {
  ide: /\/src\/editor\/IdeApp\.tsx$/,
  midnight: /\/src\/midnight\/MidnightApp\.tsx$/,
};

/**
 * Themes are lazy chunks, so normally the browser only discovers them after
 * the main bundle runs. This writes each theme's JS and CSS file names into
 * index.html, where the inline theme script preloads the chosen theme's files
 * in parallel with the main bundle.
 */
function themePreload(): Plugin {
  return {
    name: 'theme-preload',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html;
        const entryFiles = new Set(
          Object.values(ctx.bundle)
            .filter((c) => c.type === 'chunk' && c.isEntry)
            .map((c) => c.fileName),
        );
        const assets: Record<string, { js: string[]; css: string[] }> = {};
        for (const chunk of Object.values(ctx.bundle)) {
          if (chunk.type !== 'chunk' || !chunk.facadeModuleId) continue;
          const id = chunk.facadeModuleId.replace(/\\/g, '/');
          const theme = Object.keys(THEME_ENTRIES).find((t) => THEME_ENTRIES[t].test(id));
          if (!theme) continue;
          const js = [chunk.fileName, ...chunk.imports.filter((f) => !entryFiles.has(f))];
          const css = [...(chunk.viteMetadata?.importedCss ?? [])];
          assets[theme] = { js: js.map((f) => `/${f}`), css: css.map((f) => `/${f}`) };
        }
        return html.replace('<!--theme-assets-->', `<script>window.__themeAssets = ${JSON.stringify(assets)};</script>`);
      },
    },
  };
}

// Production builds use Preact (about 4 KB) in place of React (about 45 KB)
// through its compatibility layer; the app code stays plain React. Dev keeps
// real React so Fast Refresh works.
const preactAliases = [
  { find: /^react-dom\/client$/, replacement: 'preact/compat/client' },
  { find: /^react-dom$/, replacement: 'preact/compat' },
  { find: /^react\/jsx-runtime$/, replacement: 'preact/jsx-runtime' },
  { find: /^react$/, replacement: 'preact/compat' },
];

export default defineConfig(({ command }) => ({
  plugins: [react(), themePreload()],
  resolve: { alias: command === 'build' ? preactAliases : [] },
}));
