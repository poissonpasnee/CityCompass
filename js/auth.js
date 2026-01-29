const Auth = {
    login: async () => {
        const e = document.getElementById('emailInput').value;
        const p = document.getElementById('pwdInput').value;
        if(!e||!p) return UI.msg("Remplissez tout");
        
        UI.msg("Connexion...");
        const { data, error } = await AppState.supabase.auth.signInWithPassword({ email:e, password:p });
        
        if(error) UI.msg(error.message);
        else App.start(data.user);
    },
    signup: async () => {
        const e = document.getElementById('emailInput').value;
        const p = document.getElementById('pwdInput').value;
        if(!e||!p) return UI.msg("Remplissez tout");
        
        const { error } = await AppState.supabase.auth.signUp({ email:e, password:p });
        if(error) UI.msg(error.message);
        else UI.msg("Compte créé ! Connectez-vous.");
    },
    logout: async () => {
        await AppState.supabase.auth.signOut();
        location.reload();
    }
};
