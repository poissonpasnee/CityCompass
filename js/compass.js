// js/compass.js
const Compass = {
    target: null, // {lat, lng} de la destination
    currentPos: null,
    watchId: null,

    init: () => {
        // Demande permission iOS pour l'orientation
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            const btn = document.createElement('button');
            btn.innerText = "Activer la boussole";
            btn.className = "btn-primary";
            btn.style.position = "absolute";
            btn.style.zIndex = "9999";
            btn.style.top = "50%";
            btn.style.left = "50%";
            btn.style.transform = "translate(-50%, -50%)";
            btn.onclick = () => {
                DeviceOrientationEvent.requestPermission()
                    .then(response => {
                        if (response === 'granted') {
                            window.addEventListener('deviceorientation', Compass.handleOrientation);
                            btn.remove();
                        }
                    })
                    .catch(console.error);
            };
            document.body.appendChild(btn);
        } else {
            window.addEventListener('deviceorientation', Compass.handleOrientation);
        }
        
        // GPS Suivi
        if('geolocation' in navigator) {
            Compass.watchId = navigator.geolocation.watchPosition(Compass.handleGPS, console.error, {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000
            });
        }
    },

    setTarget: (lat, lng) => {
        Compass.target = {lat, lng};
        // Sauvegarde locale pour rechargement
        localStorage.setItem('compass_target', JSON.stringify({lat, lng}));
        alert("Boussole calibrée sur la destination !");
    },

    handleGPS: (position) => {
        Compass.currentPos = position.coords;
        const { latitude, longitude, speed, altitude, accuracy } = position.coords;

        // Mise à jour Widgets GPS
        Widgets.updateValue('speed', (speed * 3.6).toFixed(0) + ' km/h'); // m/s -> km/h
        Widgets.updateValue('altitude', Math.round(altitude || 0) + ' m');
        Widgets.updateValue('accuracy', Math.round(accuracy) + ' m');
        Widgets.updateValue('coords', `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);

        // Calcul Distance vers Cible
        if(Compass.target) {
            const dist = Compass.getDistance(latitude, longitude, Compass.target.lat, Compass.target.lng);
            Widgets.updateValue('distance', dist < 1000 ? Math.round(dist) + ' m' : (dist/1000).toFixed(1) + ' km');
        }

        // Météo (Mise à jour toutes les 5 min si déplacement significatif)
        if(!Compass.lastWeather || Date.now() - Compass.lastWeather > 300000) {
            Widgets.fetchWeather(latitude, longitude);
            Compass.lastWeather = Date.now();
        }
    },

    handleOrientation: (event) => {
        let heading = event.alpha; // Z-axis rotation
        if(event.webkitCompassHeading) heading = event.webkitCompassHeading; // iOS

        // Mise à jour Widget Cap
        Widgets.updateValue('heading', Math.round(heading) + '°');

        // Rotation de la boussole
        const needle = document.getElementById('compass-needle');
        const card = document.getElementById('compass-card');
        
        if (needle && Compass.target && Compass.currentPos) {
            // Mode Navigation : L'aiguille pointe la cible
            const bearing = Compass.getBearing(
                Compass.currentPos.latitude, 
                Compass.currentPos.longitude, 
                Compass.target.lat, 
                Compass.target.lng
            );
            // La rotation de l'aiguille = Direction Cible - Direction Téléphone
            const rotation = bearing - heading;
            needle.style.transform = `rotate(${rotation}deg)`;
            
            // Le cadran tourne pour indiquer le Nord
            if(card) card.style.transform = `rotate(${-heading}deg)`;
            
        } else if (card) {
            // Mode Boussole Simple (Pas de cible)
            card.style.transform = `rotate(${-heading}deg)`;
        }
    },

    // Formule de Haversine pour la distance
    getDistance: (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // Rayon Terre en mètres
        const φ1 = lat1 * Math.PI/180;
        const φ2 = lat2 * Math.PI/180;
        const Δφ = (lat2-lat1) * Math.PI/180;
        const Δλ = (lon2-lon1) * Math.PI/180;
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    },

    // Calcul du Cap (Bearing) entre deux points
    getBearing: (startLat, startLng, destLat, destLng) => {
        startLat = startLat * Math.PI / 180; 
        startLng = startLng * Math.PI / 180;
        destLat = destLat * Math.PI / 180;
        destLng = destLng * Math.PI / 180;
        const y = Math.sin(destLng - startLng) * Math.cos(destLat);
        const x = Math.cos(startLat) * Math.sin(destLat) -
                  Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
        const brng = Math.atan2(y, x);
        return (brng * 180 / Math.PI + 360) % 360;
    }
};
