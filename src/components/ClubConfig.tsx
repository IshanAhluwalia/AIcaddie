import { useState } from 'react';

interface Club {
  name: string;
  minDistance: number;
  maxDistance: number;
  averageDistance: number;
}

interface ClubConfigProps {
  onSave: (clubs: Club[]) => void;
  initialClubs: Club[];
  onFinish: () => void;
}

export function ClubConfig({ onSave, initialClubs, onFinish }: ClubConfigProps) {
  const [clubs, setClubs] = useState<Club[]>(initialClubs);

  const handleClubChange = (index: number, field: keyof Club, value: string | number) => {
    const newClubs = [...clubs];
    newClubs[index] = { ...newClubs[index], [field]: value };
    setClubs(newClubs);
  };

  const addClub = () => {
    setClubs([...clubs, { name: '', minDistance: 0, maxDistance: 0, averageDistance: 0 }]);
  };

  const removeClub = (index: number) => {
    setClubs(clubs.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(clubs);
    onFinish();
  };

  const configuredCount = clubs.filter(club => club.averageDistance > 0).length;

  return (
    <div style={{ padding: '20px', height: '100vh', overflow: 'auto', backgroundColor: 'white' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0 }}>Configure Your Clubs</h2>
            <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '0.9rem' }}>
              {configuredCount} of {clubs.length} clubs configured {configuredCount >= 3 ? '✅' : `(${3 - configuredCount} more needed)`}
            </p>
          </div>
          <button onClick={onFinish} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p>Set up your golf clubs with their typical distances. This helps the AI provide better recommendations.</p>
          <div style={{ 
            backgroundColor: '#e3f2fd', 
            border: '1px solid #2196f3', 
            borderRadius: '8px', 
            padding: '12px',
            marginTop: '12px'
          }}>
            <p style={{ margin: 0, color: '#1976d2', fontSize: '0.9rem' }}>
              💡 <strong>Tip:</strong> You only need to configure at least 3 clubs to get started. Fill in the average distance you typically hit with each club.
            </p>
          </div>
        </div>

        {clubs.map((club, index) => (
          <div key={index} style={{ 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            padding: '16px', 
            marginBottom: '16px',
            backgroundColor: '#f9f9f9'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="Club name (e.g., Driver, 7 Iron)"
                value={club.name}
                onChange={(e) => handleClubChange(index, 'name', e.target.value)}
                style={{ 
                  flex: 1, 
                  padding: '8px', 
                  border: '1px solid #ccc', 
                  borderRadius: '4px',
                  marginRight: '8px'
                }}
              />
              <button
                onClick={() => removeClub(index)}
                style={{
                  backgroundColor: '#d32f2f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  cursor: 'pointer'
                }}
              >
                Remove
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', fontWeight: '500' }}>
                  Min Distance (yds)
                </label>
                <input
                  type="number"
                  value={club.minDistance}
                  onChange={(e) => handleClubChange(index, 'minDistance', parseInt(e.target.value) || 0)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', fontWeight: '500' }}>
                  Max Distance (yds)
                </label>
                <input
                  type="number"
                  value={club.maxDistance}
                  onChange={(e) => handleClubChange(index, 'maxDistance', parseInt(e.target.value) || 0)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', fontWeight: '500' }}>
                  Average Distance (yds)
                </label>
                <input
                  type="number"
                  value={club.averageDistance}
                  onChange={(e) => handleClubChange(index, 'averageDistance', parseInt(e.target.value) || 0)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
          </div>
        ))}

        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={addClub}
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Add Club
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSave}
            style={{
              backgroundColor: configuredCount >= 3 ? '#43a047' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              cursor: configuredCount >= 3 ? 'pointer' : 'not-allowed',
              flex: 1,
              fontSize: '1rem',
              fontWeight: configuredCount >= 3 ? 'bold' : 'normal'
            }}
            disabled={configuredCount < 3}
          >
            {configuredCount >= 3 ? '✅ Save & Continue' : `Save (${3 - configuredCount} more clubs needed)`}
          </button>
          <button
            onClick={onFinish}
            style={{
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              cursor: 'pointer',
              flex: 1
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 