const MapManager = {
    init: () => {
        if(window.map) return;
        window.map = L.map('map').setView([43.604, 1.444], 13); // Toulouse
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(window.map);
        
        // Clic sur carte -> Définir destination
        window.map.on('click', (e) => {
            if(confirm("Aller vers ce point ?")) {
                Compass.setTarget(e.latlng.lat, e.latlng.lng);
                L.marker(e.latlng).addTo(window.map).bindPopup("Destination").openPopup();
                App.show('view-compass', document.querySelectorAll('.nav-item')[1]);
            }
        });
    },

    locate: () => {
        window.map.locate({setView: true, maxZoom: 16});
    },
    
    search: async (query) => {
        if(query.length < 3) return;
        const res = await fetch(`https://photon.komoot.io/api/?q=${query}&limit=5`);
        const json = await res.json();
        const list = document.getElementById('search-results');
        list.innerHTML = '';
        json.features.forEach(f => {
            const div = document.createElement('div');
            div.className = 'result-item';
            div.innerText = f.properties.name + ', ' + (f.properties.city || '');
            div.onclick = () => {
                const [lng, lat] = f.geometry.coordinates;
                window.map.setView([lat, lng], 16);
                Compass.setTarget(lat, lng);
                list.innerHTML = ''; // Cacher résultats
            };
            list.appendChild(div);
        });
    }
};
