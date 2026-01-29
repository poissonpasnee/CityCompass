const Auth = {
    isSignup: false,

    toggleMode: () => {
        Auth.isSignup = !Auth.isSignup;
        const title = document.getElementById('authTitle');
        const btn = document.getElementById('authBtn');
        const switchText = document.getElementById('switchText');
        
        // Reset message et état bouton
        if(document.getElementById('msg')) document.getElementById('msg').innerText = "";
        btn.disabled = false;
        
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
        if(btn.disabled || btn.innerText.includes("...")) return;
        
        if(Auth.isSignup) Auth.signup();
        else Auth.login();
    },

    login: async () => {
        const e = document.getElementById('emailInput').value;
        const p = document.getElementById('pwdInput').value;
        const btn = document.getElementById('authBtn');
        const oldText = btn.innerText;

        // 1. Backdoor Admin immédiate (pas de réseau nécessaire)
        if(e === 'admin' && p === 'admin') {
            App.start({ id: 'admin-local', email: 'admin@local.com' });
            return;
        }

        if(!e || !p) return Auth.err("Remplissez tout");
        
        // 2. Blocage UI
        btn.innerText = "Chargement...";
        btn.disabled = true;
        
        try {
            if(!AppState.supabase) throw new Error("Erreur interne (Supabase manquant)");

            // 3. TENTATIVE DE CONNEXION AVEC TIMEOUT DE 4 SECONDES
            // Si Supabase ne répond pas en 4s, on déclenche une erreur
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Timeout")), 4000)
            );
            
            const supabasePromise = AppState.supabase.auth.signInWithPassword({ email:e, password:p });

            // Course entre la connexion et le chrono
            const { data, error } = await Promise.race([supabasePromise, timeoutPromise]);
            
            if(error) throw error;
            
            // Succès
            App.start(data.user);

        } catch (err) {
            console.error(err);
            btn.innerText = oldText;
            btn.disabled = false;
            
            // 4. Gestion des erreurs (Timeout ou Réseau)
            if(err.message === "Timeout" || err.message.includes("Load failed") || err.message.includes("fetch")) {
                if(confirm("Le serveur ne répond pas.\n\nVoulez-vous entrer en mode HORS LIGNE ?")) {
                    App.start({ id: 'offline', email: 'mode@hors-ligne.com' });
                } else {
                    Auth.err("Connexion échouée. Vérifiez votre réseau.");
                }
            } else if (err.message === "Invalid login credentials") {
                Auth.err("Email ou mot de passe incorrect");
            } else {
                Auth.err(err.message);
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
        btn.disabled = true;

        try {
            const { error } = await AppState.supabase.auth.signUp({ email:e, password:p });
            if(error) throw error;
            
            Auth.err("Compte créé ! Connectez-vous.", "#34C759");
            setTimeout(() => {
                Auth.toggleMode();
                document.getElementById('emailInput').value = e;
            }, 1500);

        } catch (err) {
            btn.innerText = oldText;
            btn.disabled = false;
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
