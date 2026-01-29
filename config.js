// Configuration centralisée
const Config = {
    supabase: {
        url: 'https://scbihxaceelyygrlacvm.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjYmloeGFjZWVseXlncmxhY3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NjU3MTcsImV4cCI6MjA4NTE0MTcxN30.rgUH-kltyNX99-HTDmGEyzGyu8qFXR9LF1QxsjY0W44'
    },
    
    items: [
        { id: 'color_purple', name: 'Thème Violet', price: 200, icon: '🎨', type: 'theme', val: '#AF52DE' },
        { id: 'color_orange', name: 'Thème Orange', price: 200, icon: '🎨', type: 'theme', val: '#FF9500' },
        { id: 'color_teal', name: 'Thème Turquoise', price: 200, icon: '🎨', type: 'theme', val: '#30B0C7' },
        { id: 'w_traffic', name: 'Info Trafic', price: 100, icon: '🚦', type: 'widget' },
        { id: 'w_transit', name: 'Transports', price: 150, icon: '🚇', type: 'widget' },
        { id: 'w_bike', name: 'Pistes Cyclables', price: 150, icon: '🚲', type: 'widget' },
        { id: 'w_ghost', name: 'Mode Fantôme', price: 500, icon: '👻', type: 'widget', desc: 'Cache votre position' },
        { id: 'w_speed', name: 'Speedomètre', price: 300, icon: '🏎️', type: 'widget', desc: 'Vitesse temps réel' },
        { id: 'w_3d', name: 'Bâtiments 3D', price: 400, icon: '🏢', type: 'widget' },
        { id: 'w_weather', name: 'Météo', price: 250, icon: '☁️', type: 'widget' }
    ],
    
    mapLayers: {
        standard: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        sat: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    },
    
    defaultLocation: [43.6, 1.4], // Toulouse
    defaultZoom: 13
};

// Variables globales
window.AppState = {
    supabase: null,
    map: null,
    userMarker: null,
    currentUser: null,
    userProfile: null,
    theme: 'light',
    lastLocation: null,
    navTarget: null,
    searchTimer: null
};
