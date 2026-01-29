const App = {
    init: async () => {
        console.log("App Initialization...");
        
        // 1. Init Supabase
        if(window.supabase && Config.supabase.url) {
            AppState.supabase = window.supabase.createClient(Config.supabase.url, Config.supabase.key);
        } else {
            console.error("Supabase lib not loaded or config missing");
            return;
        }

        // 2. Check Session
        const { data } = await AppState.supabase.auth.getSession();
        
        if(data && data.session) {
            console.log("Session trouvée, démarrage...");
            App.start(data.session.user);
        } else {
            console.log("Pas de session, affichage Login.");
            UI.show('viewLogin');
        }
    },
    
    start: async (user) => {
        AppState.user = user;
        
        // Update UI info
        const emailEl = document.getElementById('profileEmail');
        if(emailEl) emailEl.innerText = user.email;

        UI.show('viewDiscover');
        
        // 3. Init Map
        MapManager.init();

        // 4. Charger Profil depuis DB
        await App.loadProfile(user.id);
    },

    loadProfile: async (userId) => {
        let { data, error } = await AppState.supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if(error || !data) {
            console.log("Profil introuvable, création...");
            // Création profil par défaut si inexistant
            const newProfile = { 
                id: userId, 
                points: 500, 
                items: [],
                is_admin: false 
            };
            
            const { error: insertErr } = await AppState.supabase
                .from('profiles')
                .insert(newProfile);
                
            if(!insertErr) data = newProfile;
        }

        AppState.profile = data || { points: 0, items: [] };
        
        // Update UI Points
        const ptsEl = document.getElementById('displayPoints');
        if(ptsEl) ptsEl.innerText = AppState.profile.points + " XP";

        // Show Admin Button if admin
        if(AppState.profile.is_admin) {
            document.getElementById('btnAdmin').style.display = 'block';
        }

        // Charger Widgets (Shop)
        if(window.Shop) Shop.renderWidgets();
    }
};

// Point d'entrée principal
window.onload = App.init;
