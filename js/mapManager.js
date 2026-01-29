// Gestion de la carte Leaflet
const MapManager = {
    init: () => {
        if (AppState.map) return;
        
        console.log('🗺️ Initialisation de la carte');
        
        AppState.map = L.map('map', { 
            zoomControl: false, 
            zoomSnap: 0.5,
            wheelDebounceTime: 100,
            maxZoom: 19
        }).setView(Config.defaultLocation, Config.defaultZoom);
        
        // Définir la couche par défaut
        const layerType = AppState.theme === 'dark' ? 'dark' : 'standard';
        MapManager.setLayer(layerType);
        
        // Événement de clic sur la carte
        AppState.map.on('click', MapManager.handleMapClick);
        
        // Démarrer la géolocalisation
        MapManager.locate();
    },
    
    locate: () => {
        if (!AppState.map) return;
        
        AppState.map.locate({
            setView: true, 
            watch: true, 
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 5000
        });
        
        AppState.map.off('locationfound').on('locationfound', MapManager.handleLocationUpdate);
        AppState.map.off('locationerror').on('locationerror', (e) => {
            console.error('Erreur géolocalisation:', e.message);
            alert("Impossible d'accéder à votre position. Vérifiez les autorisations.");
        });
    },
    
    handleLocationUpdate: (e) => {
        AppState.lastLocation = e.latlng;
        
        // Créer ou mettre à jour le marqueur utilisateur
        if (!AppState.userMarker) {
            AppState.userMarker = L.circleMarker(e.latlng, {
                radius: 9,
                color: 'white',
                weight: 3,
                fillColor: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
                fillOpacity: 1
            }).addTo(AppState.map);
        } else {
            AppState.userMarker.setLatLng(e.latlng);
        }
        
        // Mettre à jour la vitesse
        const speed = e.speed ? Math.round(e.speed * 3.6) : 0;
        document.getElementById('navSpeed').innerText = speed + ' km/h';
        
        // Mettre à jour la navigation si active
        if (AppState.navTarget) {
            MapManager.updateNavigation(e.latlng);
        }
    },
    
    updateNavigation: (currentPos) => {
        if (!AppState.navTarget) return;
        
        const targetPos = AppState.navTarget.loc;
        const distance = AppState.map.distance(currentPos, targetPos);
        
        // Afficher la distance
        const distText = distance > 1000 
            ? (distance / 1000).toFixed(1) + ' km' 
            : Math.round(distance) + ' m';
        document.getElementById('navDist').innerText = distText;
        
        // Calculer le cap (bearing)
        const lat1 = currentPos.lat * Math.PI / 180;
        const lat2 = targetPos.lat * Math.PI / 180;
        const dLng = (targetPos.lng - currentPos.lng) * Math.PI / 180;
        
        const y = Math.sin(dLng) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - 
                  Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
        const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
        
        document.getElementById('navBearing').innerText = Math.round(bearing) + '°';
        
        // Récompense si proche (< 50m)
        if (distance < 50 && !AppState.navTarget.rewarded) {
            AppState.navTarget.rewarded = true;
            MapManager.rewardArrival();
        }
    },
    
    rewardArrival: async () => {
        const points = 10;
        AppState.userProfile.points += points;
        
        try {
            await AppState.supabase
                .from('profiles')
                .update({ points: AppState.userProfile.points })
                .eq('id', AppState.currentUser.id);
            
            App.applyUserSettings();
            alert(`🎉 Destination atteinte ! +${points} XP`);
        } catch (error) {
            console.error('Erreur récompense:', error);
        }
    },
    
    handleMapClick: (e) => {
        const popup = L.popup()
            .setLatLng(e.latlng)
            .setContent(`
                <div style="text-align:center; padding:5px;">
                    <b>Lieu sélectionné</b><br><br>
                    <button class="buy-btn" onclick="MapManager.addFavorite(${e.latlng.lat}, ${e.latlng.lng})">
                        ⭐ Ajouter aux favoris
                    </button>
                    <button class="buy-btn" style="background:var(--accent); margin-top:5px;" 
                            onclick="MapManager.startNavigation(${e.latlng.lat}, ${e.latlng.lng}, 'Point Repère')">
                        🧭 Y aller
                    </button>
                </div>
            `)
            .openOn(AppState.map);
    },
    
    search: (query) => {
        clearTimeout(AppState.searchTimer);
        
        AppState.searchTimer = setTimeout(async () => {
            if (query.length < 3) {
                document.getElementById('searchResults').style.display = 'none';
                return;
            }
            
            const center = AppState.map.getCenter();
            const viewbox = `${center.lng-0.5},${center.lat+0.5},${center.lng+0.5},${center.lat-0.5}`;
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&viewbox=${viewbox}&bounded=0&addressdetails=1&limit=5`;
            
            try {
                const response = await fetch(url);
                const results = await response.json();
                
                MapManager.displaySearchResults(results);
            } catch (error) {
                console.error('Erreur recherche:', error);
            }
        }, 300);
    },
    
    displaySearchResults: (results) => {
        const container = document.getElementById('searchResults');
        container.innerHTML = '';
        container.style.display = 'block';
        
        if (results.length === 0) {
            container.innerHTML = '<div class="result-item">Aucun résultat</div>';
            return;
        }
        
        results.forEach(place => {
            const name = place.address?.road || 
                        place.address?.pedestrian || 
                        place.display_name.split(',')[0];
            
            const div = document.createElement('div');
            div.className = 'result-item';
            div.innerHTML = `
                <b>${name}</b><br>
                <span style="font-size:12px; opacity:0.6;">${place.display_name}</span>
            `;
            div.onclick = () => {
                MapManager.startNavigation(place.lat, place.lon, name);
                container.style.display = 'none';
                document.getElementById('searchInp').value = '';
            };
            container.appendChild(div);
        });
    },
    
    startNavigation: (lat, lng, name) => {
        AppState.navTarget = { 
            loc: L.latLng(lat, lng), 
            name: name,
            rewarded: false
        };
        
        document.getElementById('navTargetName').innerText = name;
        document.getElementById('navInfoBox').style.display = 'block';
        
        AppState.map.setView([lat, lng], 16);
        UI.close();
        Compass.open();
    },
    
    addFavorite: async (lat, lng) => {
        const name = prompt("Nom du lieu favori ?");
        if (!name || !name.trim()) return;
        
        try {
            const favorites = [...(AppState.userProfile.favorites || []), { 
                name: name.trim(), 
                lat, 
                lng 
            }];
            
            await AppState.supabase
                .from('profiles')
                .update({ favorites })
                .eq('id', AppState.currentUser.id);
            
            AppState.userProfile.favorites = favorites;
            MapManager.renderFavorites();
            AppState.map.closePopup();
            
            alert("✅ Favori ajouté !");
        } catch (error) {
            console.error('Erreur ajout favori:', error);
            alert("Erreur lors de l'ajout du favori");
        }
    },
    
    renderFavorites: () => {
        const container = document.getElementById('favList');
        const favorites = AppState.userProfile.favorites || [];
        
        if (favorites.length === 0) {
            container.innerHTML = '<span style="color:gray;">Aucun favori</span>';
            return;
        }
        
        container.innerHTML = '';
        favorites.forEach((fav, index) => {
            const div = document.createElement('div');
            div.className = 'shop-item';
            div.innerHTML = `
                <div class="shop-info">
                    <span>⭐ ${fav.name}</span>
                </div>
                <div>
                    <button class="buy-btn" onclick="MapManager.startNavigation(${fav.lat}, ${fav.lng}, '${fav.name}')">
                        Aller
                    </button>
                    <button class="buy-btn" style="background:var(--danger); margin-left:5px;" 
                            onclick="MapManager.removeFavorite(${index})">
                        🗑️
                    </button>
                </div>
            `;
            container.appendChild(div);
        });
    },
    
    removeFavorite: async (index) => {
        if (!confirm("Supprimer ce favori ?")) return;
        
        try {
            const favorites = [...AppState.userProfile.favorites];
            favorites.splice(index, 1);
            
            await AppState.supabase
                .from('profiles')
                .update({ favorites })
                .eq('id', AppState.currentUser.id);
            
            AppState.userProfile.favorites = favorites;
            MapManager.renderFavorites();
        } catch (error) {
            console.error('Erreur suppression favori:', error);
        }
    },
    
    setLayer: (type) => {
        const url = Config.mapLayers[type] || Config.mapLayers.standard;
        
        // Supprimer les anciennes couches
        AppState.map.eachLayer(layer => {
            if (layer._url) {
                AppState.map.removeLayer(layer);
            }
        });
        
        // Ajouter la nouvelle couche
        L.tileLayer(url, { 
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(AppState.map);
        
        // Rafraîchir la carte
        setTimeout(() => AppState.map.invalidateSize(), 200);
    },
    
    toggleOverlay: (itemId, isActive) => {
        if (isActive) {
            console.log(`🎨 Activation du widget: ${itemId}`);
            // Ici tu peux ajouter la logique spécifique pour chaque widget
            // Exemple: afficher une couche de trafic, transports, etc.
        }
    }
};
