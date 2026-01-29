// js/widgets.js
const Widgets = {
    list: [
        {id: 'speed', name: 'Vitesse', icon: '🚀', value: '-- km/h'},
        {id: 'heading', name: 'Cap', icon: '🧭', value: '--°'},
        {id: 'altitude', name: 'Altitude', icon: '⛰️', value: '-- m'},
        {id: 'weather', name: 'Météo', icon: '⛅', value: '--°C'},
        // Nouveaux Widgets
        {id: 'distance', name: 'Distance', icon: '📍', value: '-- m'},
        {id: 'accuracy', name: 'Précision GPS', icon: '🎯', value: '-- m'},
        {id: 'clock', name: 'Heure', icon: '🕒', value: '--:--'},
        {id: 'battery', name: 'Batterie', icon: '🔋', value: '--%'},
        {id: 'network', name: 'Réseau', icon: '📡', value: 'Online'},
        {id: 'sunrise', name: 'Lever Soleil', icon: '🌅', value: '--:--'},
        {id: 'sunset', name: 'Coucher Soleil', icon: '🌇', value: '--:--'},
        {id: 'coords', name: 'Coordonnées', icon: '🗺️', value: '--, --'},
        {id: 'max_speed', name: 'Vitesse Max', icon: '🏎️', value: '0 km/h'},
        {id: 'flashlight', name: 'Lampe', icon: '🔦', value: 'OFF', action: true} // Widget Actionnable
    ],
    
    maxVisible: 4,
    expanded: false,
    maxSpeedRec: 0,

    init: () => {
        Widgets.render();
        // Lancer les loops pour l'heure et la batterie
        setInterval(() => {
            const now = new Date();
            Widgets.updateValue('clock', now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
        }, 1000);
        
        if('getBattery' in navigator) {
            navigator.getBattery().then(b => {
                Widgets.updateValue('battery', Math.round(b.level * 100) + '%');
                b.addEventListener('levelchange', () => Widgets.updateValue('battery', Math.round(b.level * 100) + '%'));
            });
        }
        
        window.addEventListener('online', () => Widgets.updateValue('network', 'Online'));
        window.addEventListener('offline', () => Widgets.updateValue('network', 'Offline'));
    },

    render: () => {
        const container = document.getElementById('widgets-grid');
        if(!container) return;
        container.innerHTML = '';
        
        const limit = Widgets.expanded ? Widgets.list.length : Widgets.maxVisible;
        
        Widgets.list.slice(0, limit).forEach(w => {
            const div = document.createElement('div');
            div.className = 'widget-card';
            div.innerHTML = `
                <div class="widget-icon">${w.icon}</div>
                <div class="widget-val" id="val-${w.id}">${w.value}</div>
                <div class="widget-name">${w.name}</div>
            `;
            if(w.action) {
                div.onclick = () => Widgets.toggleAction(w.id);
                div.style.cursor = 'pointer';
            }
            container.appendChild(div);
        });

        // Bouton Afficher Plus / Moins
        if(Widgets.list.length > Widgets.maxVisible) {
            const btn = document.createElement('div');
            btn.className = 'show-more-btn';
            btn.innerText = Widgets.expanded ? "Afficher moins ▲" : "Afficher plus ▼";
            btn.onclick = () => {
                Widgets.expanded = !Widgets.expanded;
                Widgets.render();
            };
            container.appendChild(btn);
        }
    },

    updateValue: (id, val) => {
        const el = document.getElementById(`val-${id}`);
        if(el) el.innerText = val;
        
        // Logique spéciale Vitesse Max
        if(id === 'speed') {
            const numeric = parseFloat(val);
            if(numeric > Widgets.maxSpeedRec) {
                Widgets.maxSpeedRec = numeric;
                Widgets.updateValue('max_speed', numeric + ' km/h');
            }
        }
    },

    fetchWeather: async (lat, lng) => {
        try {
            // Utilisation API Open-Meteo (Gratuite, pas de clé) [web:21]
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=sunrise,sunset&timezone=auto`);
            const data = await res.json();
            Widgets.updateValue('weather', data.current_weather.temperature + '°C');
            Widgets.updateValue('sunrise', data.daily.sunrise[0].slice(-5));
            Widgets.updateValue('sunset', data.daily.sunset[0].slice(-5));
        } catch(e) { console.error("Météo erreur", e); }
    },

    toggleAction: (id) => {
        if(id === 'flashlight') {
            const val = document.getElementById(`val-${id}`);
            // Astuce Web : Créer un overlay blanc brillant car l'API Torch est instable
            let overlay = document.getElementById('flash-overlay');
            if(!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'flash-overlay';
                overlay.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;background:white;z-index:99999;display:none;";
                document.body.appendChild(overlay);
            }
            
            if(overlay.style.display === 'none') {
                overlay.style.display = 'block';
                val.innerText = "ON";
            } else {
                overlay.style.display = 'none';
                val.innerText = "OFF";
            }
        }
    }
};
