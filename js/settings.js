const Settings = {
    toggleTheme: () => {
        const body = document.body;
        const current = body.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        
        body.setAttribute('data-theme', next);
        localStorage.setItem('cc_theme', next);
        
        // Mise à jour switch
        document.getElementById('themeSwitch').checked = (next === 'dark');

        // Mise à jour carte si elle existe
        if(AppState.map) {
            MapManager.setLayer(next === 'dark' ? 'dark' : 'standard');
        }
    },

    updateEmail: async () => {
        const m = prompt("Nouvel email :");
        if(m) {
            const { error } = await AppState.supabase.auth.updateUser({ email: m });
            if(error) alert(error.message); else alert("Vérifiez votre nouvel email !");
        }
    },
    
    updatePwd: async () => {
        const p = prompt("Nouveau mot de passe :");
        if(p) {
            const { error } = await AppState.supabase.auth.updateUser({ password: p });
            if(error) alert(error.message); else alert("Mot de passe changé !");
        }
    }
};
