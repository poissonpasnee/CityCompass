const Shop = {
    renderWidgets: () => {
        const grid = document.getElementById('widgetGrid');
        grid.innerHTML = '';
        
        // Récupérer les items possédés qui sont de type 'widget' ou 'tool'
        const widgets = Config.items.filter(i => 
            (i.type === 'widget' || i.type === 'tool') && 
            (AppState.profile.items || []).includes(i.id)
        );

        if(widgets.length === 0) {
            grid.innerHTML = '<p style="grid-column:span 2; opacity:0.5;">Aucun widget actif</p>';
            return;
        }

        widgets.forEach(w => {
            const div = document.createElement('div');
            div.className = 'widget';
            div.innerHTML = `<div class="widget-icon">${w.icon}</div><div>${w.name}</div>`;
            grid.appendChild(div);
        });

        // Gestion du bouton "Afficher plus"
        const btn = document.getElementById('btnShowMore');
        if(widgets.length > 4) {
            btn.style.display = 'block';
            btn.innerText = 'Afficher plus ▼';
            grid.classList.remove('expanded');
        } else {
            btn.style.display = 'none';
        }
    },

    toggleMore: () => {
        const grid = document.getElementById('widgetGrid');
        const btn = document.getElementById('btnShowMore');
        
        if(grid.classList.contains('expanded')) {
            grid.classList.remove('expanded');
            btn.innerText = 'Afficher plus ▼';
        } else {
            grid.classList.add('expanded');
            btn.innerText = 'Réduire ▲';
        }
    },

    // (Garde la fonction render() et buy() existantes pour la boutique)
    render: () => { /* ... code existant ... */ }
};
