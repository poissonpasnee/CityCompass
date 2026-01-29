const Favorites = {
    render: () => {
        const list = document.getElementById('favListContainer');
        const favs = AppState.profile.favorites || [];
        
        if(favs.length === 0) {
            list.innerHTML = "<p style='text-align:center; opacity:0.5; margin-top:50px;'>Aucun favori.</p>";
            return;
        }
        
        list.innerHTML = '';
        favs.forEach((f, idx) => {
            const item = document.createElement('div');
            item.className = 'fav-item';
            item.innerHTML = `
                <div onclick="UI.show('viewDiscover'); AppState.map.setView([${f.lat}, ${f.lng}], 16); MapManager.showPopup({lat:${f.lat}, lng:${f.lng}}, '${f.name.replace(/'/g, "\\'")}')" style="flex:1;">
                    <div style="font-weight:bold; font-size:16px;">${f.name}</div>
                    <div style="font-size:12px; opacity:0.6;">${f.lat.toFixed(4)}, ${f.lng.toFixed(4)}</div>
                </div>
                <div style="display:flex; gap:10px;">
                    <button onclick="Compass.start({lat:${f.lat}, lng:${f.lng}, name:'${f.name.replace(/'/g, "\\'")}'}); UI.show('viewNav');" style="background:#007AFF; color:white; border:none; width:40px; height:40px; border-radius:50%;"><i class="fa-solid fa-location-arrow"></i></button>
                    <button onclick="Favorites.del(${idx})" style="background:#FF3B30; color:white; border:none; width:40px; height:40px; border-radius:50%;"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            list.appendChild(item);
        });
    },

    add: async (point) => {
        if(!AppState.profile.favorites) AppState.profile.favorites = [];
        AppState.profile.favorites.push(point);
        
        await AppState.supabase.from('profiles').update({ favorites: AppState.profile.favorites }).eq('id', AppState.user.id);
        alert("Ajouté aux favoris !");
        Favorites.render(); // Rafraîchir
    },

    del: async (idx) => {
        if(!confirm("Supprimer ce favori ?")) return;
        AppState.profile.favorites.splice(idx, 1);
        await AppState.supabase.from('profiles').update({ favorites: AppState.profile.favorites }).eq('id', AppState.user.id);
        Favorites.render();
    }
};
