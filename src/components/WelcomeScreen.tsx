import { useState, useEffect } from 'react';
import { ClubConfig } from './ClubConfig';

interface Club {
  name: string;
  minDistance: number;
  maxDistance: number;
  averageDistance: number;
}

interface WelcomeScreenProps {
  onStart: () => void;
}

const defaultClubs: Club[] = [
  { name: 'Driver', minDistance: 0, maxDistance: 0, averageDistance: 0 },
  { name: '3 Wood', minDistance: 0, maxDistance: 0, averageDistance: 0 },
  { name: '5 Wood', minDistance: 0, maxDistance: 0, averageDistance: 0 },
  { name: '4 Iron', minDistance: 0, maxDistance: 0, averageDistance: 0 },
  { name: '5 Iron', minDistance: 0, maxDistance: 0, averageDistance: 0 },
  { name: '6 Iron', minDistance: 0, maxDistance: 0, averageDistance: 0 },
  { name: '7 Iron', minDistance: 0, maxDistance: 0, averageDistance: 0 },
  { name: '8 Iron', minDistance: 0, maxDistance: 0, averageDistance: 0 },
  { name: '9 Iron', minDistance: 0, maxDistance: 0, averageDistance: 0 },
  { name: 'PW', minDistance: 0, maxDistance: 0, averageDistance: 0 },
  { name: 'GW', minDistance: 0, maxDistance: 0, averageDistance: 0 },
  { name: 'SW', minDistance: 0, maxDistance: 0, averageDistance: 0 },
  { name: 'LW', minDistance: 0, maxDistance: 0, averageDistance: 0 }
];

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [playerClubs, setPlayerClubs] = useState<Club[]>(defaultClubs);
  const [clubsConfigured, setClubsConfigured] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    const savedClubs = localStorage.getItem('playerClubs');
    if (savedClubs) {
      try {
        const parsedClubs = JSON.parse(savedClubs);
        if (Array.isArray(parsedClubs) && parsedClubs.length === defaultClubs.length) {
          setPlayerClubs(parsedClubs);
          const allConfigured = parsedClubs.every(club => club.averageDistance > 0);
          setClubsConfigured(allConfigured);
        }
      } catch (error) {
        console.error('Error loading saved clubs:', error);
      }
    }
  }, []);

  const handleSaveClubs = (clubs: Club[]) => {
    console.log('Saving clubs:', clubs); // Debug log
    try {
      localStorage.setItem('playerClubs', JSON.stringify(clubs));
      setPlayerClubs(clubs);
      const allConfigured = clubs.every(club => club.averageDistance > 0);
      setClubsConfigured(allConfigured);
    } catch (error) {
      console.error('Error saving clubs:', error);
    }
  };

  const handleFinishConfig = () => {
    console.log('Finishing configuration'); // Debug log
    setShowConfig(false);
  };

  if (showConfig) {
    return (
      <div style={{ padding: '20px' }}>
        <ClubConfig 
          onSave={handleSaveClubs} 
          initialClubs={playerClubs}
          onFinish={handleFinishConfig}
        />
      </div>
    );
  }

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
        maxWidth: '600px',
        width: '100%',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem',
          color: '#1976d2',
          marginBottom: '20px'
        }}>
          Welcome to AICaddie
        </h1>
        
        <p style={{ 
          fontSize: '1.2rem',
          color: '#666',
          marginBottom: '40px',
          lineHeight: '1.6'
        }}>
          Your AI-powered golf companion. Let's get started by configuring your clubs.
        </p>

        {clubsConfigured ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button
              onClick={onStart}
              style={{
                padding: '16px 32px',
                fontSize: '1.2rem',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Start Playing
            </button>
            <button
              onClick={() => setShowConfig(true)}
              style={{
                padding: '12px 24px',
                fontSize: '1rem',
                backgroundColor: '#f5f5f5',
                color: '#666',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Edit Club Configuration
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowConfig(true)}
            style={{
              padding: '16px 32px',
              fontSize: '1.2rem',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            Configure Your Clubs
          </button>
        )}
      </div>

      <style>{`
        button:hover {
          filter: brightness(1.1);
        }
        button:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
} 