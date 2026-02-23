import React from 'react';
import { motion } from 'framer-motion';

export default function DashboardHeader({ tanksCount, onAddTank }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            🌊 HydroGuard Dashboard
          </h1>
          <p className="text-blue-300">
            Real-time Aquatic Monitoring System
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass px-6 py-3 rounded-lg">
            <p className="text-sm text-blue-200">Active Tanks</p>
            <p className="text-2xl font-bold text-blue-400">{tanksCount}</p>
          </div>
          <button
            onClick={onAddTank}
            className="glass px-6 py-3 rounded-lg hover:bg-white/15 hover:border-blue-400/30 transition-all font-semibold text-white"
            title="Add a new tank"
          >
            ➕ Add Tank
          </button>
        </div>
      </div>
    </motion.div>
  );
}
