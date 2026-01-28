// config.js (ESM)
export const CONFIG = {
  APP_NAME: "CityCompass",
  VERSION: "v37.0",

  // Supabase (optionnel dans cette version : tu peux brancher plus tard)
  SUPABASE_URL: https://scbihxaceelyygrlacvm.supabase.co,
  SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjYmloeGFjZWVseXlncmxhY3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NjU3MTcsImV4cCI6MjA4NTE0MTcxN30.rgUH-kltyNX99-HTDmGEyzGyu8qFXR9LF1QxsjY0W44,

  // Centre par défaut (Toulouse)
  DEFAULT_CENTER: { lat: 43.6047, lon: 1.4442 },
  DEFAULT_ZOOM: 15,

  // Tuiles (CARTO)
  TILES: {
    subdomains: "abcd",
    maxZoom: 20,
    lightStyle: "light_all",
    darkStyle: "dark_all",
    // Base URL : https://{s}.basemaps.cartocdn.com/{style}/{z}/{x}/{y}{scale}.png
    base: "https://{s}.basemaps.cartocdn.com/{style}/{z}/{x}/{y}{scale}.png"
  },

  // Widgets Boutique (anciens + actuels, sans chat)
  WIDGETS: [
    { id: "w_sonar",        name: "Sonar actif",           price: 300,  icon: "SONAR", desc: "Ping + détection de points proches (local).", type: "feature" },
    { id: "w_traces",       name: "Traceur GPS",           price: 200,  icon: "TRACE", desc: "Affiche une trace simple de ton trajet.",      type: "feature" },
    { id: "w_nightvision",  name: "Vision nocturne",       price: 150,  icon: "NIGHT", desc: "Accentue le contraste (UI).",                 type: "cosmetic" },
    { id: "w_satellite",    name: "Style carte sombre+",   price: 250,  icon: "MAP",   desc: "Basculer entre styles de carte.",             type: "feature" },
    { id: "w_compass_plus", name: "Boussole stabilisée+",  price: 180,  icon: "COMP",  desc: "Lissage amélioré de l’aiguille.",            type: "feature" },
    { id: "w_ar_beta",      name: "Mode AR (bêta)",        price: 800,  icon: "AR",    desc: "Expérimental (placeholder UI).",           type: "beta" },

    // Réservé admin (si tu veux l’afficher seulement selon rôle plus tard)
    { id: "w_godmode",      name: "God Mode",              price: 9999, icon: "ADMIN", desc: "Outils admin (placeholder UI).",             type: "admin", adminOnly: true }
  ]
};


