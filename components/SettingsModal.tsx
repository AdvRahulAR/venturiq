
import React from 'react';
import { XIcon } from './icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  // FIX: Per coding guidelines, API key must be managed via environment variables and not through UI.
  // The component has been updated to remove API key management, which also fixes the compilation errors
  // related to missing 'apiKey' and 'setApiKey' in AppContext.
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
          <XIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Settings</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Google Gemini API Key
            </label>
            <p className="text-xs text-slate-500 mt-2">
              The API key is managed via environment variables and is not configurable through the UI.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-brand-primary text-white font-semibold py-2 px-4 rounded-md hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
