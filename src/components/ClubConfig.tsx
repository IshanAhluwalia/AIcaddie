import React, { useState, useEffect } from 'react';

interface Club {
  name: string;
  minDistance: number;
  maxDistance: number;
  averageDistance: number;
}

interface ClubConfigProps {
  onSave: (clubs: Club[]) => void;
  initialClubs?: Club[];
  onFinish?: () => void;
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

// Generate ranges in 10-yard increments from 0 to 300 yards
const generateDistanceRanges = () => {
  const ranges = [];
  for (let min = 0; min < 300; min += 10) {
    const max = min + 10;
    ranges.push({
      label: `${min}-${max} yards`,
      min,
      max
    });
  }
  return ranges;
};

const distanceRanges = generateDistanceRanges();

export function ClubConfig({ onSave, initialClubs = defaultClubs, onFinish }: ClubConfigProps) {
  const [clubs, setClubs] = useState<Club[]>(initialClubs);
  const [currentClubIndex, setCurrentClubIndex] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  const currentClub = clubs[currentClubIndex] || defaultClubs[0];

  const handleRangeSelect = (range: { min: number; max: number }) => {
    console.log('Selecting range:', range); // Debug log
    
    const updatedClubs = [...clubs];
    updatedClubs[currentClubIndex] = {
      ...currentClub,
      minDistance: range.min,
      maxDistance: range.max,
      averageDistance: Math.round((range.min + range.max) / 2)
    };
    
    console.log('Updated club:', updatedClubs[currentClubIndex]); // Debug log
    setClubs(updatedClubs);
    onSave(updatedClubs);
  };

  const handleNext = () => {
    if (currentClubIndex < clubs.length - 1) {
      setCurrentClubIndex(currentClubIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentClubIndex > 0) {
      setCurrentClubIndex(currentClubIndex - 1);
    }
  };

  const handleFinish = () => {
    console.log('Finishing club configuration'); // Debug log
    onSave(clubs);
    if (onFinish) {
      onFinish();
    }
  };

  const progress = ((currentClubIndex + 1) / clubs.length) * 100;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          width: '100%', 
          height: '8px', 
          backgroundColor: '#e0e0e0', 
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: `${progress}%`, 
            height: '100%', 
            backgroundColor: '#1976d2',
            transition: 'width 0.3s ease'
          }} />
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: '8px',
          color: '#666'
        }}>
          <span>Club {currentClubIndex + 1} of {clubs.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '24px', 
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '24px', color: '#1976d2' }}>
          {currentClub.name}
        </h2>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: '#333' }}>Select Your Distance Range</h3>
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '8px'
          }}>
            {distanceRanges.map((range) => (
              <button
                key={range.label}
                onClick={() => handleRangeSelect(range)}
                style={{
                  padding: '12px',
                  backgroundColor: 
                    currentClub.minDistance === range.min && 
                    currentClub.maxDistance === range.max 
                      ? '#1976d2' 
                      : '#f5f5f5',
                  color: 
                    currentClub.minDistance === range.min && 
                    currentClub.maxDistance === range.max 
                      ? 'white' 
                      : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  userSelect: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  width: '100%',
                  textAlign: 'left'
                }}
                onMouseDown={(e) => e.preventDefault()}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {currentClub.averageDistance > 0 && (
          <div style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '16px', 
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <h3 style={{ marginBottom: '12px', color: '#333' }}>Selected Range</h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '16px',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ color: '#666', fontSize: '14px' }}>Min Distance</div>
                <div style={{ fontSize: '20px', fontWeight: '500', color: '#1976d2' }}>
                  {currentClub.minDistance} yards
                </div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: '14px' }}>Average</div>
                <div style={{ fontSize: '20px', fontWeight: '500', color: '#1976d2' }}>
                  {currentClub.averageDistance} yards
                </div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: '14px' }}>Max Distance</div>
                <div style={{ fontSize: '20px', fontWeight: '500', color: '#1976d2' }}>
                  {currentClub.maxDistance} yards
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <button
            onClick={handlePrevious}
            disabled={currentClubIndex === 0}
            style={{
              padding: '12px 24px',
              backgroundColor: '#f5f5f5',
              color: currentClubIndex === 0 ? '#999' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: currentClubIndex === 0 ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              flex: 1
            }}
          >
            Previous Club
          </button>
          <button
            onClick={currentClubIndex === clubs.length - 1 ? handleFinish : handleNext}
            disabled={currentClub.averageDistance === 0}
            style={{
              padding: '12px 24px',
              backgroundColor: currentClub.averageDistance === 0 ? '#e0e0e0' : '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: currentClub.averageDistance === 0 ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              flex: 1
            }}
          >
            {currentClubIndex === clubs.length - 1 ? 'Finish' : 'Next Club'}
          </button>
        </div>
      </div>

      <style>{`
        button:active {
          transform: scale(0.98);
        }
        button:hover:not(:disabled) {
          filter: brightness(1.1);
        }
      `}</style>
    </div>
  );
} 