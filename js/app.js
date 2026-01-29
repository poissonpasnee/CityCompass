const App = {
    user: null,

    init: async () => {
        // Vérif Session
        const { data: { session } } = await supabase.auth.getSession();
        
        if(!session) {
            document.getElementById('view-login').style.display = 'flex';
        } else {
            // Connecté
            App.user = session.user;
            document.getElementById('view-login').style.display = 'none';
            document.getElementById('navbar').style.display = 'flex';
            
            // Afficher carte par défaut
            App.show('view-map', document.querySelector('.nav-item'));
            
            // Charger profil
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', App.user.id).single();
            if(profile) {
                document.getElementById('profile-email').innerText = profile.email || App.user.email;
                document.getElementById('profile-points').innerText = (profile.points || 0) + ' XP';
                App.user.is_admin = profile.is_admin;
                
                // Init Modules
                MapManager.init();
                Compass.init();
                Widgets.init();
                Admin.init(App.user);
            }
        }
    },

    show: (viewId, btn) => {
        // Masquer tout
        document.querySelectorAll('.view').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

        // Afficher cible
        document.getElementById(viewId).style.display = 'block';
        if(btn) btn.classList.add('active');

        // Refresh carte si besoin
        if(viewId === 'view-map' && window.map) window.map.invalidateSize();
    }
};

window.onload = App.init;
