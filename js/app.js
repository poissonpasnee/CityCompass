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
            data = { points: 500, items: [] };
        }
        AppState.profile = data;
        
        document.getElementById('displayPoints').innerText = data.points + " XP";
        
        MapManager.init();
        Shop.renderWidgets(); // Charge les widgets dans le profil
    }
};
window.onload = App.init;
