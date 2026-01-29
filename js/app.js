const App = {
    init: async () => {
        try {
            // Vérification que la librairie Supabase est chargée
            if(typeof window.supabase === 'undefined') {
                throw new Error("Librairie Supabase non chargée (Erreur CDN). Vérifiez votre connexion internet.");
            }

            // Création du client
            AppState.supabase = window.supabase.createClient(Config.supabase.url, Config.supabase.key);
            
            // Vérification session existante
            const { data } = await AppState.supabase.auth.getSession();
            if(data?.session) {
                App.start(data.session.user);
            } else {
                UI.show('viewLogin');
            }
        } catch (e) {
            console.error("Erreur Critique Init:", e);
            // En cas de crash total, on force l'affichage du login pour laisser une chance au mode hors ligne
            UI.show('viewLogin');
            document.getElementById('msg').innerText = "Mode Hors Ligne dispo (tapez admin/admin)";
        }
    },
    
    start: async (user) => {
        AppState.user = user;
        if(document.getElementById('profileEmail')) document.getElementById('profileEmail').innerText = user.email;
        
        UI.show('viewDiscover');
        
        // Chargement Profil (silencieux si erreur)
        try {
            if(AppState.supabase) {
                let { data } = await AppState.supabase.from('profiles').select('*').eq('id', user.id).single();
                if(!data && user.id !== 'offline' && user.id !== 'admin-local') {
                    // Création auto si nouveau
                    await AppState.supabase.from('profiles').insert({ id: user.id, points: 500 });
                    data = { points: 500, favorites: [], is_admin: false };
                }
                AppState.profile = data || { points: 0, favorites: [], is_admin: false };
            } else {
                AppState.profile = { points: 0, favorites: [], is_admin: false };
            }
        } catch(e) { 
            console.log("Profil load error", e);
            AppState.profile = { points: 0, favorites: [], is_admin: false };
        }
        
        // Mise à jour UI
        if(document.getElementById('displayPoints')) document.getElementById('displayPoints').innerText = (AppState.profile.points || 0) + " XP";
        if(AppState.profile.is_admin && document.getElementById('btnAdmin')) document.getElementById('btnAdmin').style.display = 'block';
        
        // Lancement Carte
        if(window.MapManager) MapManager.init();
        if(window.Shop) Shop.renderWidgets();
        if(window.Favorites) Favorites.render();
    }
};

window.onload = App.init;
