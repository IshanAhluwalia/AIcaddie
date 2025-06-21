import { useRef, useEffect, useState } from 'react';
import mapboxgl, { GeoJSONSource } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ClubConfig } from './ClubConfig';

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface Club {
  name: string;
  minDistance: number;
  maxDistance: number;
  averageDistance: number;
}

interface Hole {
  number: number;
  name: string;
  geojson: string;
  par: number;
  distance: number;
  tips: string;
}

interface AICaddieProps {
  shots: [number, number][];
  tee: [number, number] | null;
  flag: [number, number] | null;
  hole: Hole;
  playerClubs: Club[];
  mode: 'tee' | 'flag' | 'shot' | null;
  onSetTee: (coords: [number, number]) => void;
  onSetFlag: (coords: [number, number]) => void;
  onAddShot: (coords: [number, number]) => void;
  onSelectHole: (holeIndex: number) => void;
  onResetHole: () => void;
  onSetMode: (mode: 'tee' | 'flag' | 'shot' | null) => void;
  holes: Hole[];
  currentHoleIndex: number;
}

export function AICaddie({
  shots, tee, flag, hole, playerClubs, mode, onSetTee, onSetFlag, onAddShot,
  onSelectHole, onResetHole, onSetMode, holes, currentHoleIndex
}: AICaddieProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [showClubConfig, setShowClubConfig] = useState(false);
  const [menuInteracted, setMenuInteracted] = useState(false);


  // Initialize map
  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;
    if (!MAPBOX_ACCESS_TOKEN) {
      setError('Mapbox access token is not set');
      return;
    }

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-93.621, 42.034],
      zoom: 15
    });

    // Force map to resize after initialization
    map.current.on('load', () => {
      setTimeout(() => {
        map.current?.resize();
      }, 100);
    });
  }, []);

  // Load hole GeoJSON
  useEffect(() => {
    if (!map.current || !hole?.geojson) return;

    const fetchAndDrawHole = () => {
      fetch(hole.geojson)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to fetch GeoJSON: ${res.statusText}`);
          return res.json();
        })
        .then(geojsonData => {
          if (map.current) {
            const source = map.current.getSource('hole') as GeoJSONSource | undefined;
            if (source) {
              source.setData(geojsonData);
            } else {
              map.current.addSource('hole', { type: 'geojson', data: geojsonData });
              map.current.addLayer({
                id: 'hole-outline',
                type: 'line',
                source: 'hole',
                layout: {},
                paint: { 'line-color': '#1976d2', 'line-width': 3 }
              });
            }
            const bounds = new mapboxgl.LngLatBounds();
            geojsonData.features.forEach((feature: any) => {
              if (feature.geometry?.coordinates) {
                feature.geometry.coordinates[0].forEach((coord: [number, number]) => bounds.extend(coord));
              }
            });
            if (!bounds.isEmpty()) {
              map.current.fitBounds(bounds, { padding: 50 });
            }
          }
        })
        .catch(err => {
          setError(`Error loading hole GeoJSON: ${err.message}`);
        });
    };

    if (map.current.isStyleLoaded()) {
      fetchAndDrawHole();
    } else {
      map.current.once('load', fetchAndDrawHole);
    }
  }, [hole?.geojson]);

  // Add markers for tee, flag, and shots
  useEffect(() => {
    if (!map.current) return;

    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    if (tee) new mapboxgl.Marker({ color: '#1976d2' }).setLngLat(tee).setPopup(new mapboxgl.Popup().setText('Tee')).addTo(map.current);
    if (flag) new mapboxgl.Marker({ color: '#43a047' }).setLngLat(flag).setPopup(new mapboxgl.Popup().setText('Flag')).addTo(map.current);
    shots.forEach((shot, index) => {
      new mapboxgl.Marker({ color: '#ff9800' }).setLngLat(shot).setPopup(new mapboxgl.Popup().setText(`Shot ${index + 1}`)).addTo(map.current!);
    });
  }, [tee, flag, shots]);

  // Handle map clicks
  useEffect(() => {
    if (!map.current) return;
    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      if (mode) {
        const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        if (mode === 'tee') onSetTee(coords);
        else if (mode === 'flag') onSetFlag(coords);
        else if (mode === 'shot') onAddShot(coords);
      }
    };
    map.current.on('click', handleClick);
    return () => {
      if (map.current) map.current.off('click', handleClick);
    };
  }, [mode, onSetTee, onSetFlag, onAddShot]);

  // Force map resize when overlay opens/closes
  useEffect(() => {
    if (map.current) {
      const timer = setTimeout(() => {
        map.current?.resize();
      }, 350); // After transition completes
      return () => clearTimeout(timer);
    }
  }, [overlayOpen]);

  const handleSelectHole = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newIdx = parseInt(e.target.value, 10);
    onSelectHole(newIdx);
  };



  if (showClubConfig) {
    return (
      <div className="fullscreen-panel">
        <ClubConfig 
          onSave={() => {
            // Handle saving clubs
            setShowClubConfig(false);
          }} 
          initialClubs={playerClubs}
          onFinish={() => setShowClubConfig(false)}
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Fullscreen Map */}
      <div className="map-container">
        <div ref={mapContainer} className="map" />
        {error && <div className="error-banner">{error}</div>}
      </div>

      {/* Menu Toggle Button */}
      <button 
        className={`menu-toggle ${menuInteracted ? 'interacted' : ''}`}
        onClick={() => {
          setOverlayOpen(!overlayOpen);
          setMenuInteracted(true);
        }}
        aria-label="Toggle menu"
      >
        ⛳
      </button>

      {/* Mode Indicator */}
      {mode && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(25, 118, 210, 0.9)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          zIndex: 1001,
          fontSize: '0.9rem',
          fontWeight: '500'
        }}>
          Tap on the map to place the {mode}
        </div>
      )}

      {/* Mobile Overlay Panel */}
      <div className={`mobile-overlay ${overlayOpen ? 'open' : ''}`}>
        <button 
          className="close-overlay" 
          onClick={() => setOverlayOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button>
        
        <div className="mobile-overlay-content">
          {/* Hole Selection */}
          <div className="section">
            <h3>Select Hole</h3>
            <select value={currentHoleIndex} onChange={handleSelectHole}>
              {holes.map((h, idx) => (
                <option key={h.number} value={idx}>
                  {h.number}: {h.name} ({h.distance} yds, Par {h.par})
                </option>
              ))}
            </select>
          </div>

          {/* Current Hole Info */}
          <div className="section">
            <h3>Hole {hole.number}: {hole.name}</h3>
            <p><strong>Par:</strong> {hole.par}</p>
            <p><strong>Distance:</strong> {hole.distance} yards</p>
            <p><strong>Tips:</strong> {hole.tips}</p>
          </div>

          {/* Scorecard */}
          <div className="section">
            <h3>Scorecard</h3>
            <table className="scorecard-table">
              <thead>
                <tr>
                  <th>Hole</th>
                  <th>Par</th>
                  <th>Shots</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                <tr className="current-hole">
                  <td>{hole.number}</td>
                  <td>{hole.par}</td>
                  <td>{shots.length}</td>
                  <td>{shots.length > 0 ? (shots.length > hole.par ? `+${shots.length - hole.par}` : shots.length === hole.par ? 'E' : `${shots.length - hole.par}`) : '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Shot Controls */}
          <div className="section">
            <h3>Shot Tracking</h3>
            <div className="button-group">
              <button 
                className={`button ${mode === 'tee' ? 'active' : ''}`}
                onClick={() => {
                  onSetMode(mode === 'tee' ? null : 'tee');
                  setOverlayOpen(false);
                }}
              >
                Set Tee
              </button>
              <button 
                className={`button ${mode === 'flag' ? 'active' : ''}`}
                onClick={() => {
                  onSetMode(mode === 'flag' ? null : 'flag');
                  setOverlayOpen(false);
                }}
              >
                Set Flag
              </button>
            </div>
            <button 
              className={`button ${mode === 'shot' ? 'active' : ''}`}
              onClick={() => {
                onSetMode(mode === 'shot' ? null : 'shot');
                setOverlayOpen(false);
              }}
              disabled={!tee || !flag}
            >
              Add Shot
            </button>
            <button className="button danger" onClick={onResetHole}>
              Reset Hole
            </button>
          </div>

          {/* Shot List */}
          <div className="section">
            <h3>Shots ({shots.length})</h3>
            {shots.length === 0 ? (
              <p>No shots yet.</p>
            ) : (
              <ul className="shot-list">
                {shots.map((shot, index) => (
                  <li key={index}>
                    Shot {index + 1}: [{shot[0].toFixed(3)}, {shot[1].toFixed(3)}]
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Settings */}
          <div className="section">
            <h3>Settings</h3>
            <button className="button" onClick={() => setShowClubConfig(true)}>
              Configure Clubs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 