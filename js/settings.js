const Settings = {
    updateEmail: async () => { const m = prompt("Nouvel email"); if(m) AppState.supabase.auth.updateUser({ email: m }); },
    updatePwd: async () => { const p = prompt("Nouveau pass"); if(p) AppState.supabase.auth.updateUser({ password: p }); },
    toggleTheme: () => {
        AppState.theme = AppState.theme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', AppState.theme);
        localStorage.setItem('cc_theme', AppState.theme);
        MapManager.setLayer(AppState.theme === 'dark' ? 'dark' : 'standard');
    }
};
