const MapManager = {
    poiLayer: null,
    searchTimer: null,

    init: () => {
        if(AppState.map) return;
        
        // Initialisation standard
        AppState.map = L.map('map', {zoomControl:false}).setView([43.6045, 1.4442], 13);
        MapManager.setLayer('standard');
        
        // CORRECTION MAJEURE: Force le redimensionnement immédiat
        setTimeout(() => AppState.map.invalidateSize(), 100);

        AppState.map.locate({setView:false, watch:true, enableHighAccuracy:true});
        
        AppState.map.on('locationfound', e => {
            AppState.lastLoc = e.latlng;
            if(!AppState.hasCentered) {
                AppState.map.setView(e.latlng, 15);
                AppState.hasCentered = true;
            }
            if(!AppState.userMarker) {
                AppState.userMarker = L.circleMarker(e.latlng, {radius:8, color:'white', fillColor:'#007AFF', fillOpacity:1}).addTo(AppState.map);
            } else {
                AppState.userMarker.setLatLng(e.latlng);
            }
            // Update Compass Stats
            if(window.Compass) Compass.handleGPS({coords: {latitude: e.latlng.lat, longitude: e.latlng.lng, speed: e.speed, altitude: e.altitude}});
        });

        AppState.map.on('click', e => MapManager.showPopup(e.latlng, "Point Repéré"));
    },

    setLayer: (type) => {
        let url = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
        if(type === 'dark') url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
        if(type === 'sat') url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        
        AppState.map.eachLayer(l => l._url && AppState.map.removeLayer(l));
        L.tileLayer(url).addTo(AppState.map);
        if(MapManager.poiLayer) MapManager.poiLayer.bringToFront();
        UI.toggleMapMenu(false);
    },

    recenter: () => {
        if(AppState.lastLoc) AppState.map.flyTo(AppState.lastLoc, 16);
        else alert("Signal GPS en cours...");
    },

    search: (q) => {
        clearTimeout(MapManager.searchTimer);
        const list = document.getElementById('searchResults');
        if(q.length < 3) { list.style.display='none'; return; }

        MapManager.searchTimer = setTimeout(async () => {
            let bias = '';
            if(AppState.lastLoc) bias = `&lat=${AppState.lastLoc.lat}&lon=${AppState.lastLoc.lng}`;
            
            try {
                const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}${bias}&limit=5&lang=fr`);
                const data = await res.json();
                list.innerHTML = ''; list.style.display = 'block';
                
                data.features.forEach(f => {
                    const props = f.properties;
                    const div = document.createElement('div');
                    div.className = 'search-item';
                    div.innerHTML = `<div><b>${props.name || props.street || 'Lieu'}</b><br><small style="opacity:0.6">${props.city || props.country || ''}</small></div>`;
                    div.onclick = () => {
                        const latlng = { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] };
                        AppState.map.setView(latlng, 16);
                        MapManager.showPopup(latlng, props.name || "Lieu");
                        list.style.display = 'none';
                        document.getElementById('addrInput').value = props.name || "";
                    };
                    list.appendChild(div);
                });
            } catch(e) {}
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

    togglePOI: () => {
        // ... Code POI existant (non modifié)
    }
};
