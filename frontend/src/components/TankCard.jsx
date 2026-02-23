import React from 'react';
import { motion } from 'framer-motion';

const TANK_ICONS = {
  'Saltwater': '🐠',
  'Freshwater': '🐟',
  'Brackish': '🦐',
  'Reef': '🪸',
  'Planted': '🌱',
  'Tropical': '🌺',
};

export default function TankCard({ tank, onCardClick, onDeleteClick }) {
  const latestReading = tank.latestReading;
  const isOutOfRange = tank.isOutOfRange;

  // Determine glow color based on status
  const getGlowClass = () => {
    if (!latestReading) return 'border border-blue-500/30';
    return isOutOfRange 
      ? 'glow-danger-pulse' 
      : 'glow-safe';
  };

  const getStatusColor = () => {
    if (!latestReading) return 'text-blue-300';
    return isOutOfRange ? 'text-red-400' : 'text-green-400';
  };

  const formatTemp = (temp) => temp?.toFixed(1) ?? 'N/A';
  const formatPH = (pH) => pH?.toFixed(2) ?? 'N/A';
  const formatSalinity = (salinity) => salinity?.toFixed(3) ?? 'N/A';
  const getTankIcon = () => TANK_ICONS[tank.type] || '🐠';

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onCardClick}
      className={`glass-hover p-6 cursor-pointer group relative overflow-hidden ${getGlowClass()}`}
    >
      {/* Background gradient for visual interest */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-blue-600/0 group-hover:from-blue-400/5 group-hover:to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        {/* Tank Image */}
        {tank.image && (
          <div className="mb-4 rounded-lg overflow-hidden border border-blue-400/20 h-32 w-full">
            <img 
              src={tank.image} 
              alt={tank.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Header Section */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <div className="text-3xl flex-shrink-0">{getTankIcon()}</div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-white truncate">{tank.name}</h3>
                <p className="text-xs text-blue-300 truncate">{tank.type}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div className={`text-xl ${getStatusColor()}`}>
                {isOutOfRange ? '⚠️' : '✓'}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClick(tank.id);
                }}
                className="bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 hover:border-red-500 text-red-300 hover:text-red-200 px-2 py-1 rounded text-xs font-semibold transition-all whitespace-nowrap"
                title="Delete tank"
              >
                ✕ Delete
              </button>
            </div>
          </div>

        {/* Status Indicator */}
        <div className="mb-3">
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
            isOutOfRange 
              ? 'bg-red-500/20 text-red-300 border border-red-500/50'
              : 'bg-green-500/20 text-green-300 border border-green-500/50'
          }`}>
            {isOutOfRange ? '⚠ Out of Range' : '✓ Normal'}
          </span>
        </div>
        </div>

        {/* Readings Grid */}
        {latestReading ? (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white/5 p-2 rounded-lg border border-blue-400/20">
                <p className="text-blue-400 text-xs mb-1">🌡 Temp</p>
                <p className="font-mono font-bold text-white text-sm">{formatTemp(latestReading.temperature)}°</p>
              </div>
              <div className="bg-white/5 p-2 rounded-lg border border-blue-400/20">
                <p className="text-blue-400 text-xs mb-1">⚗ pH</p>
                <p className="font-mono font-bold text-white text-sm">{formatPH(latestReading.pH)}</p>
              </div>
              <div className="bg-white/5 p-2 rounded-lg border border-blue-400/20">
                <p className="text-blue-400 text-xs mb-1">🧂 Sal</p>
                <p className="font-mono font-bold text-white text-sm">{formatSalinity(latestReading.salinity)}</p>
              </div>
            </div>
            <p className="text-xs text-blue-500">
              {new Date(latestReading.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
        ) : (
          <p className="text-blue-300 text-xs italic">No readings</p>
        )}

        {/* Click hint */}
        <div className="mt-2 text-xs text-blue-400 group-hover:text-blue-300 opacity-0 group-hover:opacity-100">
          Click to view details →
        </div>
      </div>
    </motion.div>
  );
}
