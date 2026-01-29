const UI = {
    msg: (t) => document.getElementById('msg').innerText = t,
    
    show: (viewId) => {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
        
        const nav = document.getElementById('navBar');
        if(viewId === 'viewLogin' || viewId === 'viewAdmin') nav.style.display = 'none';
        else nav.style.display = 'flex';
        
        // Mise à jour onglets
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        if(viewId === 'viewDiscover') document.querySelectorAll('.nav-tab')[0].classList.add('active');
        if(viewId === 'viewNav') document.querySelectorAll('.nav-tab')[1].classList.add('active');
        if(viewId === 'viewFavorites') document.querySelectorAll('.nav-tab')[2].classList.add('active');
        if(viewId === 'viewAccount') document.querySelectorAll('.nav-tab')[3].classList.add('active');

        if(viewId === 'viewDiscover' && AppState.map) setTimeout(() => AppState.map.invalidateSize(), 300);
    },

    toggleMapMenu: (forceState) => {
        const m = document.getElementById('mapMenu');
        if(forceState !== undefined) {
            m.style.display = forceState ? 'block' : 'none';
        } else {
            m.style.display = m.style.display === 'block' ? 'none' : 'block';
        }
    }
};
