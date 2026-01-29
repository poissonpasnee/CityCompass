// Gestion de l'authentification
const Auth = {
    login: async () => {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            return UI.showMessage("Veuillez remplir tous les champs.");
        }
        
        UI.showMessage("Connexion en cours...");
        
        try {
            const { data, error } = await AppState.supabase.auth.signInWithPassword({ 
                email, 
                password 
            });
            
            if (error) throw error;
            
            await App.start(data.user);
        } catch (error) {
            console.error('Erreur login:', error);
            UI.showMessage(error.message);
        }
    },
    
    signup: async () => {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            return UI.showMessage("Veuillez remplir tous les champs.");
        }
        
        if (password.length < 6) {
            return UI.showMessage("Le mot de passe doit contenir au moins 6 caractères.");
        }
        
        UI.showMessage("Création du compte...");
        
        try {
            const { data, error } = await AppState.supabase.auth.signUp({ 
                email, 
                password 
            });
            
            if (error) throw error;
            
            if (data.session) {
                await App.start(data.user);
            } else {
                UI.showMessage("Compte créé ! Vérifiez votre email.");
            }
        } catch (error) {
            console.error('Erreur signup:', error);
            UI.showMessage(error.message);
        }
    },
    
    logout: async () => {
        if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
            try {
                await AppState.supabase.auth.signOut();
                location.reload();
            } catch (error) {
                console.error('Erreur logout:', error);
                alert("Erreur lors de la déconnexion");
            }
        }
    }
};
