const UI = {
    msg: (t) => document.getElementById('msg').innerText = t,
    show: (viewId) => {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
        
        // Gérer la navbar
        const nav = document.getElementById('navBar');
        if(viewId === 'viewLogin' || viewId === 'viewCam') nav.style.display = 'none';
        else nav.style.display = 'flex';
        
        // Resize Map
        if(viewId === 'viewDiscover' && AppState.map) setTimeout(() => AppState.map.invalidateSize(), 300);
    }
};
