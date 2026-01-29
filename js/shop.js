const Shop = {
    render: () => {
        const grid = document.getElementById('shopGrid');
        grid.innerHTML = '';
        
        Config.items.forEach(item => {
            const owned = (AppState.profile.items || []).includes(item.id);
            const active = AppState.activeFeatures[item.id];
            
            const card = document.createElement('div');
            card.className = `shop-card ${active ? 'active-item' : ''}`;
            card.innerHTML = `
                <div style="font-size:32px;">${item.icon}</div>
                <div style="font-size:12px; font-weight:700;">${item.name}</div>
                <div style="color:${owned ? 'green' : 'var(--accent)'}; font-size:10px;">
                    ${owned ? (active ? 'ACTIVÉ' : 'ACQUIS') : item.cost + ' XP'}
                </div>
            `;
            card.onclick = () => Shop.handle(item.id);
            grid.appendChild(card);
        });
    },
    handle: async (id) => {
        const item = Config.items.find(i => i.id === id);
        const owned = (AppState.profile.items || []).includes(id);
        
        if(!owned) {
            if(AppState.profile.points < item.cost) return alert("Pas assez de XP !");
            if(!confirm(`Acheter ${item.name} ?`)) return;
            
            AppState.profile.points -= item.cost;
            AppState.profile.items = [...(AppState.profile.items || []), id];
            
            await AppState.supabase.from('profiles').update({
                points: AppState.profile.points,
                items: AppState.profile.items
            }).eq('id', AppState.user.id);
        } else {
            // Toggle
            if(AppState.activeFeatures[id]) delete AppState.activeFeatures[id];
            else AppState.activeFeatures[id] = true;
            
            if(item.type === 'map') MapManager.setLayer(id.replace('map_', ''));
        }
        
        Shop.render();
        document.getElementById('displayPoints').innerText = AppState.profile.points;
    }
};
