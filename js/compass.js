const Compass = {
    target: null,
    watchId: null,
    startDist: 0,
    currentHeading: 0,

    start: (target) => {
        if(!target || !target.lat || !target.lng) {
            console.error("Cible invalide pour la boussole");
            return;
        }

        Compass.target = target;
        document.getElementById('navTitle').innerText = target.name.length > 20 ? target.name.substring(0, 20) + '...' : target.name;
        
        // Calcul distance initiale pour l'anneau
        if(AppState.lastLoc) {
            Compass.startDist = Compass.getDist(AppState.lastLoc, target);
        } else {
            Compass.startDist = 1000; // Valeur par défaut 1km
        }
        
        // Démarrage des capteurs
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', Compass.handleOrientation);
        } else {
            alert("Votre appareil ne supporte pas l'orientation.");
        }

        // Suivi GPS actif
        Compass.watchId = navigator.geolocation.watchPosition(
            Compass.handleGPS, 
            (err) => console.log(err), 
            { enableHighAccuracy: true, maximumAge: 1000 }
        );
    },

    stop: () => {
        window.removeEventListener('deviceorientation', Compass.handleOrientation);
        if(Compass.watchId) navigator.geolocation.clearWatch(Compass.watchId);
        Compass.target = null;
        UI.show('viewDiscover');
    },

    calibrate: async () => {
        // iOS 13+ demande une permission explicite
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const response = await DeviceOrientationEvent.requestPermission();
                if (response === 'granted') {
                    document.getElementById('btnCalib').style.display = 'none';
                    alert("Capteur activé ! Tournez sur vous-même.");
                } else {
                    alert("Permission refusée. La boussole ne fonctionnera pas.");
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            document.getElementById('btnCalib').style.display = 'none';
            alert("Calibration : Faites des '8' avec votre téléphone.");
        }
    },

    handleOrientation: (e) => {
        if(!Compass.target || !AppState.lastLoc) return;

        // 1. Obtenir le cap du Nord magnétique (0-360)
        // webkitCompassHeading pour iOS, alpha pour Android (Attention Android alpha est instable sans compensation)
        let alpha = e.webkitCompassHeading || Math.abs(e.alpha - 360);
        
        // Sauvegarde pour usage futur
        Compass.currentHeading = alpha;

        // 2. Calculer le cap vers la cible (Bearing)
        const lat1 = AppState.lastLoc.lat * Math.PI/180;
        const lat2 = Compass.target.lat * Math.PI/180;
        const dLon = (Compass.target.lng - AppState.lastLoc.lng) * Math.PI/180;
        
        const y = Math.sin(dLon) * Math.cos(lat2);
        const x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
        
        let bearing = Math.atan2(y, x) * 180 / Math.PI;
        bearing = (bearing + 360) % 360; // Normaliser entre 0 et 360

        // 3. Calculer la rotation de la flèche
        // Formule : Rotation = Bearing (Cap Cible) - Heading (Cap Nord Téléphone)
        let rotation = bearing - alpha;

        // Appliquer la rotation
        const arrow = document.getElementById('compassArrow');
        if(arrow) arrow.style.transform = `rotate(${rotation}deg)`;
    },

    handleGPS: (pos) => {
        if(!Compass.target) return;
        
        const current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        AppState.lastLoc = current; // Mettre à jour la position globale

        // Calcul distance
        const dist = Compass.getDist(current, Compass.target);
        
        // Affichage distance
        const distEl = document.getElementById('navDist');
        if(dist < 1000) {
            distEl.innerText = Math.round(dist) + " m";
        } else {
            distEl.innerText = (dist/1000).toFixed(1) + " km";
        }

        // Animation de l'anneau SVG (Cercle qui se ferme quand on approche)
        const circle = document.getElementById('distRing');
        const maxDash = 754; // Périmètre du cercle r=120
        
        // Ratio de progression (1 = loin, 0 = arrivé)
        // On utilise StartDist pour calibrer l'échelle. Si on s'éloigne, l'anneau reste vide.
        let ratio = dist / (Compass.startDist || 1000);
        if(ratio > 1) ratio = 1;
        if(ratio < 0) ratio = 0;

        const offset = maxDash * ratio;
        circle.style.strokeDashoffset = offset;
    },

    getDist: (p1, p2) => {
        const R = 6371e3; // Rayon Terre en mètres
        const φ1 = p1.lat * Math.PI/180;
        const φ2 = p2.lat * Math.PI/180;
        const Δφ = (p2.lat-p1.lat) * Math.PI/180;
        const Δλ = (p2.lng-p1.lng) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        return R * c; // Distance en mètres
    }
};
