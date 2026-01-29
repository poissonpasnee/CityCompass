const App = {
    init: async () => {
        try {
            // Initialisation Supabase (si possible)
            if(window.supabase && Config.supabase) {
                AppState.supabase = window.supabase.createClient(Config.supabase.url, Config.supabase.key);
                // Vérif session silencieuse
                const { data } = await AppState.supabase.auth.getSession();
                if(data?.session) {
                    App.start(data.session.user);
                    return;
                }
            }
        } catch (e) { console.log("Init offline"); }
        
        // Si pas de session, on montre le login
        UI.show('viewLogin');
    },
    
    start: async (user) => {
        // Annuler tout timer de secours restant
        if(Auth.forcedTimer) clearTimeout(Auth.forcedTimer);

        AppState.user = user;
        if(document.getElementById('profileEmail')) document.getElementById('profileEmail').innerText = user.email;
        
        // Cacher Login, Afficher Carte
        UI.show('viewDiscover');
        
        // Charger Profil (Local ou Distant)
        AppState.profile = { points: 500, favorites: [], is_admin: false }; // Défaut
        
        try {
            if(AppState.supabase && user.id !== 'local-user') {
                let { data } = await AppState.supabase.from('profiles').select('*').eq('id', user.id).single();
                if(data) AppState.profile = data;
            }
        } catch(e) {}

        // Mise à jour UI
        if(document.getElementById('displayPoints')) document.getElementById('displayPoints').innerText = AppState.profile.points + " XP";
        
        // Lancement Modules
        if(window.MapManager) {
            MapManager.init();
            setTimeout(() => {
                // Force le rafraîchissement de la carte pour qu'elle s'affiche bien
                if(AppState.map) AppState.map.invalidateSize();
            }, 500);
        }
        if(window.Shop) Shop.renderWidgets();
        if(window.Favorites) Favorites.render();
    }
};
window.onload = App.init;
