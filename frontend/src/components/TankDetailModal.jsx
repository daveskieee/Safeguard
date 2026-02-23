import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchTankReadings } from '../services/api';

export default function TankDetailModal({ tank, onClose, onEditImage }) {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('temperature');

  useEffect(() => {
    loadReadings();
  }, [tank.id]);

  const loadReadings = async () => {
    try {
      setLoading(true);
      const data = await fetchTankReadings(tank.id);
      setReadings(data);
    } catch (error) {
      console.error('Failed to load readings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const chartData = readings.map(reading => ({
    timestamp: formatTime(reading.timestamp),
    temperature: reading.temperature,
    pH: reading.pH,
    salinity: reading.salinity,
    fullTime: new Date(reading.timestamp)
  }));

  const renderChart = () => {
    switch (activeTab) {
      case 'temperature':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="timestamp" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(5, 24, 48, 0.9)', border: '1px solid rgba(26, 175, 223, 0.3)' }}
                cursor={{ stroke: 'rgba(26, 175, 223, 0.3)' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="temperature" 
                stroke="#1aafdf" 
                dot={false}
                strokeWidth={2}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pH':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="timestamp" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(5, 24, 48, 0.9)', border: '1px solid rgba(26, 175, 223, 0.3)' }}
                cursor={{ stroke: 'rgba(26, 175, 223, 0.3)' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="pH" 
                stroke="#10b981" 
                dot={false}
                strokeWidth={2}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'salinity':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="timestamp" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(5, 24, 48, 0.9)', border: '1px solid rgba(26, 175, 223, 0.3)' }}
                cursor={{ stroke: 'rgba(26, 175, 223, 0.3)' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="salinity" 
                stroke="#f59e0b" 
                dot={false}
                strokeWidth={2}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
      >
        <div className="glass p-6 md:p-8 rounded-2xl max-w-5xl w-[calc(100vw-2rem)] md:w-[90vw] max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-900/30 pointer-events-auto">
          {/* Header */}
          {/* Header with Tank Image */}
          <div className="mb-6">
            {tank.image && (
              <div className="mb-4 rounded-lg overflow-hidden border border-blue-400/20 max-h-48">
                <img 
                  src={tank.image} 
                  alt={tank.name}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{tank.name}</h2>
                <p className="text-blue-300">{tank.type} - Last 48 Hours Analysis</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEditImage(tank)}
                  className="text-blue-300 hover:text-blue-100 text-2xl hover:scale-110 transition-transform"
                  title="Edit tank image"
                >
                  🖼️
                </button>
                <button
                  onClick={onClose}
                  className="text-blue-300 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-white/10 pb-4 flex-wrap">
            {['temperature', 'pH', 'salinity'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white/5 text-blue-300 hover:bg-white/10'
                }`}
              >
                {tab === 'temperature' && '🌡️ Temperature'}
                {tab === 'pH' && '⚗️ pH Level'}
                {tab === 'salinity' && '🧂 Salinity'}
              </button>
            ))}
          </div>

          {/* Chart Section */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-white mb-4">📈 Trend Chart</h3>
            {loading ? (
              <div className="flex justify-center items-center h-80">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 border-3 border-blue-400 border-t-blue-100 rounded-full"
                />
              </div>
            ) : (
              <div className="bg-white/5 rounded-lg p-6 border border-blue-400/10">
                <div className="w-full flex justify-center">
                  {renderChart()}
                </div>
              </div>
            )}
          </div>

          {/* Stats Section */}
          <div className="bg-gradient-to-br from-blue-500/10 to-slate-600/10 rounded-lg p-6 border border-blue-400/20">
            <h3 className="text-lg font-bold text-white mb-6 text-center">📊 48-Hour Statistics</h3>
            {readings.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {activeTab === 'temperature' && (
                  <>
                    <StatsCard 
                      label="Max Temp" 
                      value={`${Math.max(...readings.map(r => r.temperature || -Infinity)).toFixed(1)}°C`}
                      icon="📈"
                    />
                    <StatsCard 
                      label="Avg Temp" 
                      value={`${(readings.reduce((sum, r) => sum + (r.temperature || 0), 0) / readings.length).toFixed(1)}°C`}
                      icon="⚖️"
                    />
                    <StatsCard 
                      label="Min Temp" 
                      value={`${Math.min(...readings.map(r => r.temperature || Infinity)).toFixed(1)}°C`}
                      icon="📉"
                    />
                  </>
                )}
                {activeTab === 'pH' && (
                  <>
                    <StatsCard 
                      label="Max pH" 
                      value={Math.max(...readings.map(r => r.pH || -Infinity)).toFixed(2)}
                      icon="📈"
                    />
                    <StatsCard 
                      label="Avg pH" 
                      value={(readings.reduce((sum, r) => sum + (r.pH || 0), 0) / readings.length).toFixed(2)}
                      icon="⚖️"
                    />
                    <StatsCard 
                      label="Min pH" 
                      value={Math.min(...readings.map(r => r.pH || Infinity)).toFixed(2)}
                      icon="📉"
                    />
                  </>
                )}
                {activeTab === 'salinity' && (
                  <>
                    <StatsCard 
                      label="Max Salinity" 
                      value={Math.max(...readings.map(r => r.salinity || -Infinity)).toFixed(3)}
                      icon="📈"
                    />
                    <StatsCard 
                      label="Avg Salinity" 
                      value={(readings.reduce((sum, r) => sum + (r.salinity || 0), 0) / readings.length).toFixed(3)}
                      icon="⚖️"
                    />
                    <StatsCard 
                      label="Min Salinity" 
                      value={Math.min(...readings.map(r => r.salinity || Infinity)).toFixed(3)}
                      icon="📉"
                    />
                  </>
                )}
              </div>
            ) : (
              <p className="text-center text-blue-300">No data available yet</p>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

function StatsCard({ label, value, icon }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white/10 rounded-lg p-4 text-center border border-blue-400/30 hover:border-blue-400/60 transition-all"
    >
      <p className="text-3xl mb-2">{icon}</p>
      <p className="text-blue-300 text-xs font-semibold mb-2 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-blue-100">{value}</p>
    </motion.div>
  );
}
