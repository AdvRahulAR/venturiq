
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Recommendation } from '../types';
import { TrashIcon } from './icons';

export const HistoryPage: React.FC<{ onSelectAnalysis: (id: string) => void }> = ({ onSelectAnalysis }) => {
  const { history, deleteAnalysis, clearHistory } = useContext(AppContext);
  
  const getRecommendationClass = (rec: Recommendation) => {
    switch (rec) {
      case Recommendation.INVEST: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case Recommendation.WATCHLIST: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case Recommendation.PASS: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  if (history.length === 0) {
    return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">No History Found</h2>
            <p className="text-slate-500 mt-2">Start a new analysis to see your history here.</p>
        </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analysis History</h1>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
                clearHistory();
            }
          }}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 rounded-md"
        >
          Clear All History
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden">
        <ul role="list" className="divide-y divide-slate-200 dark:divide-slate-700">
          {history.slice().reverse().map((item) => (
            <li key={item.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex items-center justify-between p-4 sm:p-6">
                <div className="flex-1 cursor-pointer min-w-0" onClick={() => onSelectAnalysis(item.id)}>
                    <div className="flex items-center justify-between">
                        <p className="text-lg font-semibold text-brand-primary truncate">{item.companyName}</p>
                        <div className="ml-2 flex-shrink-0 flex">
                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRecommendationClass(item.recommendation)}`}>
                                {item.recommendation}
                            </p>
                        </div>
                    </div>
                    {item.investorProfile && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                            For: {item.investorProfile}
                        </p>
                    )}
                    <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                            <p className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                                {item.sector} &bull; {item.stage} &bull; Score: {item.score}
                            </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-slate-500 dark:text-slate-400 sm:mt-0">
                            <p>{new Date(item.timestamp).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Are you sure you want to delete the analysis for ${item.companyName}?`)) {
                        deleteAnalysis(item.id);
                    }
                  }}
                  className="ml-4 p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};