const Config = {
    supabase: {
        url: 'https://scbihxaceelyygrlacvm.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjYmloeGFjZWVseXlncmxhY3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NjU3MTcsImV4cCI6MjA4NTE0MTcxN30.rgUH-kltyNX99-HTDmGEyzGyu8qFXR9LF1QxsjY0W44'
    },
    items: [
        { id: 'w_speed', name: 'Vitesse', cost: 0, type: 'widget', icon:'gauge-high' },
        { id: 'w_alt', name: 'Altitude', cost: 0, type: 'widget', icon:'mountain' },
        { id: 'w_head', name: 'Cap', cost: 0, type: 'widget', icon:'compass' },
        { id: 'w_temp', name: 'Météo', cost: 0, type: 'widget', icon:'cloud' }
    ]
};
// Initialisation de sécurité
window.AppState = window.AppState || { supabase: null, map: null, user: null, profile: null, activeFeatures: {} };
