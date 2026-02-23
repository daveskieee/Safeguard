import React, { useState } from 'react';
import { motion } from 'framer-motion';

const TANK_TYPES = ['Saltwater', 'Freshwater', 'Brackish', 'Reef', 'Planted', 'Tropical'];
const TANK_ICONS = {
  'Saltwater': '🐠',
  'Freshwater': '🐟',
  'Brackish': '🦐',
  'Reef': '🪸',
  'Planted': '🌱',
  'Tropical': '🌺',
};

const SAMPLE_IMAGES = {
  'Reef': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
  'Saltwater': 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=400&h=300&fit=crop',
  'Freshwater': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
  'Tropical': 'https://images.unsplash.com/photo-1560935331-8a4d60666fdd?w=400&h=300&fit=crop',
  'Planted': 'https://images.unsplash.com/photo-1535241749838-299277b6305f?w=400&h=300&fit=crop',
  'Brackish': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
};

export default function AddTankModal({ onClose, onSubmit, name, setName, type, setType, image, setImage, error, loading }) {
  const [showImageInput, setShowImageInput] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      setTimeout(() => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        setImage(canvas.toDataURL('image/jpeg'));

        stream.getTracks().forEach(track => track.stop());
      }, 500);
    } catch (error) {
      alert('Camera access denied or unavailable');
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
        <div className="glass p-6 md:p-8 rounded-2xl max-w-md w-[calc(100vw-2rem)] md:w-[90vw] max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-900/30 pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">➕ Add New Tank</h2>
            <button
              onClick={onClose}
              className="text-blue-300 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Tank Name */}
            <div>
              <label className="block text-sm font-semibold text-blue-300 mb-2">
                Tank Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Main Display Tank"
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white/20"
                required
              />
            </div>

            {/* Tank Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-blue-300 mb-3">
                Tank Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TANK_TYPES.map((tankType) => (
                  <button
                    key={tankType}
                    type="button"
                    onClick={() => setType(tankType)}
                    className={`p-3 rounded-lg text-center transition-all ${
                      type === tankType
                        ? 'bg-blue-500 border-2 border-blue-300 ring-2 ring-blue-400'
                        : 'bg-white/10 border border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <div className="text-2xl mb-1">{TANK_ICONS[tankType]}</div>
                    <div className="text-xs text-white font-medium">{tankType}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm text-blue-300 mb-2">Preview:</p>
              {image && (
                <div className="mb-4 rounded-lg overflow-hidden border border-blue-400/20">
                  <img 
                    src={image} 
                    alt="Tank preview"
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}
              <div className="flex items-center gap-3">
                <span className="text-4xl">{TANK_ICONS[type]}</span>
                <div>
                  <p className="font-bold text-white">{name || 'Tank Name'}</p>
                  <p className="text-sm text-blue-300">{type}</p>
                </div>
              </div>
            </div>

            {/* Tank Image URL */}
            <div>
              <label className="block text-sm font-semibold text-blue-300 mb-2">
                📸 Tank Image (Optional)
              </label>
              
              {/* Image Options Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {/* Quick Sample Button */}
                <button
                  type="button"
                  onClick={() => setImage(SAMPLE_IMAGES[type])}
                  className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/50 text-blue-300 hover:text-blue-200 rounded-lg text-sm font-semibold transition-all"
                >
                  🖼️ Sample
                </button>
                
                {/* File Upload Button */}
                <label className="px-3 py-2 bg-green-500/20 hover:bg-green-500/40 border border-green-400/50 text-green-300 hover:text-green-200 rounded-lg text-sm font-semibold transition-all cursor-pointer text-center">
                  📤 Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Camera Button */}
              <button
                type="button"
                onClick={handleCameraCapture}
                className="w-full mb-3 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/40 border border-purple-400/50 text-purple-300 hover:text-purple-200 rounded-lg text-sm font-semibold transition-all"
              >
                📷 Take Photo
              </button>
              
              {/* Custom URL Toggle */}
              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className="w-full px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-sm font-semibold transition-all"
              >
                {showImageInput ? '✕ Hide URL' : '🔗 Paste URL'}
              </button>
              
              {showImageInput && (
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/tank.jpg"
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white/20 text-sm mt-2"
                />
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={!name.trim() || loading}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  'Create Tank'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
}
