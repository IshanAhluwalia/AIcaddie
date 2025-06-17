import { useState } from 'react';
import { AICaddie } from './components/AICaddie';
import { ClubConfig } from './components/ClubConfig';
import { WelcomeScreen } from './components/WelcomeScreen';

const holes = [
  {
    number: 1,
    name: 'Hole 1',
    geojson: '/hole1.geojson',
    par: 4,
    distance: 410,
    tips: 'Avoid the bunker on the right.'
  },
  {
    number: 2,
    name: 'Hole 2',
    geojson: '/hole2.geojson',
    par: 3,
    distance: 180,
    tips: 'Watch for the water hazard on the left.'
  },
  {
    number: 3,
    name: 'Hole 3',
    geojson: '/hole3.geojson',
    par: 5,
    distance: 520,
    tips: 'Long par 5, keep it in the fairway.'
  },
  {
    number: 4,
    name: 'Hole 4',
    geojson: '/hole4.geojson',
    par: 4,
    distance: 390,
    tips: 'Dogleg left, favor the right side off the tee.'
  },
  {
    number: 5,
    name: 'Hole 5',
    geojson: '/hole5.geojson',
    par: 4,
    distance: 420,
    tips: 'Narrow fairway, accuracy is key off the tee.'
  },
  {
    number: 6,
    name: 'Hole 6',
    geojson: '/hole6.geojson',
    par: 3,
    distance: 175,
    tips: 'Short par 3, watch for the bunkers around the green.'
  }
];

function App() {
  const [selectedHoleIdx, setSelectedHoleIdx] = useState(0);
  const [tee, setTee] = useState<[number, number] | null>(null);
  const [flag, setFlag] = useState<[number, number] | null>(null);
  const [shots, setShots] = useState<[number, number][]>([]);
  const [mode, setMode] = useState<'tee' | 'flag' | 'shot' | null>(null);
  const [holeFinished, setHoleFinished] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerClubs, setPlayerClubs] = useState<any[]>([]);
  const [showClubConfig, setShowClubConfig] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handlers
  const handleAddTargetArea = () => {};
  const resetAll = () => {
    setTee(null);
    setFlag(null);
    setShots([]);
    setMode(null);
    setHoleFinished(false);
  };

  if (!gameStarted) {
    return <WelcomeScreen onStart={() => setGameStarted(true)} />;
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', position: 'relative' }}>
      {/* Hamburger menu for mobile */}
      <button
        className="sidebar-toggle"
        style={{ display: 'none' }}
        aria-label="Open sidebar"
        onClick={() => setSidebarOpen(true)}
      >
        &#9776;
      </button>
      {/* Sidebar and UI */}
      <div
        className={`sidebar${sidebarOpen ? ' open' : ''}`}
        style={{ width: 300, padding: 20, backgroundColor: '#f5f5f5', overflowY: 'auto' }}
        onClick={() => setSidebarOpen(false)}
      >
        <h1 style={{ marginBottom: 20 }}>AI Caddie</h1>
        <button
          onClick={() => setShowClubConfig(!showClubConfig)}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '20px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showClubConfig ? 'Hide Club Config' : 'Configure Clubs'}
        </button>
        {showClubConfig && (
          <ClubConfig
            onSave={(clubs) => {
              setPlayerClubs(clubs);
              setShowClubConfig(false);
              localStorage.setItem('playerClubs', JSON.stringify(clubs));
            }}
            initialClubs={playerClubs}
          />
        )}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 5 }}>Select Hole:</label>
          <select
            value={selectedHoleIdx}
            onChange={(e) => setSelectedHoleIdx(parseInt(e.target.value))}
            style={{ width: '100%', padding: 8 }}
          >
            {holes.map((hole, idx) => (
              <option key={idx} value={idx}>
                Hole {hole.number} - {hole.name} (Par {hole.par})
              </option>
            ))}
          </select>
        </div>
        <h2 style={{ marginTop: 0, marginBottom: 16 }}>Scorecard</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
          <thead>
            <tr style={{ background: '#e0e0e0' }}>
              <th style={{ padding: 6, borderRadius: 4 }}>Hole</th>
              <th style={{ padding: 6, borderRadius: 4 }}>Par</th>
              <th style={{ padding: 6, borderRadius: 4 }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {holes.map((h, idx) => (
              <tr key={h.number} style={{ background: idx === selectedHoleIdx ? '#c8e6c9' : 'transparent', fontWeight: idx === selectedHoleIdx ? 600 : 400 }}>
                <td style={{ padding: 6 }}>{h.number}</td>
                <td style={{ padding: 6 }}>{h.par}</td>
                <td style={{ padding: 6 }}>-</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Main Panel */}
      <div className="main-panel" style={{ flex: 1, position: 'relative' }}>
        <div style={{
          position: 'absolute', top: 20, left: 20, zIndex: 10, background: 'white', padding: 16, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <h2 style={{ margin: 0 }}>{holes[selectedHoleIdx].name}</h2>
          <div>Par: {holes[selectedHoleIdx].par}</div>
          <div>Distance: {holes[selectedHoleIdx].distance} yards</div>
          <div>Tips: {holes[selectedHoleIdx].tips}</div>
          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => setMode('tee')}
              style={{
                marginRight: 8,
                background: mode === 'tee' ? '#1976d2' : '#eee',
                color: mode === 'tee' ? 'white' : 'black',
                border: 'none',
                borderRadius: 4,
                padding: '6px 12px',
                cursor: 'pointer'
              }}
              disabled={holeFinished}
            >
              Set Tee
            </button>
            <button
              onClick={() => setMode('flag')}
              style={{
                marginRight: 8,
                background: mode === 'flag' ? '#43a047' : '#eee',
                color: mode === 'flag' ? 'white' : 'black',
                border: 'none',
                borderRadius: 4,
                padding: '6px 12px',
                cursor: 'pointer'
              }}
              disabled={holeFinished}
            >
              Set Flag
            </button>
            <button
              onClick={() => setMode(mode === 'shot' ? null : 'shot')}
              style={{
                marginRight: 8,
                background: mode === 'shot' ? '#ff9800' : '#eee',
                color: mode === 'shot' ? 'white' : 'black',
                border: 'none',
                borderRadius: 4,
                padding: '6px 12px',
                cursor: 'pointer'
              }}
              disabled={!tee || !flag || holeFinished}
            >
              {mode === 'shot' ? 'Cancel Shot' : 'Add Shot'}
            </button>
            <button
              onClick={resetAll}
              style={{
                background: '#d32f2f',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                padding: '6px 12px',
                cursor: 'pointer'
              }}
            >
              Reset Hole
            </button>
          </div>
        </div>
        {/* AI Caddie Component */}
        <AICaddie
          shots={shots}
          tee={tee}
          flag={flag}
          hole={holes[selectedHoleIdx]}
          onAddTargetArea={handleAddTargetArea}
          playerClubs={playerClubs}
          mode={mode}
          onSetTee={(coords) => { setTee(coords); setMode(null); }}
          onSetFlag={(coords) => { setFlag(coords); setMode(null); }}
          onAddShot={(coords) => setShots(prev => [...prev, coords])}
        />
      </div>
    </div>
  );
}

export default App;
