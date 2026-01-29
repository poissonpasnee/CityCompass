const UI = {
    msg: (t) => document.getElementById('msg').innerText = t,
    
    show: (viewId) => {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
        
        const nav = document.getElementById('navBar');
        if(viewId === 'viewLogin' || viewId === 'viewAdmin') nav.style.display = 'none';
        else nav.style.display = 'flex';
        
        // Gérer les icônes actives
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        // (Logique simple pour activer le bon bouton selon la vue - optionnelle)

        if(viewId === 'viewDiscover' && AppState.map) setTimeout(() => AppState.map.invalidateSize(), 300);
    },

    toggleMapMenu: () => {
        const m = document.getElementById('mapMenu');
        m.style.display = m.style.display === 'block' ? 'none' : 'block';
    }
};
