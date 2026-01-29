// js/admin.js
const Admin = {
    init: async (user) => {
        if(!user.is_admin) return;
        document.getElementById('admin-panel').style.display = 'block';
        Admin.loadUsers();
    },

    loadUsers: async () => {
        const { data: users } = await supabase.from('profiles').select('*').order('created_at', {ascending:false});
        const list = document.getElementById('admin-user-list');
        list.innerHTML = '';
        
        users.forEach(u => {
            const div = document.createElement('div');
            div.className = 'admin-user-row';
            div.innerHTML = `
                <div>${u.email} <br> <small>${u.points} pts</small></div>
                <div class="admin-actions">
                    <button onclick="Admin.act('${u.id}', 'pts', 50)">+50</button>
                    <button onclick="Admin.act('${u.id}', 'ban', ${!u.is_banned})" style="color:${u.is_banned?'lime':'red'}">${u.is_banned?'Déb':'Ban'}</button>
                    <button onclick="Admin.act('${u.id}', 'admin', ${!u.is_admin})">${u.is_admin?'▼':'▲'}</button>
                </div>
            `;
            list.appendChild(div);
        });
    },

    act: async (uid, action, val) => {
        let update = {};
        if(action === 'pts') {
            const { data } = await supabase.from('profiles').select('points').eq('id', uid).single();
            update = { points: (data.points||0) + val };
        }
        if(action === 'ban') update = { is_banned: val };
        if(action === 'admin') update = { is_admin: val };

        await supabase.from('profiles').update(update).eq('id', uid);
        Admin.loadUsers();
    },

    broadcast: async () => {
        const msg = prompt("Message à tous :");
        if(msg) alert("Message envoyé ! (Simulation)"); // À connecter à une table 'notifications' si besoin
    },
    
    addRec: async () => {
        // Ajoute un point favori global
        const name = prompt("Nom du lieu :");
        if(name && window.currentPos) {
            await supabase.from('recommendations').insert([{
                name: name,
                lat: window.currentPos.latitude,
                lng: window.currentPos.longitude
            }]);
            alert("Lieu ajouté aux recommandations !");
        } else {
            alert("Impossible : Position inconnue");
        }
    }
};
