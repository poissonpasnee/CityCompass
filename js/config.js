// js/config.js

// URL de ton projet Supabase
const SUPABASE_URL = 'https://scbihxaceelyygrlacvm.supabase.co';

// Clé publique (anon key)
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjYmloeGFjZWVseXlncmxhY3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NjU3MTcsImV4cCI6MjA4NTE0MTcxN30.rgUH-kltyNX99-HTDmGEyzGyu8qFXR9LF1QxsjY0W44';

// Initialisation du client Supabase
// (Assure-toi que le script supabase-js est chargé dans index.html avant ce fichier)
if (window.supabase) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    // Pour simplifier l'accès dans les autres scripts
    window.supabase = window.supabaseClient; 
} else {
    console.error("Erreur critique : La librairie Supabase n'est pas chargée. Vérifie ton index.html");
}
