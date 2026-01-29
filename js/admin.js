// js/admin.js
const Admin = {
    init: async () => {
        const user = AppState.user;
        if (!user || !user.is_admin) {
            document.getElementById('admin-panel').innerHTML = "<p>Accès refusé.</p>";
            return;
        }
        Admin.loadUsers();
    },

    loadUsers: async () => {
        const {  users, error } = await AppState.supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if(error) return alert("Erreur chargement utilisateurs");

        const list = document.getElementById('admin-user-list');
        list.innerHTML = '';

        users.forEach(u => {
            const div = document.createElement('div');
            div.className = 'admin-user-row';
            div.innerHTML = `
                <span>${u.email} (${u.points} pts) ${u.is_banned ? '🚫' : ''} ${u.is_admin ? '👑' : ''}</span>
                <div class="admin-actions">
                    <button onclick="Admin.modPoints('${u.id}', 100)">+100</button>
                    <button onclick="Admin.modPoints('${u.id}', -100)">-100</button>
                    <button onclick="Admin.toggleBan('${u.id}', ${!u.is_banned})">${u.is_banned ? 'Débannir' : 'Bannir'}</button>
                    <button onclick="Admin.toggleAdmin('${u.id}', ${!u.is_admin})">${u.is_admin ? 'Retirer Admin' : 'Mettre Admin'}</button>
                </div>
            `;
            list.appendChild(div);
        });
    },

    modPoints: async (uid, amount) => {
        // Note: Idéalement faire une procédure RPC SQL, mais ici on fait simple
        const {  u } = await AppState.supabase.from('profiles').select('points').eq('id', uid).single();
        const newPoints = (u.points || 0) + amount;
        await AppState.supabase.from('profiles').update({ points: newPoints }).eq('id', uid);
        Admin.loadUsers();
    },

    toggleBan: async (uid, status) => {
        await AppState.supabase.from('profiles').update({ is_banned: status }).eq('id', uid);
        Admin.loadUsers();
    },

    toggleAdmin: async (uid, status) => {
        await AppState.supabase.from('profiles').update({ is_admin: status }).eq('id', uid);
        Admin.loadUsers();
    },

    broadcastMessage: async () => {
        const msg = prompt("Message à envoyer à TOUS les utilisateurs :");
        if(!msg) return;
        
        // On suppose une table 'messages' : id, content, created_at
        const { error } = await AppState.supabase.from('messages').insert([{ content: msg }]);
        if(error) alert("Erreur envoi"); else alert("Message envoyé !");
    },

    addRecommendation: async () => {
        const name = prompt("Nom du lieu recommandé :");
        const lat = prompt("Latitude :");
        const lng = prompt("Longitude :");
        if(!name || !lat) return;

        // Table 'recommendations'
        const { error } = await AppState.supabase.from('recommendations').insert([{ name, lat: parseFloat(lat), lng: parseFloat(lng) }]);
        if(!error) alert("Lieu recommandé ajouté ! Il apparaîtra chez tout le monde.");
    }
};
