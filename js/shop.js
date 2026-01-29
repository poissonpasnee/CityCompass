const Shop = {
    render: () => {
        const c = document.getElementById('shopList'); c.innerHTML = '';
        Config.items.forEach(i => {
            const owned = (AppState.userProfile.items || []).includes(i.id);
            const active = (AppState.userProfile.active_items || []).includes(i.id);
            let btn = `<button class="buy-btn" onclick="Shop.buy('${i.id}')">${i.price} XP</button>`;
            if(owned) btn = `<label class="toggle-switch"><input type="checkbox" ${active?'checked':''} onchange="Shop.toggle('${i.id}', this.checked)"><span class="slider"></span></label>`;
            const d = document.createElement('div'); d.className = 'shop-item';
            d.innerHTML = `<div class="shop-info"><div class="shop-icon" style="background:${i.val||'#eee'}">${i.icon}</div><div><b>${i.name}</b><br><span style="font-size:12px;">${i.type}</span></div></div>${btn}`;
            c.appendChild(d);
        });
    },
    buy: async (id) => {
        const i = Config.items.find(x => x.id === id);
        if(AppState.userProfile.points < i.price) return alert("Pas assez de points !");
        if(confirm(`Acheter ${i.name}?`)) {
            AppState.userProfile.points -= i.price;
            AppState.userProfile.items = [...(AppState.userProfile.items || []), id];
            await AppState.supabase.from('profiles').update({ points: AppState.userProfile.points, items: AppState.userProfile.items }).eq('id', AppState.currentUser.id);
            App.applySettings(); Shop.render();
        }
    },
    toggle: async (id, on) => {
        let acts = AppState.userProfile.active_items || [];
        if(on) acts.push(id); else acts = acts.filter(x => x !== id);
        AppState.userProfile.active_items = acts;
        await AppState.supabase.from('profiles').update({ active_items: acts }).eq('id', AppState.currentUser.id);
        const item = Config.items.find(i => i.id === id);
        if(item.type === 'theme' && on) { document.documentElement.style.setProperty('--accent', item.val); AppState.userProfile.color = item.val; await AppState.supabase.from('profiles').update({color: item.val}).eq('id', AppState.currentUser.id); }
    }
};
