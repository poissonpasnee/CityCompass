const MapManager = {
    poiLayer: null,
    searchTimer: null,

    init: () => {
        if(AppState.map) return;
        AppState.map = L.map('map', {zoomControl:false}).setView([43.6045, 1.4442], 13);
        MapManager.setLayer('standard');
        
        // IMPORTANT: setView: false pour ne pas recentrer auto
        AppState.map.locate({setView:false, watch:true, enableHighAccuracy:true});
        
        AppState.map.on('locationfound', e => {
            AppState.lastLoc = e.latlng;
            
            // Premier centrage uniquement
            if(!AppState.hasCentered) {
                AppState.map.setView(e.latlng, 15);
                AppState.hasCentered = true;
                MapManager.updateWidgets(e);
            }

            // Marqueur position
            if(!AppState.userMarker) {
                AppState.userMarker = L.circleMarker(e.latlng, {radius:8, color:'white', fillColor:'#007AFF', fillOpacity:1}).addTo(AppState.map);
            } else {
                AppState.userMarker.setLatLng(e.latlng);
            }
            
            // Mise à jour widgets temps réel
            MapManager.updateWidgets(e);
        });

        AppState.map.on('click', e => MapManager.showPopup(e.latlng, "Point Repéré"));
        
        // Charger POI automatiquement au démarrage
        setTimeout(MapManager.togglePOI, 2000);
    },

    setLayer: (type) => {
        let url = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
        if(type === 'dark') url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
        if(type === 'sat') url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        
        AppState.map.eachLayer(l => l._url && AppState.map.removeLayer(l));
        L.tileLayer(url).addTo(AppState.map);
        
        // Si POI activé, le remettre au dessus
        if(MapManager.poiLayer) MapManager.poiLayer.bringToFront();
        
        UI.toggleMapMenu(false); // Fermer menu
    },

    recenter: () => {
        if(AppState.lastLoc) AppState.map.flyTo(AppState.lastLoc, 16);
        else alert("Signal GPS faible...");
    },

    // Recherche Rapide (Photon API)
    search: (q) => {
        clearTimeout(MapManager.searchTimer);
        const list = document.getElementById('searchResults');
        
        if(q.length < 3) { list.style.display='none'; return; }

        MapManager.searchTimer = setTimeout(async () => {
            let bias = '';
            if(AppState.lastLoc) bias = `&lat=${AppState.lastLoc.lat}&lon=${AppState.lastLoc.lng}`;
            
            // API Photon (Komoot) : Très rapide et tolérante
            try {
                const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}${bias}&limit=5&lang=fr`);
                const data = await res.json();
                
                list.innerHTML = ''; list.style.display = 'block';
                
                data.features.forEach(f => {
                    const props = f.properties;
                    const div = document.createElement('div');
                    div.className = 'search-item';
                    
                    let icon = '<i class="fa-solid fa-location-dot"></i>';
                    if(props.osm_value === 'restaurant') icon = '<i class="fa-solid fa-utensils"></i>';
                    if(props.osm_key === 'highway') icon = '<i class="fa-solid fa-road"></i>';
                    
                    div.innerHTML = `${icon} <div><b>${props.name || props.street || 'Lieu'}</b><br><small style="opacity:0.6">${props.city || props.country || ''}</small></div>`;
                    
                    div.onclick = () => {
                        const latlng = { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] };
                        AppState.map.setView(latlng, 16);
                        MapManager.showPopup(latlng, props.name || "Lieu");
                        list.style.display = 'none';
                        document.getElementById('addrInput').value = props.name || "";
                    };
                    list.appendChild(div);
                });
            } catch(e) { console.error(e); }
        }, 250);
    },

    showPopup: (latlng, title) => {
        const popupContent = `
            <div class="popup-header">${title}</div>
            <div class="popup-body">
                <button class="popup-btn" style="background:#007AFF; color:white;" onclick="Compass.start({lat:${latlng.lat}, lng:${latlng.lng}, name:'${title.replace(/'/g, "\\'")}'}); UI.show('viewNav');">
                    <i class="fa-solid fa-location-arrow"></i> Y ALLER
                </button>
                <button class="popup-btn" style="background:#F2F2F7; color:#007AFF;" onclick="Favorites.add({lat:${latlng.lat}, lng:${latlng.lng}, name:'${title.replace(/'/g, "\\'")}'})">
                    <i class="fa-solid fa-heart"></i> Favoris
                </button>
            </div>
        `;
        L.popup({className: 'custom-popup', closeButton:false}).setLatLng(latlng).setContent(popupContent).openOn(AppState.map);
    },

    togglePOI: async () => {
        if(MapManager.poiLayer) {
            AppState.map.removeLayer(MapManager.poiLayer);
            MapManager.poiLayer = null;
            return;
        }
        if(!AppState.map) return;
        
        // POI Toulousains (Exemple simplifié)
        const pois = [
            {lat: 43.6045, lng: 1.4442, icon:'🏛️', name:'Capitole'},
            {lat: 43.6000, lng: 1.4333, icon:'🌳', name:'Prairie des Filtres'},
            {lat: 43.6100, lng: 1.4500, icon:'🚄', name:'Gare Matabiau'}
        ];
        
        MapManager.poiLayer = L.layerGroup();
        pois.forEach(p => {
             L.marker([p.lat, p.lng], {icon: L.divIcon({html: `<div style="font-size:24px;">${p.icon}</div>`, className: ''})})
             .addTo(MapManager.poiLayer)
             .on('click', () => MapManager.showPopup(p, p.name));
        });
        MapManager.poiLayer.addTo(AppState.map);
    },
    
    updateWidgets: (e) => {
        // Vitesse
        const speed = e.speed ? Math.round(e.speed * 3.6) : 0;
        document.getElementById('widSpeed').innerText = speed;
        
        // Altitude
        const alt = e.altitude ? Math.round(e.altitude) : 0;
        document.getElementById('widAlt').innerText = alt;
        
        // Cap
        const head = e.heading ? Math.round(e.heading) : 0;
        document.getElementById('widHead').innerText = head + "°";
        
        // Météo (Simulé pour l'instant)
        document.getElementById('widTemp').innerText = "18°C";
    }
};
