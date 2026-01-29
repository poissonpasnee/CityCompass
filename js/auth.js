const Auth = {
    isSignup: false,

    toggleMode: () => {
        Auth.isSignup = !Auth.isSignup;
        const title = document.getElementById('authTitle');
        const btn = document.getElementById('authBtn');
        const switchText = document.getElementById('switchText');
        const msg = document.getElementById('msg');
        
        msg.innerText = "";
        
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
        // Evite le double clic
        if(btn.innerText === "Chargement..." || btn.innerText === "Création...") return;
        
        if(Auth.isSignup) Auth.signup();
        else Auth.login();
    },

    login: async () => {
        const e = document.getElementById('emailInput').value;
        const p = document.getElementById('pwdInput').value;
        
        // Mode Démo rapide (si champs vides ou admin/admin)
        if(e === 'admin' && p === 'admin') {
            App.start({ id: 'demo-user', email: 'admin@demo.com' });
            return;
        }

        if(!e || !p) return Auth.err("Remplissez tous les champs");
        
        const btn = document.getElementById('authBtn');
        const originalText = btn.innerText;
        btn.innerText = "Chargement...";
        
        try {
            if(!AppState.supabase) throw new Error("Supabase non initialisé");

            const { data, error } = await AppState.supabase.auth.signInWithPassword({ email:e, password:p });
            
            if(error) throw error;
            
            App.start(data.user);

        } catch (error) {
            console.error(error);
            btn.innerText = originalText;
            
            // DÉTECTION ERREUR RÉSEAU / LOAD FAILED
            if(error.message === "Failed to fetch" || error.message.includes("Load failed") || !window.navigator.onLine) {
                if(confirm("Erreur de connexion serveur.\n\nVoulez-vous entrer en mode HORS LIGNE (Démo) ?")) {
                    App.start({ id: 'offline-user', email: 'mode@hors-ligne.com' });
                }
            } else {
                Auth.err(error.message === "Invalid login credentials" ? "Email ou mot de passe incorrect" : "Erreur: " + error.message);
            }
        }
    },

    signup: async () => {
        const e = document.getElementById('emailInput').value;
        const p = document.getElementById('pwdInput').value;
        if(!e || !p) return Auth.err("Remplissez tous les champs");
        
        const btn = document.getElementById('authBtn');
        const originalText = btn.innerText;
        btn.innerText = "Création...";

        try {
            if(!AppState.supabase) throw new Error("Supabase non initialisé");

            const { error } = await AppState.supabase.auth.signUp({ email:e, password:p });
            
            if(error) throw error;
            
            Auth.err("Compte créé ! Connectez-vous.", "#34C759");
            setTimeout(() => {
                Auth.toggleMode();
                document.getElementById('emailInput').value = e;
                btn.innerText = "CONNEXION";
            }, 1500);

        } catch (error) {
            console.error(error);
            btn.innerText = originalText;
            if(error.message.includes("Load failed")) {
                alert("Impossible de joindre le serveur d'inscription. Vérifiez votre connexion.");
            } else {
                Auth.err(error.message);
            }
        }
    },

    logout: async () => {
        if(AppState.supabase) await AppState.supabase.auth.signOut();
        location.reload();
    },

    err: (msg, color='#ff6b6b') => {
        const m = document.getElementById('msg');
        m.style.color = color;
        m.innerText = msg;
    }
};
