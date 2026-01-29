const Compass = {
    open: () => document.getElementById('compassOverlay').classList.add('active'),
    close: () => document.getElementById('compassOverlay').classList.remove('active'),
    stopNav: () => {
        AppState.navTarget = null;
        document.getElementById('navInfoBox').style.display = 'none';
        document.getElementById('navDist').innerText = '--';
    },
    requestPerm: async () => {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            const r = await DeviceOrientationEvent.requestPermission();
            if (r === 'granted') window.addEventListener('deviceorientation', Compass.handle);
        } else window.addEventListener('deviceorientation', Compass.handle);
    },
    handle: (e) => {
        const alpha = e.webkitCompassHeading || Math.abs(e.alpha - 360);
        document.getElementById('compassRing').style.transform = `rotate(${-alpha}deg)`;
        document.getElementById('compassDeg').innerText = Math.round(alpha) + "°";
    }
};
