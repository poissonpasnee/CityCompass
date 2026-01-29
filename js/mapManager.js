const MapManager = {
    poiLayer: null,

    init: () => {
        if(AppState.map) return;
        AppState.map = L.map('map', {zoomControl:false}).setView([43.6045, 1.4442], 13); // Centré Toulouse par défaut
        MapManager.setLayer('standard');
        
        // Clic sur carte
        AppState.map.on('click', e => {
            MapManager.showPopup(e.latlng, "Point Repéré");
        });
        
        // GPS
        AppState.map.locate({setView:true, watch:true});
        AppState.map.on('locationfound', e => {
            AppState.lastLoc = e.latlng;
            if(!AppState.userMarker) AppState.userMarker = L.circleMarker(e.latlng, {radius:8, color:'white', fillColor:'#007AFF', fillOpacity:1}).addTo(AppState.map);
            else AppState.userMarker.setLatLng(e.latlng);
        });
    },

    setLayer: (type) => {
        let url = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
        if(type === 'dark') url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
        if(type === 'sat') url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        
        AppState.map.eachLayer(l => l._url && AppState.map.removeLayer(l));
        L.tileLayer(url).addTo(AppState.map);
        document.getElementById('mapMenu').style.display = 'none';
    },

    recenter: () => {
        if(AppState.lastLoc) AppState.map.flyTo(AppState.lastLoc, 16);
        else alert("Position GPS en attente...");
    },

    // Recherche optimisée (Debounce + Priorité locale)
    searchTimer: null,
    search: (q) => {
        clearTimeout(MapManager.searchTimer);
        const list = document.getElementById('searchResults');
        
        if(q.length < 3) { list.style.display='none'; return; }

        MapManager.searchTimer = setTimeout(async () => {
            // Vuebox prioritaire (Toulouse ou écran actuel)
            let viewbox = '';
            if(AppState.map) {
                const b = AppState.map.getBounds();
                viewbox = `&viewbox=${b.getWest()},${b.getNorth()},${b.getEast()},${b.getSouth()}`;
            }

            try {
                // Recherche Nominatim avec priorité
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}${viewbox}&bounded=0&limit=5&addressdetails=1`);
                const data = await res.json();
                
                list.innerHTML = ''; list.style.display = 'block';
                
                data.forEach(p => {
                    const div = document.createElement('div');
                    div.className = 'search-item';
                    const icon = p.class === 'amenity' ? '<i class="fa-solid fa-shop"></i>' : '<i class="fa-solid fa-location-dot"></i>';
                    div.innerHTML = `${icon} <div><b>${p.display_name.split(',')[0]}</b><br><small style="opacity:0.6">${p.address.city || ''}</small></div>`;
                    
                    div.onclick = () => {
                        const latlng = { lat: parseFloat(p.lat), lng: parseFloat(p.lon) };
                        AppState.map.setView(latlng, 16);
                        MapManager.showPopup(latlng, p.display_name.split(',')[0]);
                        list.style.display = 'none';
                        document.getElementById('addrInput').value = p.display_name.split(',')[0];
                    };
                    list.appendChild(div);
                });
            } catch(e) { console.error(e); }
        }, 300); // Délai 300ms pour fluidité
    },

    showPopup: (latlng, title) => {
        const popupContent = `
            <div class="popup-header">${title}</div>
            <div class="popup-body">
                <button class="popup-btn" style="background:#007AFF; color:white;" onclick="Compass.start({lat:${latlng.lat}, lng:${latlng.lng}, name:'${title.replace(/'/g, "\\'")}'}); UI.show('viewNav');">
                    <i class="fa-solid fa-location-arrow"></i> Y ALLER
                </button>
                <button class="popup-btn" style="background:#F2F2F7; color:#007AFF;" onclick="Favorites.add({lat:${latlng.lat}, lng:${latlng.lng}, name:'${title.replace(/'/g, "\\'")}'})">
                    <i class="fa-solid fa-heart"></i> Mettre en Favoris
                </button>
            </div>
        `;
        
        L.popup({className: 'custom-popup', closeButton:false})
            .setLatLng(latlng)
            .setContent(popupContent)
            .openOn(AppState.map);
    },

    togglePOI: async () => {
        if(MapManager.poiLayer) {
            AppState.map.removeLayer(MapManager.poiLayer);
            MapManager.poiLayer = null;
            document.getElementById('mapMenu').style.display = 'none';
            return;
        }

        // Charger POI (Cafés, Restaurants, etc.) via Overpass API (léger)
        if(!AppState.map) return;
        const b = AppState.map.getBounds();
        const query = `
            [out:json][timeout:10];
            (
              node["amenity"~"cafe|restaurant|bar|fast_food"](${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()});
              node["tourism"](${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()});
            );
            out 50;
        `;
        
        try {
            const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
            const data = await res.json();
            
            MapManager.poiLayer = L.layerGroup().addTo(AppState.map);
            
            data.elements.forEach(el => {
                let icon = '📍';
                if(el.tags.amenity === 'cafe') icon = '☕';
                if(el.tags.amenity === 'bar') icon = '🍺';
                if(el.tags.amenity === 'restaurant') icon = '🍴';

                L.marker([el.lat, el.lon], {
                    icon: L.divIcon({html: `<div style="font-size:24px;">${icon}</div>`, className: ''})
                }).addTo(MapManager.poiLayer).on('click', () => {
                    MapManager.showPopup({lat:el.lat, lng:el.lon}, el.tags.name || "Lieu");
                });
            });
            document.getElementById('mapMenu').style.display = 'none';
        } catch(e) { alert("Zoomer plus pour voir les lieux !"); }
    }
};
