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
        if(btn.innerText.includes("...")) return; // Empêche le double clic
        
        if(Auth.isSignup) Auth.signup();
        else Auth.login();
    },

    login: async () => {
        const e = document.getElementById('emailInput').value;
        const p = document.getElementById('pwdInput').value;
        const btn = document.getElementById('authBtn');
        const originalText = btn.innerText;

        if(!e || !p) return Auth.err("Veuillez remplir tous les champs");
        
        btn.innerText = "Connexion...";
        
        try {
            // Appel standard à Supabase
            const { data, error } = await AppState.supabase.auth.signInWithPassword({ email:e, password:p });
            
            if(error) throw error;
            
            // Si succès, on lance l'app
            App.start(data.user);

        } catch (err) {
            console.error("Login Error:", err);
            btn.innerText = originalText;
            
            if(err.message === "Invalid login credentials") {
                Auth.err("Email ou mot de passe incorrect");
            } else if (err.message.includes("fetch")) {
                Auth.err("Erreur réseau. Vérifiez votre connexion.");
            } else {
                Auth.err(err.message);
            }
        }
    },

    signup: async () => {
        const e = document.getElementById('emailInput').value;
        const p = document.getElementById('pwdInput').value;
        const btn = document.getElementById('authBtn');
        const originalText = btn.innerText;
        
        if(!e || !p) return Auth.err("Veuillez remplir tous les champs");
        if(p.length < 6) return Auth.err("Le mot de passe doit faire 6 caractères min.");
        
        btn.innerText = "Inscription...";

        try {
            const { data, error } = await AppState.supabase.auth.signUp({ email:e, password:p });
            
            if(error) throw error;
            
            Auth.err("Compte créé ! Vous pouvez vous connecter.", "#34C759"); // Vert
            
            // Basculer automatiquement vers l'écran de connexion après 1.5s
            setTimeout(() => {
                Auth.toggleMode();
                document.getElementById('emailInput').value = e;
                btn.innerText = "CONNEXION";
            }, 1500);

        } catch (err) {
            console.error("Signup Error:", err);
            btn.innerText = originalText;
            Auth.err(err.message);
        }
    },

    logout: async () => {
        await AppState.supabase.auth.signOut();
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
