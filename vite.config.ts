import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "icons/*.png",
        "screenshots/*.png",
        "splashscreens/*.png",
        "favicon.ico",
        "robots.txt",
        "apple-touch-icon.png"
      ],
      manifest: {
        name: "ExecFlow - Task Tracker",
        short_name: "ExecFlow",
        description: "Task Delegation & Follow-up Tracker for teams and organizations",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        id: "/",
        icons: [
          {
            src: "/icons/icon-72x72.png",
            sizes: "72x72",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/icons/icon-96x96.png",
            sizes: "96x96",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/icons/icon-128x128.png",
            sizes: "128x128",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/icons/icon-144x144.png",
            sizes: "144x144",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/icons/icon-152x152.png",
            sizes: "152x152",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ],
        shortcuts: [
          {
            name: "New Task",
            short_name: "New Task",
            description: "Create a new task",
            url: "/tasks?action=new",
            icons: [
              {
                src: "/icons/task-icon.png",
                sizes: "192x192"
              }
            ]
          },
          {
            name: "Follow-ups",
            short_name: "Follow-ups",
            description: "View pending follow-ups",
            url: "/follow-ups",
            icons: [
              {
                src: "/icons/followup-icon.png",
                sizes: "192x192"
              }
            ]
          }
        ],
        categories: ["productivity", "business", "tasks"],
        lang: "en",
        dir: "auto"
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "firestore-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: "module",
        navigateFallback: "index.html"
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-tabs"]
        }
      }
    }
  }
}));