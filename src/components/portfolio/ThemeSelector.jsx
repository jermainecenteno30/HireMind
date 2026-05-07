import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const themes = [
  { id: 'modern', name: 'Modern Professional', icon: '🎨', preview: 'Gradient header, card layout', premium: false },
  { id: 'minimalist', name: 'Minimalist Clean', icon: '✨', preview: 'Simple, elegant, spacious', premium: true },
  { id: 'dark', name: 'Dark Mode', icon: '🌙', preview: 'Modern dark theme', premium: true }
];

const ThemeSelector = ({ selectedTheme, onSelect }) => {
  const { isPremium } = useAuth();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {themes.map(theme => {
        const isLocked = theme.premium && !isPremium;
        
        return (
          <button
            key={theme.id}
            onClick={() => !isLocked && onSelect(theme.id)}
            className={`relative p-4 rounded-xl border-2 transition-all text-left ${
              selectedTheme === theme.id
                ? 'border-primary-500 bg-primary-50'
                : isLocked
                ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
            }`}
            disabled={isLocked}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-3xl mb-2">{theme.icon}</div>
                <h3 className="font-semibold text-gray-900">{theme.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{theme.preview}</p>
              </div>
              {selectedTheme === theme.id && (
                <CheckCircleIcon className="h-5 w-5 text-primary-500" />
              )}
              {isLocked && (
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              )}
            </div>
            {theme.premium && !isPremium && (
              <div className="absolute bottom-2 right-2">
                <span className="text-xs bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 py-0.5 rounded-full">
                  Premium
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ThemeSelector;