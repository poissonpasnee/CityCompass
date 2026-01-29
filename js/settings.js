const Settings = {
    
    init: () => {
        // Appliquer le thème au démarrage
        const savedTheme = localStorage.getItem('cc_theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        
        const switchEl = document.getElementById('themeSwitch');
        if(switchEl) switchEl.checked = (savedTheme === 'dark');
    },

    toggleTheme: () => {
        const body = document.body;
        const current = body.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        
        // Maj DOM
        body.setAttribute('data-theme', next);
        localStorage.setItem('cc_theme', next);
        
        // Maj Carte (Tuiles)
        if(AppState.map) {
            const url = next === 'dark' 
                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' 
                : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
            
            // Astuce Leaflet: Trouver le layer de tuile et changer l'url
            AppState.map.eachLayer(layer => {
                if(layer._url && layer._url.includes('basemaps.cartocdn.com')) {
                    layer.setUrl(url);
                }
            });
        }
    },

    updateEmail: async () => {
        const newEmail = prompt("Entrez votre nouvel email :");
        if(!newEmail || !newEmail.includes('@')) return;

        UI.msg("Mise à jour email...");
        const { data, error } = await AppState.supabase.auth.updateUser({ email: newEmail });

        if(error) {
            alert("Erreur: " + error.message);
        } else {
            alert("Un email de confirmation a été envoyé à " + newEmail + ". Veuillez cliquer sur le lien pour valider.");
        }
    },
    
    updatePwd: async () => {
        const newPwd = prompt("Entrez votre nouveau mot de passe (min 6 chars) :");
        if(!newPwd || newPwd.length < 6) {
            alert("Mot de passe trop court.");
            return;
        }

        const { data, error } = await AppState.supabase.auth.updateUser({ password: newPwd });

        if(error) {
            alert("Erreur: " + error.message);
        } else {
            alert("Mot de passe modifié avec succès !");
        }
    }
};

// Auto-init au chargement du script
Settings.init();
