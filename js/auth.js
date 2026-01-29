const Auth = {
    login: async () => {
        const e = document.getElementById('email').value;
        const p = document.getElementById('password').value;
        const { error } = await supabase.auth.signInWithPassword({email:e, password:p});
        if(error) document.getElementById('auth-msg').innerText = error.message;
        else location.reload();
    },
    signup: async () => {
        const e = document.getElementById('email').value;
        const p = document.getElementById('password').value;
        const { error } = await supabase.auth.signUp({email:e, password:p});
        if(error) document.getElementById('auth-msg').innerText = error.message;
        else alert("Vérifie tes emails !");
    },
    logout: async () => {
        await supabase.auth.signOut();
        location.reload();
    }
};
