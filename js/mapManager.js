const MapManager = {
    // Variable pour éviter le re-centrage permanent du GPS
    firstLoc: true,

    init: () => {
        if(AppState.map) return; // Éviter double init

        // Init Leaflet
        AppState.map = L.map('map', {zoomControl:false}).setView([43.6, 1.4], 13);
        
        // Charger le thème sauvegardé pour la tuile
        const theme = localStorage.getItem('cc_theme') || 'light';
        const url = theme === 'dark' 
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' 
            : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
        
        L.tileLayer(url, { maxZoom: 19 }).addTo(AppState.map);

        // --- GESTION DU CLIC SUR LA CARTE ---
        AppState.map.on('click', (e) => {
            const popupContent = document.createElement('div');
            popupContent.innerHTML = `
                <div style="text-align:center;">
                    <b style="font-size:14px;">Point Repéré</b><br>
                    <span style="font-size:10px; opacity:0.6;">${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}</span>
                    <div style="margin-top:10px; display:flex; gap:5px;">
                        <button id="btnPopNav" style="flex:1; background:#007AFF; color:white; border:none; padding:8px; border-radius:6px; font-weight:bold;">Y Aller</button>
                    </div>
                </div>
            `;
            
            // Attacher l'événement au bouton après insertion
            // Leaflet ne permet pas le onclick direct dans le string HTML facilement avec scope
            const popup = L.popup()
                .setLatLng(e.latlng)
                .setContent(popupContent)
                .openOn(AppState.map);

            // Hack pour attacher l'event une fois le DOM prêt
            setTimeout(() => {
                const btn = document.getElementById('btnPopNav');
                if(btn) {
                    btn.onclick = () => {
                        Compass.start({ lat: e.latlng.lat, lng: e.latlng.lng, name: "Point Carte" });
                        UI.show('viewNav');
                        AppState.map.closePopup();
                    };
                }
            }, 100);
        });

        // --- GÉOLOCALISATION ---
        // setView: false est CRUCIAL pour ne pas forcer le zoom quand on bouge la carte
        AppState.map.locate({setView: false, watch: true, enableHighAccuracy: true});
        
        AppState.map.on('locationfound', e => {
            AppState.lastLoc = e.latlng;
            
            // On centre uniquement à la première localisation
            if(MapManager.firstLoc) {
                AppState.map.setView(e.latlng, 15);
                MapManager.firstLoc = false;
            }

            // Marqueur utilisateur (Point bleu)
            if(!AppState.userMarker) {
                AppState.userMarker = L.circleMarker(e.latlng, {
                    radius: 8, 
                    color: 'white', 
                    weight: 2,
                    fillColor: '#007AFF', 
                    fillOpacity: 1
                }).addTo(AppState.map);
            } else {
                AppState.userMarker.setLatLng(e.latlng);
            }
        });
    },

    search: async (q) => {
        const list = document.getElementById('searchResults');
        
        if(q.length < 3) { 
            list.style.display='none'; 
            return; 
        }
        
        try {
            // Utiliser viewbox si on a une position pour prioriser les résultats locaux
            let url = `https://nominatim.openstreetmap.org/search?format=json&q=${q}&addressdetails=1&limit=5`;
            
            if(AppState.lastLoc && AppState.map) {
                const b = AppState.map.getBounds();
                // Format: left,top,right,bottom
                url += `&viewbox=${b.getWest()},${b.getNorth()},${b.getEast()},${b.getSouth()}`;
            }

            const res = await fetch(url);
            const data = await res.json();
            
            list.innerHTML = ''; 
            list.style.display = 'block';
            
            if(data.length === 0) {
                list.innerHTML = '<div class="search-item">Aucun résultat</div>';
                return;
            }

            data.forEach(p => {
                const div = document.createElement('div');
                div.className = 'search-item';
                
                // Construction du titre propre
                const name = p.address.road || p.address.pedestrian || p.address.building || p.display_name.split(',')[0];
                const city = p.address.city || p.address.town || p.address.village || '';
                
                div.innerHTML = `<b>${name}</b><span>${city}</span>`;
                
                div.onclick = (e) => {
                    // Stop propagation pour ne pas cliquer sur la carte en dessous
                    e.stopPropagation(); 
                    
                    // Masquer liste et mettre à jour input
                    list.style.display = 'none';
                    document.getElementById('addrInput').value = name;
                    
                    // Centrer carte et mettre marqueur
                    const lat = parseFloat(p.lat);
                    const lng = parseFloat(p.lon);
                    
                    AppState.map.setView([lat, lng], 16);
                    
                    L.popup()
                        .setLatLng([lat, lng])
                        .setContent(`
                            <b>${name}</b><br>
                            <button onclick="Compass.start({lat:${lat}, lng:${lng}, name:'${name.replace(/'/g, "\\'")}'}); UI.show('viewNav');" 
                            style="margin-top:5px; background:#007AFF; color:white; border:none; padding:5px 10px; border-radius:5px; width:100%;">
                            Y Aller 🧭
                            </button>
                        `)
                        .openOn(AppState.map);
                };
                list.appendChild(div);
            });
        } catch(e) {
            console.error("Erreur recherche:", e);
        }
    }
};
