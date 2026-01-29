const Admin = {
    // Charge les stats quand on ouvre le panneau
    init: async () => {
        const { count } = await AppState.supabase.from('profiles').select('*', { count: 'exact', head: true });
        document.getElementById('adminUserCount').innerText = count;
    },

    givePoints: async () => {
        const amount = 500;
        AppState.profile.points += amount;
        await AppState.supabase.from('profiles').update({ points: AppState.profile.points }).eq('id', AppState.user.id);
        document.getElementById('displayPoints').innerText = AppState.profile.points + " XP";
        alert("500 XP ajoutés à votre compte !");
    },

    broadcast: async () => {
        const msg = prompt("Message à envoyer à tous :");
        if(msg) {
            // Ici, tu pourrais écrire dans une table 'system_messages'
            // Pour l'instant, on simule
            alert("Message envoyé : " + msg);
        }
    }
};

// On hook l'init de l'admin sur l'ouverture de la vue
const originalShow = UI.show;
UI.show = (viewId) => {
    originalShow(viewId);
    if(viewId === 'viewAdmin') Admin.init();
};
