// js/compass.js
const Compass = {
    target: null, // {lat, lng}
    
    init: () => {
        // Écoute l'orientation
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', Compass.handleOrientation);
        }
        // Écoute le GPS pour la vitesse/distance
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(Compass.handleGPS, console.error, {
                enableHighAccuracy: true
            });
        }
        
        // Charger cible sauvegardée
        const saved = localStorage.getItem('compass_target');
        if(saved) Compass.target = JSON.parse(saved);
    },

    setTarget: (lat, lng) => {
        Compass.target = {lat, lng};
        localStorage.setItem('compass_target', JSON.stringify({lat, lng}));
        alert("🎯 Boussole calibrée sur la destination !");
    },

    handleOrientation: (e) => {
        // Calcul du Nord
        let heading = e.alpha; 
        if(e.webkitCompassHeading) heading = e.webkitCompassHeading; // iPhone
        if(!heading) return;

        // Mise à jour visuelle (Nord tourne)
        const card = document.getElementById('compass-card');
        const needle = document.getElementById('compass-needle');
        const val = document.getElementById('val-heading');
        
        if(card) card.style.transform = `rotate(${-heading}deg)`;
        if(val) val.innerText = Math.round(heading);

        // Aiguille vers cible
        if(Compass.target && window.currentPos) {
            const bearing = Compass.getBearing(
                window.currentPos.latitude, window.currentPos.longitude,
                Compass.target.lat, Compass.target.lng
            );
            // L'aiguille doit pointer le cap (bearing) par rapport au nord (heading)
            // Donc rotation = bearing - heading
            if(needle) needle.style.transform = `translate(-50%, -50%) rotate(${bearing - heading}deg)`;
        } else {
            // Pas de cible, l'aiguille suit le Nord (reste fixe relative au cadran)
            if(needle) needle.style.transform = `translate(-50%, -50%)`;
        }
        
        // Widget Cap
        Widgets.update('heading', Math.round(heading) + '°');
    },

    handleGPS: (pos) => {
        window.currentPos = pos.coords;
        const { speed, altitude, latitude, longitude } = pos.coords;

        Widgets.update('speed', Math.round((speed || 0) * 3.6) + ' km/h');
        Widgets.update('altitude', Math.round(altitude || 0) + ' m');

        // Météo auto
        Widgets.fetchWeather(latitude, longitude);

        if(Compass.target) {
            const dist = Compass.getDist(latitude, longitude, Compass.target.lat, Compass.target.lng);
            Widgets.update('distance', dist > 1000 ? (dist/1000).toFixed(1)+' km' : Math.round(dist)+' m');
        }
    },

    getBearing: (lat1, lon1, lat2, lon2) => {
        const toRad = x => x * Math.PI / 180;
        const toDeg = x => x * 180 / Math.PI;
        const dLon = toRad(lon2 - lon1);
        const y = Math.sin(dLon) * Math.cos(toRad(lat2));
        const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
                  Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
        const brng = (toDeg(Math.atan2(y, x)) + 360) % 360;
        return brng;
    },

    getDist: (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI/180;
        const φ2 = lat2 * Math.PI/180;
        const Δφ = (lat2-lat1) * Math.PI/180;
        const Δλ = (lon2-lon1) * Math.PI/180;
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }
};
