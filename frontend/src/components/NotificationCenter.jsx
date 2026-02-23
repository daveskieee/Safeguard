import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationCenter({ notifications, onDismiss }) {
  return (
    <div className="fixed top-4 right-4 z-30 max-w-md space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className={`glass p-4 rounded-lg flex items-start gap-3 ${
              notification.type === 'warning' ? 'border-l-4 border-red-500' : ''
            }`}
          >
            <span className="text-2xl flex-shrink-0">
              {notification.type === 'warning' ? '⚠️' : 'ℹ️'}
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{notification.message}</p>
              <p className="text-xs text-blue-300 mt-1">
                {notification.timestamp.toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => onDismiss(notification.id)}
              className="text-blue-300 hover:text-white flex-shrink-0"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
