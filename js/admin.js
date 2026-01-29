const Admin = {
    modPoints: async (am) => {
        AppState.userProfile.points += am;
        await AppState.supabase.from('profiles').update({ points: AppState.userProfile.points }).eq('id', AppState.currentUser.id);
        App.applySettings(); alert("Points mis à jour");
    },
    addPublicPlace: async () => {
        const n = prompt("Nom ?");
        if(n && AppState.lastLocation) await AppState.supabase.from('places').insert({ name: n, lat: AppState.lastLocation.lat, lng: AppState.lastLocation.lng, type: 'admin_pick' });
    }
};
