const MapManager = {
    firstLoc: true,

    init: () => {
        if(AppState.map) return;
        AppState.map = L.map('map', {zoomControl:false}).setView([43.6, 1.4], 13);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(AppState.map);
        
        // Clic sur la carte : Créer un point temporaire
        AppState.map.on('click', (e) => {
            const popupContent = document.createElement('div');
            popupContent.style.textAlign = 'center';
            popupContent.innerHTML = `
                <b>Point Repéré</b><br>
                <button id="btnGo" style="width:100%; margin:5px 0; padding:8px; background:#007AFF; color:white; border:none; border-radius:8px;">🚀 Y Aller</button>
                <button id="btnFav" style="width:100%; margin:5px 0; padding:8px; background:#FF9500; color:white; border:none; border-radius:8px;">⭐ Favori</button>
            `;
            
            // Gestion des clics dans la popup
            popupContent.querySelector('#btnGo').onclick = () => {
                Compass.start({ lat: e.latlng.lat, lng: e.latlng.lng, name: "Point Carte" });
                UI.show('viewNav');
                AppState.map.closePopup();
            };
            popupContent.querySelector('#btnFav').onclick = () => {
                MapManager.addToFav(e.latlng);
                AppState.map.closePopup();
            };

            L.popup().setLatLng(e.latlng).setContent(popupContent).openOn(AppState.map);
        });

        // Géolocalisation : setView:false pour ne pas forcer le zoom
        AppState.map.locate({setView: false, watch: true, enableHighAccuracy: true});
        
        AppState.map.on('locationfound', e => {
            AppState.lastLoc = e.latlng;
            // Centre uniquement la première fois
            if(MapManager.firstLoc) {
                AppState.map.setView(e.latlng, 15);
                MapManager.firstLoc = false;
            }

            if(!AppState.userMarker) {
                AppState.userMarker = L.circleMarker(e.latlng, {radius:8, color:'white', fillColor:'#007AFF', fillOpacity:1}).addTo(AppState.map);
            } else {
                AppState.userMarker.setLatLng(e.latlng);
            }
        });
    },

    addToFav: async (latlng) => {
        const name = prompt("Nom du favori ?", "Mon Repère");
        if(!name) return;

        const newFav = { id: Date.now(), name: name, lat: latlng.lat, lng: latlng.lng };
        const favs = AppState.profile.favorites || []; // Utilise un champ JSON 'favorites' dans Supabase
        favs.push(newFav);

        // Sauvegarde Supabase
        await AppState.supabase.from('profiles').update({ favorites: favs }).eq('id', AppState.user.id);
        AppState.profile.favorites = favs;
        alert("Favori ajouté !");
    },
    
    // ... (garde la fonction search existante) ...
    search: async (q) => { /* Code inchangé de l'étape précédente */ }
};
