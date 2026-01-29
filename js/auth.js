const Auth = {
    isSignup: false,

    toggleMode: () => {
        Auth.isSignup = !Auth.isSignup;
        const title = document.getElementById('authTitle');
        const btn = document.getElementById('authBtn');
        const switchText = document.getElementById('switchText');
        
        if(document.getElementById('msg')) document.getElementById('msg').innerText = "";
        
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
        // Anti-spam clic
        const btn = document.getElementById('authBtn');
        if(btn.innerText.includes("...")) return;

        if(Auth.isSignup) Auth.signup();
        else Auth.login();
    },

    login: async () => {
        const e = document.getElementById('emailInput').value;
        const p = document.getElementById('pwdInput').value;
        
        // Mode Secours Admin
        if(e === 'admin' && p === 'admin') {
            App.start({ id: 'admin-local', email: 'admin@local.com' });
            return;
        }

        if(!e || !p) return Auth.err("Remplissez tout");
        
        const btn = document.getElementById('authBtn');
        const oldText = btn.innerText;
        btn.innerText = "Chargement...";
        
        try {
            if(!AppState.supabase) throw new Error("Erreur init. Supabase");

            const { data, error } = await AppState.supabase.auth.signInWithPassword({ email:e, password:p });
            if(error) throw error;
            
            App.start(data.user);

        } catch (err) {
            console.error(err);
            btn.innerText = oldText;
            
            // Si erreur réseau ou "Load Failed", on propose le mode hors ligne
            if(err.message.includes("Load failed") || err.message.includes("fetch")) {
                if(confirm("Connexion serveur impossible (Load Failed).\n\nPasser en mode HORS LIGNE ?")) {
                    App.start({ id: 'offline', email: 'offline@mode.com' });
                }
            } else {
                Auth.err("Erreur: " + err.message);
            }
        }
    },

    signup: async () => {
        const e = document.getElementById('emailInput').value;
        const p = document.getElementById('pwdInput').value;
        if(!e || !p) return Auth.err("Remplissez tout");
        
        const btn = document.getElementById('authBtn');
        const oldText = btn.innerText;
        btn.innerText = "Création...";

        try {
            if(!AppState.supabase) throw new Error("Erreur init. Supabase");

            const { error } = await AppState.supabase.auth.signUp({ email:e, password:p });
            if(error) throw error;
            
            Auth.err("Compte créé ! Connectez-vous.", "#34C759");
            setTimeout(() => {
                Auth.toggleMode();
                document.getElementById('emailInput').value = e;
                btn.innerText = "CONNEXION";
            }, 1500);

        } catch (err) {
            btn.innerText = oldText;
            Auth.err(err.message);
        }
    },

    logout: async () => {
        if(AppState.supabase) await AppState.supabase.auth.signOut();
        location.reload();
    },

    err: (msg, color='#ff6b6b') => {
        const m = document.getElementById('msg');
        if(m) {
            m.style.color = color;
            m.innerText = msg;
        } else {
            alert(msg);
        }
    }
};
