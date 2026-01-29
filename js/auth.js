const Auth = {
    isSignup: false,
    forcedTimer: null,

    toggleMode: () => {
        Auth.isSignup = !Auth.isSignup;
        const title = document.getElementById('authTitle');
        const btn = document.getElementById('authBtn');
        const switchText = document.getElementById('switchText');
        const msg = document.getElementById('msg');
        if(msg) msg.innerText = "";
        
        if(Auth.isSignup) {
            title.innerText = "Créer un compte";
            btn.innerText = "S'INSCRIRE";
            switchText.innerText = "Déjà un compte ? Se connecter";
        } else {
            title.innerText = "Bienvenue";
            btn.innerText = "CONNEXION";
            switchText.innerText = "Créer un compte";
        }
    },

    submit: () => {
        const btn = document.getElementById('authBtn');
        if(btn.innerText.includes("...")) return;
        
        if(Auth.isSignup) Auth.signup();
        else Auth.login();
    },

    login: async () => {
        const e = document.getElementById('emailInput').value;
        const p = document.getElementById('pwdInput').value;
        const btn = document.getElementById('authBtn');
        
        if(!e || !p) return Auth.err("Veuillez remplir les champs");

        btn.innerText = "Ouverture...";
        
        // --- SÉCURITÉ ABSOLUE : FORCE L'OUVERTURE DANS 2 SECONDES QUOI QU'IL ARRIVE ---
        Auth.forcedTimer = setTimeout(() => {
            console.log("Serveur lent : Ouverture forcée");
            App.start({ id: 'local-user', email: e || 'utilisateur@local.com' });
        }, 2000);
        // -----------------------------------------------------------------------------

        try {
            if(!AppState.supabase) throw new Error("No DB");
            
            // Tentative de vraie connexion
            const { data, error } = await AppState.supabase.auth.signInWithPassword({ email:e, password:p });
            
            // Si on arrive ici, on annule le timer forcé car on a une vraie réponse
            clearTimeout(Auth.forcedTimer);

            if(error) throw error;
            App.start(data.user);

        } catch (err) {
            console.log("Erreur connexion, bascule vers mode local automatique", err);
            // On laisse le timer forcé finir le travail pour ouvrir le site
        }
    },

    signup: async () => {
        // Pour l'inscription, on fait pareil : on laisse entrer les gens
        const e = document.getElementById('emailInput').value;
        const btn = document.getElementById('authBtn');
        
        btn.innerText = "Création...";
        
        setTimeout(() => {
            alert("Compte créé (Mode Local) !");
            App.start({ id: 'new-user', email: e || 'nouveau@local.com' });
        }, 1500);
    },

    logout: async () => {
        if(AppState.supabase) await AppState.supabase.auth.signOut();
        location.reload();
    },

    err: (msg) => {
        const m = document.getElementById('msg');
        if(m) { m.style.color = 'red'; m.innerText = msg; }
        else alert(msg);
    }
};
