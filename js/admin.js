const Admin = {
    usersCache: [],

    init: async () => {
        document.getElementById('userList').innerHTML = 'Chargement...';
        
        // Récupérer TOUS les profils
        const { data, error } = await AppState.supabase.from('profiles').select('*');
        if(error) return alert("Erreur chargement users");
        
        Admin.usersCache = data;
        document.getElementById('userCount').innerText = data.length;
        Admin.renderUsers(data);
    },

    renderUsers: (list) => {
        const container = document.getElementById('userList');
        container.innerHTML = '';
        
        list.forEach(u => {
            const div = document.createElement('div');
            div.className = 'user-row';
            div.innerHTML = `
                <div>
                    <div style="font-weight:bold; color:${u.is_admin ? 'gold' : 'white'}">${u.id.substring(0,8)}...</div>
                    <div style="font-size:10px; opacity:0.6;">Points: ${u.points}</div>
                </div>
                <div class="user-actions">
                    <button onclick="Admin.modPoints('${u.id}', 100)" style="background:green;">+100</button>
                    <button onclick="Admin.modPoints('${u.id}', -100)" style="background:orange;">-100</button>
                    <button onclick="Admin.toggleAdmin('${u.id}', ${!u.is_admin})" style="background:#333;">${u.is_admin ? '▼' : '▲'}</button>
                    <button onclick="Admin.banUser('${u.id}')" style="background:red;">BAN</button>
                </div>
            `;
            container.appendChild(div);
        });
    },

    filterUsers: (txt) => {
        const filtered = Admin.usersCache.filter(u => u.id.includes(txt));
        Admin.renderUsers(filtered);
    },

    modPoints: async (uid, amount) => {
        // Obtenir points actuels
        const user = Admin.usersCache.find(u => u.id === uid);
        const newPts = (user.points || 0) + amount;
        
        await AppState.supabase.from('profiles').update({ points: newPts }).eq('id', uid);
        alert("Points mis à jour !");
        Admin.init(); // Refresh
    },

    toggleAdmin: async (uid, state) => {
        if(confirm(`Passer cet utilisateur ${state ? 'ADMIN' : 'USER'} ?`)) {
            await AppState.supabase.from('profiles').update({ is_admin: state }).eq('id', uid);
            Admin.init();
        }
    },

    banUser: async (uid) => {
        if(confirm("Bannir définitivement ?")) {
             // Supprime le profil ou marque 'banned:true' si colonne existe
             await AppState.supabase.from('profiles').delete().eq('id', uid);
             alert("Utilisateur effacé de la DB");
             Admin.init();
        }
    },

    broadcast: () => {
        const msg = prompt("Message global :");
        if(msg) {
            // Dans une vraie app, on écrirait dans une table 'messages' écoutée par tous
            alert("Simulation: Message envoyé aux " + Admin.usersCache.length + " utilisateurs.");
        }
    },

    addReco: async () => {
        const name = prompt("Nom du lieu :");
        const lat = prompt("Latitude :");
        const lng = prompt("Longitude :");
        
        if(name && lat && lng) {
            // Ajouter aux favoris de TOUT LE MONDE (bourrin mais efficace pour la demande)
            // Note: En prod, on ferait une table 'recommendations' séparée
            alert("Lieu ajouté aux recommandations (simulé)");
        }
    }
};

// Hook auto-load
const _oldShow = UI.show;
UI.show = (v) => { _oldShow(v); if(v==='viewAdmin') Admin.init(); };
