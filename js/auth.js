const Auth = {
    isSignup: false,

    toggleMode: () => {
        Auth.isSignup = !Auth.isSignup;
        
        const title = document.getElementById('authTitle');
        const btn = document.getElementById('authBtn');
        const switchText = document.getElementById('switchText');
        const msg = document.getElementById('msg');
        
        msg.innerText = ""; // Effacer les erreurs précédentes
        
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
        if(Auth.isSignup) Auth.signup();
        else Auth.login();
    },

    login: async () => {
        const e = document.getElementById('emailInput').value;
        const p = document.getElementById('pwdInput').value;
        if(!e || !p) return Auth.err("Remplissez tous les champs");
        
        const btn = document.getElementById('authBtn');
        const originalText = btn.innerText;
        btn.innerText = "Chargement...";
        
        // Connexion Supabase
        const { data, error } = await AppState.supabase.auth.signInWithPassword({ email:e, password:p });
        
        if(error) {
            Auth.err(error.message === "Invalid login credentials" ? "Email ou mot de passe incorrect" : error.message);
            btn.innerText = originalText;
        } else {
            // Succès
            App.start(data.user);
        }
    },

    signup: async () => {
        const e = document.getElementById('emailInput').value;
        const p = document.getElementById('pwdInput').value;
        if(!e || !p) return Auth.err("Remplissez tous les champs");
        
        const btn = document.getElementById('authBtn');
        const originalText = btn.innerText;
        btn.innerText = "Création...";

        const { error } = await AppState.supabase.auth.signUp({ email:e, password:p });
        
        if(error) {
            Auth.err(error.message);
            btn.innerText = originalText;
        } else {
            Auth.err("Compte créé ! Connectez-vous.", "#34C759"); // Vert
            setTimeout(() => {
                Auth.toggleMode();
                document.getElementById('emailInput').value = e;
                btn.innerText = "CONNEXION";
            }, 1500);
        }
    },

    logout: async () => {
        await AppState.supabase.auth.signOut();
        location.reload();
    },

    err: (msg, color='#ff6b6b') => {
        const m = document.getElementById('msg');
        m.style.color = color;
        m.innerText = msg;
    }
};
