const MapManager = {
    init: () => {
        if(AppState.map) return;
        AppState.map = L.map('map', {zoomControl:false}).setView([43.6, 1.4], 13);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(AppState.map);
        
        AppState.map.locate({setView:true, watch:true, enableHighAccuracy:true});
        AppState.map.on('locationfound', e => {
            AppState.lastLoc = e.latlng;
            if(!AppState.userMarker) AppState.userMarker = L.circleMarker(e.latlng, {radius:8, color:'white', fillColor:'#007AFF', fillOpacity:1}).addTo(AppState.map);
            else AppState.userMarker.setLatLng(e.latlng);
        });
    },
    
    search: async (q) => {
        if(q.length < 3) return document.getElementById('searchResults').style.display='none';
        
        // Optimisation: Recherche autour de la position actuelle
        let bbox = '';
        if(AppState.lastLoc) {
            const b = AppState.map.getBounds();
            bbox = `&viewbox=${b.getWest()},${b.getNorth()},${b.getEast()},${b.getSouth()}&bounded=0`;
        }

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}${bbox}&addressdetails=1&limit=5`);
            const data = await res.json();
            const list = document.getElementById('searchResults');
            list.innerHTML = ''; list.style.display = 'block';
            
            data.forEach(p => {
                const d = document.createElement('div');
                d.className = 'search-item';
                // Affiche "Nom de rue, Ville" pour plus de clarté
                const title = p.address.road || p.address.pedestrian || p.display_name.split(',')[0];
                const subtitle = p.address.city || p.address.town || p.address.village || '';
                
                d.innerHTML = `<b>${title}</b><br><span style="font-size:12px; opacity:0.6;">${subtitle}</span>`;
                
                d.onclick = () => {
                    AppState.navTarget = { lat: parseFloat(p.lat), lng: parseFloat(p.lon), name: title };
                    AppState.map.setView([p.lat, p.lon], 16);
                    L.marker([p.lat, p.lon]).addTo(AppState.map).bindPopup("Destination: " + title).openPopup();
                    list.style.display='none';
                    document.getElementById('addrInput').value = title;
                    
                    // Proposer la navigation
                    if(confirm("Lancer la boussole vers " + title + " ?")) {
                        UI.show('viewNav');
                        Compass.start(AppState.navTarget);
                    }
                };
                list.appendChild(d);
            });
        } catch(e) { console.error(e); }
    }
};
