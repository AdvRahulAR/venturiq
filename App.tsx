import React, { useState, useContext } from 'react';
import { AppProvider, AppContext } from './context/AppContext';
import { AnalysisForm } from './components/AnalysisForm';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { HistoryPage } from './components/HistoryPage';
import { LandingPage } from './components/LandingPage';
import { SearchAgentModal } from './components/SearchAgentModal';
import { SunIcon, MoonIcon, HistoryIcon, SearchIcon } from './components/icons';
import { Analysis, Sector, Geography, Stage, Recommendation } from './types';

type View = 'landing' | 'form' | 'dashboard' | 'history';

const DEMO_ANALYSIS: Analysis = {
  id: 'demo-urbancart',
  timestamp: Date.now(),
  companyName: 'UrbanCart',
  sector: Sector.SAAS,
  geography: Geography.INDIA,
  stage: Stage.SEED,
  score: 78,
  recommendation: Recommendation.INVEST,
  confidence: 'High',
  investorProfile: 'General Analysis',
  fullAnalysis: {
    executiveSummary: 'UrbanCart is a promising B2B SaaS platform for Indian quick-commerce, leveraging the ONDC network to provide a unified storefront for small retailers. Strong initial traction and a clear product-market fit signal high growth potential.',
    scores: {
      team: { score: 85, reasoning: 'Experienced founders with deep domain expertise in Indian retail and logistics.' },
      market: { score: 80, reasoning: 'Large and rapidly growing quick-commerce market in India, with strong government support via ONDC.' },
      product: { score: 75, reasoning: 'Solid MVP with a clear value proposition. Needs to build out more enterprise features.' },
      traction: { score: 72, reasoning: 'Early but promising traction with 50+ pilot retailers and positive feedback.' },
      unitEconomics: { score: 70, reasoning: 'Plausible path to profitability with a clear SaaS pricing model and low initial CAC.' },
    },
    keyRisks: [
      { risk: 'Intense competition from established players and well-funded startups.', severity: 'High', mitigation: 'Focus on a niche vertical of small retailers and build strong network effects on the platform.' },
      { risk: 'Dependency on the ONDC network adoption and stability.', severity: 'Medium', mitigation: 'Develop parallel integration channels and offer standalone value.' },
    ],
    investmentThesis: [
      'Taps into the massive, underserved market of small Indian retailers.',
      'Leverages government-backed ONDC infrastructure for scalability.',
      'Strong founding team with a clear vision and execution capability.'
    ],
    benchmarkComparison: 'Compares favorably to early-stage competitors in terms of product focus and ONDC integration. Lacks the scale of larger players like Shopify but has a more localized approach.',
    metricsSnapshot: {
      TAM: '₹5 Lakh Crore (Indian Retail Market)',
      SAM: '₹50,000 Crore (Online Retail SaaS)',
      SOM: '₹5,000 Crore (Quick-Commerce SaaS for small retailers in Tier 1/2 cities)',
    },
    dataGaps: ['Detailed customer acquisition cost (CAC) and lifetime value (LTV) projections.', 'Clear product roadmap for the next 18 months.'],
    followUpQuestions: ['What is your strategy for onboarding retailers outside of major metro areas?', 'How do you plan to defend against larger, horizontal SaaS players entering the space?'],
    confidence: 'High',
  },
  groundingSources: [
    { uri: 'https://ondc.org/', title: 'Official ONDC Website' },
    { uri: 'https://inc42.com/features/the-state-of-indian-ecommerce-report-2023/', title: 'The State Of Indian eCommerce Report 2023 | Inc42' }
  ]
};

const AppContent: React.FC = () => {
  const { theme, toggleTheme, isLoading, toast, setToast, history, currentAnalysis, setCurrentAnalysis } = useContext(AppContext);
  const [view, setView] = useState<View>('landing');
  const [isSearchAgentOpen, setSearchAgentOpen] = useState(false);

  const handleSelectAnalysis = (id: string) => {
    const analysis = history.find(item => item.id === id);
    if (analysis) {
        setCurrentAnalysis(analysis);
        setView('dashboard');
    }
  }
  
  const handleSetView = (newView: View) => {
    if (newView === 'form') {
        setCurrentAnalysis(null);
    }
    setView(newView);
  }

  const handleViewDemo = () => {
    setCurrentAnalysis(DEMO_ANALYSIS);
    setView('dashboard');
  };

  return (
    <>
      <div className="min-h-screen font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300 flex flex-col">
        
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
            <button onClick={() => handleSetView('landing')} className="flex items-center space-x-2">
              <img src="https://lh3.googleusercontent.com/d/1yFaPb6VldctsJRRA-ILgWPd1lOFkzIhk" alt="VenturIQ Logo" className="w-10 h-10" />
              <span className="text-xl font-bold text-slate-900 dark:text-white">VenturIQ</span>
            </button>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button onClick={() => handleSetView('form')} className="hidden sm:inline-flex items-center space-x-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-primary">
                  New Analysis
              </button>
              <button onClick={() => setSearchAgentOpen(true)} className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-primary hover:bg-slate-100 dark:hover:bg-slate-800" title="AI Research Assistant">
                  <SearchIcon className="w-5 h-5"/>
              </button>
              <button onClick={() => handleSetView('history')} className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-primary hover:bg-slate-100 dark:hover:bg-slate-800" title="Analysis History">
                  <HistoryIcon className="w-5 h-5"/>
              </button>
              <button onClick={toggleTheme} className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-primary hover:bg-slate-100 dark:hover:bg-slate-800" title="Toggle Theme">
                {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
              </button>
            </div>
          </nav>
        </header>
        
        <main className="flex-grow">
          {view === 'landing' && <LandingPage onStart={() => handleSetView('form')} onViewDemo={handleViewDemo} />}
          {view === 'form' && <AnalysisForm onAnalysisComplete={() => setView('dashboard')} />}
          {view === 'dashboard' && <AnalysisDashboard onNewAnalysis={() => handleSetView('form')} />}
          {view === 'history' && <HistoryPage onSelectAnalysis={handleSelectAnalysis}/>}
        </main>
        
        <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>
            Developed by{' '}
            <a
              href="https://ubintelligence.tech/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-primary hover:underline"
            >
              UB Intelligence
            </a>
          </p>
        </footer>

        {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
                <div className="w-16 h-16 border-4 border-t-brand-primary border-slate-200 rounded-full animate-spin"></div>
                <p className="text-white mt-4 text-lg">AI is analyzing... this may take a moment.</p>
            </div>
        )}
        
        {toast && (
            <div className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                {toast.message}
                <button onClick={() => setToast(null)} className="ml-4 font-bold">X</button>
            </div>
        )}
      </div>
      <SearchAgentModal isOpen={isSearchAgentOpen} onClose={() => setSearchAgentOpen(false)} analysis={currentAnalysis} />
    </>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;