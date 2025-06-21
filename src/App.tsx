import { useState, useEffect } from 'react';
import { AICaddie } from './components/AICaddie';
import { WelcomeScreen } from './components/WelcomeScreen';
import './App.css';

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

interface Course {
  name: string;
  description: string;
  holes: Hole[];
}

const defaultClubs: Club[] = [
  { name: 'Driver', minDistance: 200, maxDistance: 280, averageDistance: 240 },
  { name: '3 Wood', minDistance: 180, maxDistance: 240, averageDistance: 210 },
  { name: '5 Iron', minDistance: 140, maxDistance: 180, averageDistance: 160 },
  { name: '7 Iron', minDistance: 120, maxDistance: 160, averageDistance: 140 },
  { name: '9 Iron', minDistance: 100, maxDistance: 140, averageDistance: 120 },
  { name: 'Pitching Wedge', minDistance: 80, maxDistance: 120, averageDistance: 100 },
  { name: 'Sand Wedge', minDistance: 60, maxDistance: 100, averageDistance: 80 },
  { name: 'Putter', minDistance: 0, maxDistance: 30, averageDistance: 15 }
];

const courses: Course[] = [
  {
    name: 'Vinterbro Golf Course',
    description: 'A challenging 18-hole course with beautiful scenery and strategic play.',
    holes: [
      { 
        number: 1, 
        name: 'Opening Drive', 
        geojson: '/hole1.geojson', 
        par: 4, 
        distance: 410, 
        tips: 'Avoid the bunker on the right. Favor the left side of the fairway for the best approach angle.' 
      },
      { 
        number: 2, 
        name: 'Water Challenge', 
        geojson: '/hole2.geojson', 
        par: 3, 
        distance: 180, 
        tips: 'Watch for the water hazard on the left. Club up and aim for the center of the green.' 
      },
      { 
        number: 3, 
        name: 'Long Par 5', 
        geojson: '/hole3.geojson', 
        par: 5, 
        distance: 520, 
        tips: 'Long par 5, keep it in the fairway. Two good shots can get you home in two.' 
      },
      { 
        number: 4, 
        name: 'Dogleg Left', 
        geojson: '/hole4.geojson', 
        par: 4, 
        distance: 390, 
        tips: 'Dogleg left, favor the right side off the tee. Short iron into an elevated green.' 
      },
      { 
        number: 5, 
        name: 'Narrow Fairway', 
        geojson: '/hole5.geojson', 
        par: 4, 
        distance: 420, 
        tips: 'Narrow fairway, accuracy is key off the tee. Bunkers guard the front of the green.' 
      },
      { 
        number: 6, 
        name: 'Short Par 3', 
        geojson: '/hole6.geojson', 
        par: 3, 
        distance: 175, 
        tips: 'Short par 3, watch for the bunkers around the green. Pin position is key.' 
      }
    ]
  },
  {
    name: 'Demo Course',
    description: 'A practice course perfect for testing the app features.',
    holes: [
      { 
        number: 1, 
        name: 'Practice Hole', 
        geojson: '/demo-hole1.geojson', 
        par: 4, 
        distance: 350, 
        tips: 'Simple straightaway hole perfect for getting started.' 
      }
    ]
  }
];

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const [shots, setShots] = useState<[number, number][]>([]);
  const [tee, setTee] = useState<[number, number] | null>(null);
  const [flag, setFlag] = useState<[number, number] | null>(null);
  const [mode, setMode] = useState<'tee' | 'flag' | 'shot' | null>(null);
  const [playerClubs, setPlayerClubs] = useState<Club[]>(defaultClubs);
  const [targetAreas, setTargetAreas] = useState<any[]>([]);

  // Load player clubs from localStorage
  useEffect(() => {
    const savedClubs = localStorage.getItem('playerClubs');
    if (savedClubs) {
      try {
        const parsedClubs = JSON.parse(savedClubs);
        if (Array.isArray(parsedClubs)) {
          setPlayerClubs(parsedClubs);
        }
      } catch (e) {
        console.error("Failed to parse player clubs from localStorage", e);
      }
    }
  }, []);

  const currentHole = selectedCourse?.holes[currentHoleIndex];

  // Reset hole data when changing holes
  useEffect(() => {
    setShots([]);
    setTee(null);
    setFlag(null);
    setMode(null);
    setTargetAreas([]);
  }, [currentHoleIndex]);

  const handleStart = () => {
    setGameStarted(true);
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setCurrentHoleIndex(0);
  };

  const handleSetTee = (coords: [number, number]) => {
    setTee(coords);
    setMode(null);
  };

  const handleSetFlag = (coords: [number, number]) => {
    setFlag(coords);
    setMode(null);
  };

  const handleAddShot = (coords: [number, number]) => {
    setShots(prev => [...prev, coords]);
    setMode(null);
  };

  const handleAddTargetArea = (target: any) => {
    setTargetAreas(prev => [...prev, target]);
  };

  const handleSelectHole = (holeIndex: number) => {
    setCurrentHoleIndex(holeIndex);
  };

  const handleResetHole = () => {
    setShots([]);
    setTee(null);
    setFlag(null);
    setMode(null);
    setTargetAreas([]);
  };

  const handleSetMode = (newMode: 'tee' | 'flag' | 'shot' | null) => {
    setMode(newMode);
  };

  const handleBackToCourseSelection = () => {
    setSelectedCourse(null);
    setCurrentHoleIndex(0);
  };

  const handleBackToWelcome = () => {
    setGameStarted(false);
    setSelectedCourse(null);
    setCurrentHoleIndex(0);
  };

  // Welcome Screen
  if (!gameStarted) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  // Course Selection Screen
  if (!selectedCourse) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          maxWidth: '800px',
          width: '100%',
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '2rem', color: '#1976d2', margin: 0 }}>
              Select a Course
            </h1>
            <button
              onClick={handleBackToWelcome}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f5f5f5',
                color: '#666',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              ← Back
            </button>
          </div>

          <div style={{ display: 'grid', gap: '20px' }}>
            {courses.map((course, index) => (
              <div
                key={index}
                onClick={() => handleCourseSelect(course)}
                style={{
                  padding: '24px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#fafafa'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1976d2';
                  e.currentTarget.style.backgroundColor = '#f0f7ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.backgroundColor = '#fafafa';
                }}
              >
                <h3 style={{ margin: '0 0 12px 0', color: '#1976d2', fontSize: '1.3rem' }}>
                  {course.name}
                </h3>
                <p style={{ margin: '0 0 16px 0', color: '#666', lineHeight: '1.5' }}>
                  {course.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#888', fontSize: '0.9rem' }}>
                    {course.holes.length} holes
                  </span>
                  <span style={{ 
                    backgroundColor: '#1976d2', 
                    color: 'white', 
                    padding: '4px 12px', 
                    borderRadius: '16px',
                    fontSize: '0.8rem'
                  }}>
                    Select →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main Game Screen
  if (!currentHole) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Course data loading...</div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Back to Course Selection Button */}
      <button
        onClick={handleBackToCourseSelection}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1002,
          padding: '8px 16px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          color: '#1976d2',
          border: '1px solid #1976d2',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: '500'
        }}
      >
        ← {selectedCourse.name}
      </button>

      <AICaddie
        shots={shots}
        tee={tee}
        flag={flag}
        hole={currentHole}
        playerClubs={playerClubs}
        mode={mode}
        onSetTee={handleSetTee}
        onSetFlag={handleSetFlag}
        onAddShot={handleAddShot}
        onAddTargetArea={handleAddTargetArea}
        onSelectHole={handleSelectHole}
        onResetHole={handleResetHole}
        onSetMode={handleSetMode}
        holes={selectedCourse.holes}
        currentHoleIndex={currentHoleIndex}
      />
    </div>
  );
}

export default App;
