import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardHeader from './components/DashboardHeader';
import TankCard from './components/TankCard';
import TankDetailModal from './components/TankDetailModal';
import AddTankModal from './components/AddTankModal';
import EditTankImageModal from './components/EditTankImageModal';
import NotificationCenter from './components/NotificationCenter';
import { useSocketConnection } from './hooks/useSocketConnection';
import { fetchTanks, updateTankImage, deleteTank } from './services/api';
import './App.css';

function App() {
  const [tanks, setTanks] = useState([]);
  const [selectedTank, setSelectedTank] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTank, setShowAddTank] = useState(false);
  const [newTankName, setNewTankName] = useState('');
  const [newTankType, setNewTankType] = useState('Saltwater');
  const [newTankImage, setNewTankImage] = useState('');
  const [addTankError, setAddTankError] = useState('');
  const [addTankLoading, setAddTankLoading] = useState(false);
  const [editingTank, setEditingTank] = useState(null);
  const [editTankImageError, setEditTankImageError] = useState('');
  const [editTankImageLoading, setEditTankImageLoading] = useState(false);
  
  const { socket } = useSocketConnection();

  // Fetch tanks on mount
  useEffect(() => {
    loadTanks();
  }, []);

  // Listen for new readings via WebSocket
  useEffect(() => {
    if (!socket) return;

    socket.on('new-reading', (reading) => {
      // Update tank with new reading
      setTanks(prevTanks => 
        prevTanks.map(tank => 
          tank.id === reading.tankId 
            ? { ...tank, latestReading: reading, isOutOfRange: reading.isOutOfRange }
            : tank
        )
      );

      // Add notification if out of range
      if (reading.isOutOfRange) {
        const notification = {
          id: Date.now(),
          tankId: reading.tankId,
          message: `⚠️ Tank parameters out of range!`,
          type: 'warning',
          timestamp: new Date()
        };
        setNotifications(prev => [notification, ...prev].slice(0, 5));
        triggerNotification(notification);
      }
    });

    return () => socket.off('new-reading');
  }, [socket]);

  const loadTanks = async () => {
    try {
      setLoading(true);
      const data = await fetchTanks();
      setTanks(data);
    } catch (error) {
      console.error('Failed to load tanks:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('HydroGuard Alert', {
        body: notification.message,
        icon: '🌊'
      });
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleAddTank = async (e) => {
    e.preventDefault();
    setAddTankError('');
    setAddTankLoading(true);
    
    try {
      if (!newTankName.trim()) {
        setAddTankError('Tank name is required');
        return;
      }

      const response = await fetch('http://localhost:5000/api/tanks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTankName, type: newTankType, image: newTankImage })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const newTank = await response.json();
      setTanks(prev => [...prev, { ...newTank, latestReading: null, isOutOfRange: false }]);
      setNewTankName('');
      setNewTankType('Saltwater');
      setNewTankImage('');
      setShowAddTank(false);
      setAddTankError('');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to add tank';
      setAddTankError(errorMsg);
      console.error('Failed to add tank:', error);
    } finally {
      setAddTankLoading(false);
    }
  };

  const handleDeleteTank = async (tankId) => {
    if (window.confirm('Are you sure you want to delete this tank?')) {
      try {
        await fetch(`http://localhost:5000/api/tanks/${tankId}`, { method: 'DELETE' });
        setTanks(prev => prev.filter(t => t.id !== tankId));
        if (selectedTank?.id === tankId) setSelectedTank(null);
      } catch (error) {
        console.error('Failed to delete tank:', error);
      }
    }
  };

  const handleEditTankImage = async (tankId, newImage) => {
    setEditTankImageError('');
    setEditTankImageLoading(true);
    
    try {
      await updateTankImage(tankId, newImage);
      
      // Update the tank in state
      setTanks(prev => 
        prev.map(tank => 
          tank.id === tankId ? { ...tank, image: newImage } : tank
        )
      );
      
      // Update selected tank if it's currently being viewed
      if (selectedTank && selectedTank.id === tankId) {
        setSelectedTank({ ...selectedTank, image: newImage });
      }
      
      setEditingTank(null);
      setEditTankImageError('');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update tank image';
      setEditTankImageError(errorMsg);
      console.error('Failed to update tank image:', error);
    } finally {
      setEditTankImageLoading(false);
    }
  };

  // Request notification permissions on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader tanksCount={tanks.length} onAddTank={() => setShowAddTank(true)} />
        
        <NotificationCenter 
          notifications={notifications} 
          onDismiss={removeNotification}
        />

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-400 border-t-blue-100 rounded-full"
            />
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {tanks.map((tank, index) => (
              <motion.div
                key={tank.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TankCard
                  tank={tank}
                  onCardClick={() => setSelectedTank(tank)}
                  onDeleteClick={handleDeleteTank}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {showAddTank && (
          <AddTankModal
            onClose={() => {
              setShowAddTank(false);
              setAddTankError('');
            }}
            onSubmit={handleAddTank}
            name={newTankName}
            setName={setNewTankName}
            type={newTankType}
            image={newTankImage}
            setImage={setNewTankImage}
            setType={setNewTankType}
            error={addTankError}
            loading={addTankLoading}
          />
        )}

        {selectedTank && (
          <TankDetailModal
            tank={selectedTank}
            onClose={() => setSelectedTank(null)}
            onEditImage={setEditingTank}
          />
        )}

        {editingTank && (
          <EditTankImageModal
            tank={editingTank}
            onClose={() => {
              setEditingTank(null);
              setEditTankImageError('');
            }}
            onSubmit={handleEditTankImage}
            loading={editTankImageLoading}
            error={editTankImageError}
          />
        )}
      </div>
    </div>
  );
}

export default App;
