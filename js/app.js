// Logique principale de l'application
const App = {
    init: async () => {
        console.log('🚀 CityCompass - Initialisation');
        
        // Initialiser Supabase
        AppState.supabase = supabase.createClient(Config.supabase.url, Config.supabase.key);
        
        // Charger le thème sauvegardé
        AppState.theme = localStorage.getItem('cc_theme') || 'light';
        document.body.setAttribute('data-theme', AppState.theme);
        
        // Vérifier la session existante
        try {
            const { data: { session }, error } = await AppState.supabase.auth.getSession();
            
            if (error) throw error;
            
            if (session) {
                await App.start(session.user);
            } else {
                document.getElementById('loginScreen').style.display = 'flex';
            }
        } catch (error) {
            console.error('Erreur initialisation:', error);
            document.getElementById('loginScreen').style.display = 'flex';
        }
    },
    
    start: async (user) => {
        console.log('👤 Utilisateur connecté:', user.email);
        
        AppState.currentUser = user;
        
        // Masquer l'écran de connexion
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('hud').style.display = 'flex';
        document.getElementById('profileEmail').innerText = user.email;
        
        // Initialiser la carte
        MapManager.init();
        
        // Charger les données utilisateur
        await App.loadUserData();
        
        // Restaurer le dernier panneau ouvert
        const lastPanel = localStorage.getItem('cc_last_panel');
        if (lastPanel) {
            setTimeout(() => UI.open(lastPanel), 500);
        }
    },
    
    loadUserData: async () => {
        try {
            const { data, error } = await AppState.supabase
                .from('profiles')
                .select('*')
                .eq('id', AppState.currentUser.id)
                .single();
            
            if (error) {
                // Si le profil n'existe pas, le créer
                if (error.code === 'PGRST116') {
                    await App.createUserProfile();
                    return;
                }
                throw error;
            }
            
            if (data) {
                AppState.userProfile = data;
                App.applyUserSettings();
                Shop.render();
                MapManager.renderFavorites();
                
                // Afficher le panneau admin si nécessaire
                if (data.is_admin) {
                    document.getElementById('adminPanel').style.display = 'block';
                }
            }
        } catch (error) {
            console.error('Erreur chargement données:', error);
        }
    },
    
    createUserProfile: async () => {
        try {
            const { error } = await AppState.supabase
                .from('profiles')
                .insert({
                    id: AppState.currentUser.id,
                    points: 0,
                    items: [],
                    active_items: [],
                    favorites: []
                });
            
            if (error) throw error;
            
            // Recharger les données
            await App.loadUserData();
        } catch (error) {
            console.error('Erreur création profil:', error);
        }
    },
    
    applyUserSettings: () => {
        // Mettre à jour l'affichage des points
        document.getElementById('hudPoints').innerText = AppState.userProfile.points || 0;
        document.getElementById('shopPoints').innerText = AppState.userProfile.points || 0;
        
        // Appliquer la couleur personnalisée
        if (AppState.userProfile.color) {
            document.documentElement.style.setProperty('--accent', AppState.userProfile.color);
        }
        
        // Activer les widgets achetés
        const activeItems = AppState.userProfile.active_items || [];
        activeItems.forEach(itemId => {
            const item = Config.items.find(i => i.id === itemId);
            if (item) {
                if (item.type === 'widget') {
                    MapManager.toggleOverlay(itemId, true);
                }
            }
        });
    }
};

// Démarrer l'application au chargement de la page
window.addEventListener('load', () => {
    App.init();
});
