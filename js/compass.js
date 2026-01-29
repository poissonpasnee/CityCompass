const Compass = {
    target: null,
    watchId: null,
    isCalibrated: false,

    start: (target) => {
        Compass.target = target;
        document.getElementById('navTitle').innerText = "Vers : " + target.name;
        
        // Si déjà calibré, on cache le bouton
        if(Compass.isCalibrated) document.getElementById('btnCalib').style.display = 'none';
        
        // Démarrer l'écoute
        if(!Compass.watchId) {
            window.addEventListener('deviceorientation', Compass.handleOrientation);
            // Fallback GPS pour la distance
            navigator.geolocation.watchPosition(Compass.handleGPS);
        }
    },

    stop: () => {
        window.removeEventListener('deviceorientation', Compass.handleOrientation);
        Compass.target = null;
        document.getElementById('navTitle').innerText = "Aucune destination";
        document.getElementById('navDist').innerText = "-- m";
        document.getElementById('compassArrow').style.transform = "rotate(0deg)";
        UI.show('viewDiscover');
    },

    calibrate: async () => {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const response = await DeviceOrientationEvent.requestPermission();
                if (response === 'granted') {
                    Compass.isCalibrated = true;
                    document.getElementById('btnCalib').style.display = 'none';
                    alert("Boussole calibrée !");
                } else {
                    alert("Permission refusée.");
                }
            } catch (e) { alert(e); }
        } else {
            // Android ou iOS ancien
            Compass.isCalibrated = true;
            document.getElementById('btnCalib').style.display = 'none';
        }
    },

    handleOrientation: (e) => {
        if(!Compass.target || !AppState.lastLoc) return;

        // 1. Cap du téléphone (Nord magnétique)
        let alpha = e.webkitCompassHeading || Math.abs(e.alpha - 360);
        
        // 2. Cap vers la destination (Bearing)
        const lat1 = AppState.lastLoc.lat * Math.PI/180;
        const lat2 = Compass.target.lat * Math.PI/180;
        const dLon = (Compass.target.lng - AppState.lastLoc.lng) * Math.PI/180;
        
        const y = Math.sin(dLon) * Math.cos(lat2);
        const x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
        const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;

        // 3. Rotation de la flèche : (Bearing - Cap Nord)
        // La flèche pointe toujours vers la cible, peu importe comment on tourne le tel
        const rotation = bearing - alpha;
        
        document.getElementById('compassArrow').style.transform = `rotate(${rotation}deg)`;
    },

    handleGPS: (pos) => {
        if(!Compass.target) return;
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        AppState.lastLoc = { lat, lng }; // Mise à jour globale
        
        // Calcul distance
        const R = 6371e3; // Rayon terre en m
        const φ1 = lat * Math.PI/180;
        const φ2 = Compass.target.lat * Math.PI/180;
        const Δφ = (Compass.target.lat-lat) * Math.PI/180;
        const Δλ = (Compass.target.lng-lng) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = R * c;

        document.getElementById('navDist').innerText = Math.round(d) + " m";
    }
};
