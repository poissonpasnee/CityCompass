const MapManager = {
    init: () => {
        if(AppState.map) return;
        AppState.map = L.map('map', {zoomControl:false}).setView([43.6, 1.4], 13);
        MapManager.setLayer('light');
        AppState.map.locate({setView:true, watch:true, enableHighAccuracy:true});
        
        AppState.map.on('locationfound', e => {
            if(!AppState.userMarker) {
                AppState.userMarker = L.marker(e.latlng).addTo(AppState.map);
            } else {
                AppState.userMarker.setLatLng(e.latlng);
            }
        });
        
        AppState.map.on('click', e => {
            document.getElementById('sheetTitle').innerText = "Position Repérée";
            document.getElementById('sheetDesc').innerText = e.latlng.lat.toFixed(4) + ", " + e.latlng.lng.toFixed(4);
            document.getElementById('mapSheet').classList.add('active');
        });
    },
    setLayer: (type) => {
        let url = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
        if(type === 'dark') url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
        if(type === 'sat') url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        
        AppState.map.eachLayer(l => l._url && AppState.map.removeLayer(l));
        L.tileLayer(url, {maxZoom:19}).addTo(AppState.map);
    },
    center: () => AppState.map.locate({setView:true}),
    closeSheet: () => document.getElementById('mapSheet').classList.remove('active'),
    
    toggleCam: async () => {
        const camView = document.getElementById('viewCam');
        const isActive = camView.classList.contains('active');
        
        if(!isActive) {
            UI.show('viewCam');
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                document.getElementById('videoFeed').srcObject = stream;
            } catch(e) { alert("Erreur caméra: " + e.message); UI.show('viewDiscover'); }
        } else {
            const stream = document.getElementById('videoFeed').srcObject;
            if(stream) stream.getTracks().forEach(t => t.stop());
            UI.show('viewDiscover');
        }
    },
    
    search: async (q) => {
        if(q.length < 3) return document.getElementById('searchResults').style.display='none';
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}`);
        const data = await res.json();
        const list = document.getElementById('searchResults');
        list.innerHTML = ''; list.style.display = 'block';
        
        data.slice(0,5).forEach(p => {
            const d = document.createElement('div');
            d.style.padding = '10px';
            d.innerHTML = `<b>${p.display_name.split(',')[0]}</b>`;
            d.onclick = () => {
                AppState.map.setView([p.lat, p.lon], 16);
                list.style.display='none';
                document.getElementById('addrInput').value = '';
            };
            list.appendChild(d);
        });
    }
};
