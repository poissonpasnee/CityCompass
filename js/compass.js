const Compass = {
    target: null,
    watchId: null,
    startDist: 0,

    start: (target) => {
        Compass.target = target;
        document.getElementById('navTitle').innerText = target.name.substring(0, 20);
        
        // Initialiser distance
        if(AppState.lastLoc) Compass.startDist = Compass.getDist(AppState.lastLoc, target);
        
        window.addEventListener('deviceorientation', Compass.handleOrientation, true);
        navigator.geolocation.watchPosition(Compass.handleGPS, null, {enableHighAccuracy: true});
        
        // Activer la météo (Simulé)
        document.getElementById('navTemp').innerText = "19°C";
    },

    stop: () => {
        window.removeEventListener('deviceorientation', Compass.handleOrientation, true);
        Compass.target = null;
        UI.show('viewDiscover');
    },

    calibrate: async () => {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            const r = await DeviceOrientationEvent.requestPermission();
            if(r === 'granted') document.getElementById('btnCalib').style.display='none';
        } else {
            document.getElementById('btnCalib').style.display='none';
        }
    },

    handleOrientation: (e) => {
        if(!Compass.target || !AppState.lastLoc) return;

        // 1. Cap Nord Magnétique (avec fallback)
        let alpha = e.webkitCompassHeading || Math.abs(e.alpha - 360);
        if(!alpha) alpha = 0; // Sécurité

        // 2. Calcul du Bearing (Cap vers la cible)
        const lat1 = AppState.lastLoc.lat * Math.PI/180;
        const lat2 = Compass.target.lat * Math.PI/180;
        const dLon = (Compass.target.lng - AppState.lastLoc.lng) * Math.PI/180;

        const y = Math.sin(dLon) * Math.cos(lat2);
        const x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
        let bearing = Math.atan2(y, x) * 180 / Math.PI;
        bearing = (bearing + 360) % 360;

        // 3. Rotation Aiguille : Bearing - Cap Nord
        let rotation = bearing - alpha;
        document.getElementById('compassArrow').style.transform = `rotate(${rotation}deg)`;
        
        // Mise à jour Widget Heading
        document.getElementById('navHead').innerText = Math.round(alpha) + "°";
    },

    handleGPS: (pos) => {
        if(!Compass.target) return;
        
        const current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        AppState.lastLoc = current;

        // Distance
        const dist = Compass.getDist(current, Compass.target);
        document.getElementById('navDist').innerText = Math.round(dist) + " m";

        // Anneau progression
        const max = 754;
        const ratio = Math.max(0, Math.min(1, dist / (Compass.startDist || 1000)));
        document.getElementById('distRing').style.strokeDashoffset = max * ratio;

        // Widgets Vitesse / Altitude
        const speed = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0;
        const alt = pos.coords.altitude ? Math.round(pos.coords.altitude) : 0;
        
        // Update vue boussole
        document.getElementById('navSpeed').innerText = speed;
        document.getElementById('navAlt').innerText = alt;
        
        // Update vue profil (synchro)
        if(document.getElementById('widSpeed')) document.getElementById('widSpeed').innerText = speed;
        if(document.getElementById('widAlt')) document.getElementById('widAlt').innerText = alt;
    },

    getDist: (p1, p2) => {
        const R = 6371e3;
        const φ1 = p1.lat * Math.PI/180, φ2 = p2.lat * Math.PI/180;
        const Δφ = (p2.lat-p1.lat) * Math.PI/180, Δλ = (p2.lng-p1.lng) * Math.PI/180;
        const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }
};
