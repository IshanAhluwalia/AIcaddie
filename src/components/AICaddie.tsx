import { useRef, useLayoutEffect, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

console.log('DEBUG: Mapbox token from env:', import.meta.env.VITE_MAPBOX_ACCESS_TOKEN);

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
console.log('Mapbox token:', MAPBOX_ACCESS_TOKEN); // Debug: print token

interface TargetArea {
  type: 'fairway' | 'green' | 'approach';
  coordinates: [number, number];
  radius: number;
  description: string;
}

interface Club {
  name: string;
  minDistance: number;
  maxDistance: number;
  averageDistance: number;
}

interface AICaddieProps {
  shots: [number, number][];
  tee: [number, number] | null;
  flag: [number, number] | null;
  hole: {
    geojson: string;
    number: number;
    name: string;
    par: number;
    distance: number;
    tips: string;
  };
  onAddTargetArea: (target: TargetArea) => void;
  playerClubs: Club[];
  mode: 'tee' | 'flag' | 'shot' | null;
  onSetTee: (coords: [number, number]) => void;
  onSetFlag: (coords: [number, number]) => void;
  onAddShot: (coords: [number, number]) => void;
}

function getClubSuggestion(distance: number, clubs: Club[]): Club | null {
  // Suggest the club with the closest average distance >= distance
  let best: Club | null = null;
  let minDiff = Infinity;
  for (const club of clubs) {
    const diff = club.averageDistance - distance;
    if (diff >= 0 && diff < minDiff) {
      minDiff = diff;
      best = club;
    }
  }
  // If no club is long enough, return the longest
  if (!best && clubs.length > 0) {
    best = clubs.reduce((a, b) => (a.averageDistance > b.averageDistance ? a : b));
  }
  return best;
}

function getDistance(a: [number, number], b: [number, number]) {
  const toRad = (d: number) => d * Math.PI / 180;
  const R = 6371000;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const aVal = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
  return (R * c) * 1.09361; // meters to yards
}

export function AICaddie({
  shots, tee, flag, hole, onAddTargetArea,
  playerClubs, mode, onSetTee, onSetFlag, onAddShot
}: AICaddieProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ type: 'user' | 'ai', content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [shotNotes, setShotNotes] = useState<{ [key: number]: string }>({});

  // Map initialization and GeoJSON
  useLayoutEffect(() => {
    if (!mapContainer.current) return;
    if (!MAPBOX_ACCESS_TOKEN) {
      setError('Mapbox access token is not set');
      return;
    }
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-122.4194, 37.7749],
      zoom: 15
    });
    map.current.on('load', () => {
      if (hole && hole.geojson) {
        fetch(hole.geojson)
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch GeoJSON');
            return res.json();
          })
          .then(geojsonData => {
            map.current!.addSource('hole', {
              type: 'geojson',
              data: geojsonData
            });
            map.current!.addLayer({
              id: 'hole-outline',
              type: 'line',
              source: 'hole',
              layout: {},
              paint: {
                'line-color': '#1976d2',
                'line-width': 3
              }
            });
            const bounds = new mapboxgl.LngLatBounds();
            geojsonData.features.forEach((feature: any) => {
              feature.geometry.coordinates[0].forEach((coord: [number, number]) => bounds.extend(coord));
            });
            map.current!.fitBounds(bounds, { padding: 50 });
          })
          .catch(err => {
            setError('Error loading hole GeoJSON');
            console.error('GeoJSON fetch error:', err);
          });
      }
    });
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [hole.geojson]);

  // Add markers for tee, flag, and shots
  useEffect(() => {
    if (!map.current) return;
    const markers = document.getElementsByClassName('mapboxgl-marker');
    while (markers[0]) {
      markers[0].remove();
    }
    if (tee) {
      new mapboxgl.Marker({ color: '#1976d2' })
        .setLngLat(tee)
        .setPopup(new mapboxgl.Popup().setText('Tee'))
        .addTo(map.current);
    }
    if (flag) {
      new mapboxgl.Marker({ color: '#43a047' })
        .setLngLat(flag)
        .setPopup(new mapboxgl.Popup().setText('Flag'))
        .addTo(map.current);
    }
    shots.forEach((shot, index) => {
      new mapboxgl.Marker({ color: '#ff9800' })
        .setLngLat(shot)
        .setPopup(new mapboxgl.Popup().setText(`Shot ${index + 1}`))
        .addTo(map.current!);
    });
  }, [tee, flag, shots]);

  // Handle map click for setting tee, flag, or shots
  useEffect(() => {
    if (!map.current) return;
    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      if (mode === 'tee') {
        onSetTee([e.lngLat.lng, e.lngLat.lat]);
      } else if (mode === 'flag') {
        onSetFlag([e.lngLat.lng, e.lngLat.lat]);
      } else if (mode === 'shot') {
        onAddShot([e.lngLat.lng, e.lngLat.lat]);
      }
    };
    map.current.on('click', handleClick);
    return () => {
      if (map.current) map.current.off('click', handleClick);
    };
  }, [mode, onSetTee, onSetFlag, onAddShot]);

  // AI Caddie Chat Logic
  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { type: 'user', content: chatInput }]);
    // Simulate AI response with golf logic
    setTimeout(() => {
      let aiMsg = '';
      if (chatInput.toLowerCase().includes('club')) {
        if (tee && flag) {
          const dist = Math.round(getDistance(tee, flag));
          const club = getClubSuggestion(dist, playerClubs);
          aiMsg = club ? `For ${dist} yards, I recommend your ${club.name} (avg: ${club.averageDistance} yds).` : 'Please configure your clubs.';
        } else {
          aiMsg = 'Set your tee and flag to get a club suggestion!';
        }
      } else if (chatInput.toLowerCase().includes('target')) {
        if (tee && flag) {
          const dist = Math.round(getDistance(tee, flag));
          const club = getClubSuggestion(dist, playerClubs);
          if (club) {
            const target: TargetArea = {
              type: 'fairway',
              coordinates: tee,
              radius: 30,
              description: `Target area for ${club.name}`
            };
            onAddTargetArea(target);
            aiMsg = `I've marked a target area for your ${club.name}.`;
          } else {
            aiMsg = 'Please configure your clubs.';
          }
        } else {
          aiMsg = 'Set your tee and flag to get a target area!';
        }
      } else {
        aiMsg = 'Ask me about club suggestions, targets, or tips!';
      }
      setChatMessages(prev => [...prev, { type: 'ai', content: aiMsg }]);
    }, 500);
    setChatInput('');
  };

  // Shot notes
  const handleNoteChange = (idx: number, note: string) => {
    setShotNotes(prev => ({ ...prev, [idx]: note }));
  };

  return (
    <div style={{ width: '100%', height: '500px', background: '#eee', border: '1px solid #ccc', position: 'relative' }}>
      <div
        ref={mapContainer}
        style={{
          width: '100%',
          height: '100%',
          background: '#eee',
          border: '1px solid #ccc'
        }}
      />
      {error && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          padding: '10px',
          backgroundColor: 'rgba(255, 0, 0, 0.8)',
          color: 'white',
          borderRadius: '4px',
          zIndex: 1000
        }}>
          {error}
        </div>
      )}
      {/* Shot info and notes */}
      <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 1001, background: 'white', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', padding: 16, minWidth: 250 }}>
        <h4 style={{ margin: 0, marginBottom: 8 }}>Shots</h4>
        {shots.length === 0 && <div>No shots yet.</div>}
        {shots.map((shot, idx) => (
          <div key={idx} style={{ marginBottom: 8 }}>
            <div>Shot {idx + 1}: {shot[0].toFixed(5)}, {shot[1].toFixed(5)}</div>
            {tee && <div style={{ fontSize: 12, color: '#666' }}>From tee: {Math.round(getDistance(tee, shot))} yds</div>}
            {flag && <div style={{ fontSize: 12, color: '#666' }}>To flag: {Math.round(getDistance(shot, flag))} yds</div>}
            <input
              type="text"
              value={shotNotes[idx] || ''}
              onChange={e => handleNoteChange(idx, e.target.value)}
              placeholder="Add note..."
              style={{ width: '100%', fontSize: 12, marginTop: 4, padding: 4 }}
            />
          </div>
        ))}
      </div>
      {/* AI Caddie Chat Popup */}
      <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 1001 }}>
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            style={{
              padding: '12px 24px',
              background: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <span>AI Caddie</span>
            <span style={{ fontSize: '1.2em' }}>💬</span>
          </button>
        ) : (
          <div style={{ width: 350, height: 400, background: 'white', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 16, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>AI Caddie</h3>
              <button
                onClick={() => setIsChatOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2em' }}
              >
                ✕
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    padding: '8px 12px',
                    background: msg.type === 'user' ? '#1976d2' : '#f5f5f5',
                    color: msg.type === 'user' ? 'white' : 'black',
                    borderRadius: 12,
                    fontSize: '0.9em'
                  }}
                >
                  {msg.content}
                </div>
              ))}
            </div>
            <div style={{ padding: 16, borderTop: '1px solid #eee', display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendChat()}
                placeholder="Ask your AI caddie..."
                style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: '0.9em' }}
              />
              <button
                onClick={handleSendChat}
                style={{ padding: '8px 16px', background: '#1976d2', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 