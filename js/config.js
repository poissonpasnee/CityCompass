const Config = {
    supabase: {
        // Retour aux anciennes clés qui fonctionnaient (scbihx...)
        url: 'https://scbihxaceelyygrlacvm.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjYmloeGFjZWVseXlncmxhY3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NjU3MTcsImV4cCI6MjA4NTE0MTcxN30.rgUH-kltyNX99-HTDmGEyzGyu8qFXR9LF1QxsjY0W44'
    },
    items: [
        { id: 'style_marker_car', name: 'Voiture', cost: 150, type: 'marker', icon:'🚗' },
        { id: 'style_marker_ufo', name: 'OVNI', cost: 300, type: 'marker', icon:'🛸' },
        { id: 'map_sat', name: 'Satellite', cost: 500, type: 'map', icon:'🛰️' },
        { id: 'map_dark', name: 'Nuit', cost: 200, type: 'map', icon:'🌃' },
        { id: 'tool_cam_night', name: 'Vision Nuit', cost: 500, type: 'tool', icon:'🟩' }
    ]
};
window.AppState = { supabase: null, map: null, user: null, profile: null, activeFeatures: {} };
