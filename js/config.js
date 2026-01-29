const Config = {
    supabase: {
        url: 'https://vjlfbcwnfwyrxstfvefq.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqbGZiY3duZnd5cnhzdGZ2ZWZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMDc2MjcsImV4cCI6MjA4NDc4MzYyN30.WTuWbxB-8isJOp2lNnq73njQmifDjxTNEWngMgKtmv4'
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
