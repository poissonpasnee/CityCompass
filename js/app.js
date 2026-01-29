const App = {
    init: async () => {
        AppState.supabase = window.supabase.createClient(Config.supabase.url, Config.supabase.key);
        const { data } = await AppState.supabase.auth.getSession();
        if(data?.session) App.start(data.session.user);
        else UI.show('viewLogin');
    },
    
    start: async (user) => {
        AppState.user = user;
        document.getElementById('profileEmail').innerText = user.email;
        UI.show('viewDiscover');
        
        let { data } = await AppState.supabase.from('profiles').select('*').eq('id', user.id).single();
        if(!data) {
            await AppState.supabase.from('profiles').insert({ id: user.id, points: 500 });
            data = { points: 500, items: [], favorites: [], is_admin: false };
        }
        AppState.profile = data;
        
        // Affichage Admin
        if(AppState.profile.is_admin) {
            document.getElementById('btnAdmin').style.display = 'block';
        }

        document.getElementById('displayPoints').innerText = data.points + " XP";
        
        MapManager.init();
        Shop.renderWidgets();
        Favorites.render(); // Charge la liste
    }
};

const Favorites = {
    render: () => {
        const list = document.getElementById('favListContainer');
        const favs = AppState.profile.favorites || [];
        
        if(favs.length === 0) {
            list.innerHTML = "<p style='text-align:center; opacity:0.5;'>Aucun favori.</p>";
            return;
        }
        
        list.innerHTML = '';
        favs.forEach((f, idx) => {
            const item = document.createElement('div');
            item.className = 'fav-item';
            item.innerHTML = `
                <div><b>${f.name}</b><br><small>${f.lat.toFixed(4)}, ${f.lng.toFixed(4)}</small></div>
                <div>
                    <button onclick="Favorites.go(${idx})" style="background:#007AFF; border:none; color:white; padding:5px 10px; border-radius:5px;">Go</button>
                    <button onclick="Favorites.edit(${idx})" style="background:#333; border:none; color:white; padding:5px 10px; border-radius:5px;">✏️</button>
                    <button onclick="Favorites.del(${idx})" style="background:red; border:none; color:white; padding:5px 10px; border-radius:5px;">🗑️</button>
                </div>
            `;
            list.appendChild(item);
        });
    },

    go: (idx) => {
        const f = AppState.profile.favorites[idx];
        Compass.start({ lat: f.lat, lng: f.lng, name: f.name });
        UI.show('viewNav');
    },

    edit: async (idx) => {
        const f = AppState.profile.favorites[idx];
        const newName = prompt("Nouveau nom :", f.name);
        if(newName) {
            AppState.profile.favorites[idx].name = newName;
            await Favorites.save();
        }
    },

    del: async (idx) => {
        if(confirm("Supprimer ?")) {
            AppState.profile.favorites.splice(idx, 1);
            await Favorites.save();
        }
    },

    save: async () => {
        await AppState.supabase.from('profiles').update({ favorites: AppState.profile.favorites }).eq('id', AppState.user.id);
        Favorites.render();
    }
};

window.onload = App.init;
