// js/widgets.js
const Widgets = {
    data: [
        {id:'speed', icon:'🚀', name:'Vitesse', val:'0 km/h'},
        {id:'heading', icon:'🧭', name:'Cap', val:'0°'},
        {id:'altitude', icon:'⛰️', name:'Altitude', val:'0 m'},
        {id:'weather', icon:'⛅', name:'Météo', val:'--'},
        {id:'distance', icon:'🏁', name:'Distance', val:'--'},
        {id:'clock', icon:'🕒', name:'Heure', val:'--:--'},
        {id:'date', icon:'📅', name:'Date', val:'--/--'},
        {id:'battery', icon:'🔋', name:'Batterie', val:'--%'},
        {id:'network', icon:'📡', name:'Réseau', val:'Online'},
        {id:'sunrise', icon:'🌅', name:'Lever', val:'--:--'},
        {id:'coords', icon:'📍', name:'Pos', val:'--'},
    ],
    expanded: false,

    init: () => {
        Widgets.render();
        setInterval(Widgets.tick, 1000); // Horloge
        
        // Batterie
        if(navigator.getBattery) navigator.getBattery().then(b => Widgets.update('battery', Math.round(b.level*100)+'%'));
    },

    render: () => {
        const grid = document.getElementById('widgets-grid');
        if(!grid) return;
        grid.innerHTML = '';

        const limit = Widgets.expanded ? 99 : 4;
        
        Widgets.data.slice(0, limit).forEach(w => {
            const div = document.createElement('div');
            div.className = 'widget-card';
            div.innerHTML = `
                <div class="widget-icon">${w.icon}</div>
                <div class="widget-val" id="w-${w.id}">${w.val}</div>
                <div class="widget-name">${w.name}</div>
            `;
            grid.appendChild(div);
        });

        if(Widgets.data.length > 4) {
            const btn = document.createElement('div');
            btn.className = 'show-more';
            btn.innerHTML = Widgets.expanded ? 'Masquer ▲' : 'Afficher plus ▼';
            btn.onclick = () => { Widgets.expanded = !Widgets.expanded; Widgets.render(); };
            grid.appendChild(btn);
        }
    },

    update: (id, val) => {
        const el = document.getElementById(`w-${id}`);
        if(el) el.innerText = val;
        // Met aussi à jour la donnée interne
        const w = Widgets.data.find(x => x.id === id);
        if(w) w.val = val;
    },

    tick: () => {
        const now = new Date();
        Widgets.update('clock', now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}));
        Widgets.update('date', now.toLocaleDateString());
    },

    fetchWeather: async (lat, lng) => {
        if(Widgets.lastFetch && Date.now() - Widgets.lastFetch < 300000) return; // Cache 5 min
        Widgets.lastFetch = Date.now();
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=sunrise,sunset&timezone=auto`);
            const json = await res.json();
            Widgets.update('weather', json.current_weather.temperature + '°C');
            Widgets.update('sunrise', json.daily.sunrise[0].slice(-5));
        } catch(e) {}
    }
};
