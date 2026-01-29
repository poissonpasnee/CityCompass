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
        
        // Load Profile
        let { data } = await AppState.supabase.from('profiles').select('*').eq('id', user.id).single();
        
        if(!data) {
            await AppState.supabase.from('profiles').insert({ id: user.id, points: 500 });
            data = { points: 500, items: [], favorites: [] };
        }
        AppState.profile = data;
        
        // Admin Check
        if(AppState.profile.is_admin) document.getElementById('btnAdmin').style.display = 'block';
        
        document.getElementById('displayPoints').innerText = data.points + " XP";
        
        MapManager.init();
        Shop.renderWidgets();
        Favorites.render(); // Charge la liste des favoris

        // Restaurer thème
        const theme = localStorage.getItem('cc_theme');
        if(theme) document.body.setAttribute('data-theme', theme);
    }
};

window.onload = App.init;
