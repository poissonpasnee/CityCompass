const Auth = {
    isSignup: false,
    securityTimer: null,

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
        const btn = document.getElementById('authBtn');
        if(btn.innerText.includes("...")) return; // Anti-spam clic
        
        if(Auth.isSignup) Auth.signup();
        else Auth.login();
    },

    login: async () => {
        const e = document.getElementById('emailInput').value;
        const p = document.getElementById('pwdInput').value;
        const btn = document.getElementById('authBtn');
        const originalText = btn.innerText;

        // Backdoor instantanée
        if(e === 'admin' && p === 'admin') {
            App.start({ id: 'admin', email: 'admin@local' });
            return;
        }

        if(!e || !p) return Auth.err("Remplissez tout");
        
        btn.innerText = "Chargement...";
        
        // --- SECURITE CRITIQUE ---
        // Si dans 3 secondes le code est toujours là, on force l'entrée
        if(Auth.securityTimer) clearTimeout(Auth.securityTimer);
        Auth.securityTimer = setTimeout(() => {
            if(confirm("Le serveur est trop lent.\n\nPasser en mode HORS LIGNE ?")) {
                App.start({ id: 'offline', email: 'mode@hors-ligne' });
            } else {
                btn.innerText = originalText; // Reset bouton
            }
        }, 3000);
        // -------------------------

        try {
            if(!AppState.supabase) throw new Error("Supabase off");

            const { data, error } = await AppState.supabase.auth.signInWithPassword({ email:e, password:p });
            
            // Si on arrive ici, le serveur a répondu, on annule le timer de force
            clearTimeout(Auth.securityTimer);

            if(error) throw error;
            
            App.start(data.user);

        } catch (err) {
            // Erreur détectée (Mot de passe faux, ou réseau coupé)
            clearTimeout(Auth.securityTimer); // On annule le timer de force
            btn.innerText = originalText;
            
            console.log(err);
            if(err.message === "Invalid login credentials") {
                Auth.err("Mot de passe incorrect");
            } else {
                // Si c'est une erreur technique, on propose le hors ligne
                if(confirm("Erreur de connexion (" + err.message + ").\n\nPasser en mode HORS LIGNE ?")) {
                    App.start({ id: 'offline', email: 'mode@hors-ligne' });
                }
            }
        }
    },

    signup: async () => {
        const e = document.getElementById('emailInput').value;
        const p = document.getElementById('pwdInput').value;
        if(!e || !p) return Auth.err("Remplissez tout");
        
        const btn = document.getElementById('authBtn');
        const originalText = btn.innerText;
        btn.innerText = "Création...";

        // Timer sécurité aussi pour l'inscription
        if(Auth.securityTimer) clearTimeout(Auth.securityTimer);
        Auth.securityTimer = setTimeout(() => {
            alert("Inscription impossible (Serveur injoignable). Réessayez plus tard.");
            btn.innerText = originalText;
        }, 3000);

        try {
            const { error } = await AppState.supabase.auth.signUp({ email:e, password:p });
            clearTimeout(Auth.securityTimer);
            
            if(error) throw error;
            
            Auth.err("Compte créé ! Connectez-vous.", "#34C759");
            setTimeout(() => {
                Auth.toggleMode();
                document.getElementById('emailInput').value = e;
                btn.innerText = "CONNEXION";
            }, 1500);

        } catch (err) {
            clearTimeout(Auth.securityTimer);
            btn.innerText = originalText;
            Auth.err(err.message);
        }
    },

    logout: async () => {
        if(AppState.supabase) await AppState.supabase.auth.signOut();
        location.reload();
    },

    err: (msg, color='#ff6b6b') => {
        const m = document.getElementById('msg');
        if(m) { m.style.color = color; m.innerText = msg; }
        else alert(msg);
    }
};
