const Shop = {
    widgetsList: [
        { id: 'w_speed', icon: 'gauge-high', name: 'Vitesse', color:'orange' },
        { id: 'w_alt', icon: 'mountain', name: 'Altitude', color:'gray' },
        { id: 'w_temp', icon: 'cloud', name: 'Météo', color:'#007AFF' },
        { id: 'w_head', icon: 'compass', name: 'Cap', color:'purple' },
        { id: 'w_crono', icon: 'stopwatch', name: 'Chrono', color:'red' },
        { id: 'w_step', icon: 'shoe-prints', name: 'Podomètre', color:'green' },
        { id: 'w_coord', icon: 'map-pin', name: 'Coords', color:'brown' },
        { id: 'w_acc', icon: 'crosshairs', name: 'Précision', color:'teal' },
        { id: 'w_batt', icon: 'battery-full', name: 'Batterie', color:'limegreen' },
        { id: 'w_sun', icon: 'sun', name: 'UV Index', color:'gold' }
    ],

    renderWidgets: () => {
        const grid = document.getElementById('profileWidgets');
        if(!grid) return;
        grid.innerHTML = '';
        
        // Affiche TOUS les widgets directement
        Shop.widgetsList.forEach((w, idx) => {
            const div = document.createElement('div');
            div.className = 'widget';
            
            // ID unique pour mise à jour dynamique
            let valId = 'wid' + w.name; 
            if(w.id === 'w_speed') valId = 'widSpeed';
            if(w.id === 'w_alt') valId = 'widAlt';
            if(w.id === 'w_head') valId = 'widHead';

            div.innerHTML = `
                <i class="fa-solid fa-${w.icon}" style="font-size:24px; color:${w.color};"></i>
                <div class="widget-val" id="${valId}">${idx > 3 ? '--' : '0'}</div>
                <div class="widget-lbl">${w.name}</div>
            `;
            grid.appendChild(div);
        });

        // Bouton "Afficher Plus"
        const btn = document.getElementById('btnShowMore');
        if(Shop.widgetsList.length > 4) {
            btn.style.display = 'block';
        }
    },

    toggleMore: () => {
        const grid = document.getElementById('profileWidgets');
        const btn = document.getElementById('btnShowMore');
        
        if(grid.classList.contains('collapsed')) {
            grid.classList.remove('collapsed');
            grid.classList.add('expanded');
            btn.innerText = 'Réduire ▲';
        } else {
            grid.classList.remove('expanded');
            grid.classList.add('collapsed');
            btn.innerText = 'Afficher plus ▼';
        }
    }
};
