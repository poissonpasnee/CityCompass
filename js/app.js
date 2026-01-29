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
        
        // Charger Profil
        let { data } = await AppState.supabase.from('profiles').select('*').eq('id', user.id).single();
        if(!data) {
            await AppState.supabase.from('profiles').insert({ id: user.id, points: 500 });
            data = { points: 500, favorites: [], is_admin: false };
        }
        AppState.profile = data;
        
        // Admin
        if(AppState.profile.is_admin) document.getElementById('btnAdmin').style.display = 'block';
        
        document.getElementById('displayPoints').innerText = data.points + " XP";
        
        // Restaurer thème
        const theme = localStorage.getItem('cc_theme');
        if(theme) {
            document.body.setAttribute('data-theme', theme);
            document.getElementById('themeSwitch').checked = (theme === 'dark');
        }

        MapManager.init();
        Favorites.render();
    }
};
window.onload = App.init;
