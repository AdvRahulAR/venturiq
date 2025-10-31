import React, { useContext, useState, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { Recommendation, GeminiRisk } from '../types';
import { DownloadIcon, MessageCircleIcon } from './icons';
import { LiveChatModal } from './LiveChatModal';

const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
  const getScoreColor = (s: number) => {
    if (s >= 70) return 'text-green-500';
    if (s >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-48 h-48">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle className="text-slate-200 dark:text-slate-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
        <circle className={getScoreColor(score)} strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
      </svg>
      <span className={`absolute text-5xl font-bold ${getScoreColor(score)}`}>{score}</span>
    </div>
  );
};

const RecommendationBadge: React.FC<{ recommendation: Recommendation }> = ({ recommendation }) => {
  const styles = {
    [Recommendation.INVEST]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    [Recommendation.WATCHLIST]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    [Recommendation.PASS]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };
  return <div className={`px-4 py-1 text-sm font-medium rounded-full ${styles[recommendation]}`}>{recommendation}</div>;
};

const RiskPill: React.FC<{ severity: 'High' | 'Medium' | 'Low' }> = ({ severity }) => {
    const styles = {
        'High': 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200',
        'Medium': 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200',
        'Low': 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
    };
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${styles[severity]}`}>{severity}</span>
}

export const AnalysisDashboard: React.FC<{ onNewAnalysis: () => void }> = ({ onNewAnalysis }) => {
  const { currentAnalysis, setIsLoading, setToast } = useContext(AppContext);
  const [showRawJson, setShowRawJson] = useState(false);
  const [isLiveChatOpen, setLiveChatOpen] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  if (!currentAnalysis) {
    return (
      <div className="text-center p-10 text-slate-500">
        <p>No analysis selected. Please start a new analysis or select one from history.</p>
      </div>
    );
  }

  const { companyName, score, recommendation, confidence, fullAnalysis, sector, geography, stage, groundingSources, investorProfile } = currentAnalysis;

  const downloadReport = async () => {
    const { jsPDF } = (window as any).jspdf || {};
    const html2canvas = (window as any).html2canvas;

    if (!jsPDF || !html2canvas) {
        setToast({ message: 'PDF generation library not loaded. Please check your connection and try again.', type: 'error'});
        return;
    }

    const dashboardElement = reportRef.current;
    if (!dashboardElement) {
        setToast({ message: 'Could not find report content to download.', type: 'error'});
        return;
    }
    
    setIsLoading(true);
    setToast({ message: 'Generating PDF report...', type: 'info' });

    try {
        const buttonsContainer = dashboardElement.querySelector('.action-buttons');
        if (buttonsContainer) (buttonsContainer as HTMLElement).style.visibility = 'hidden';

        const linksData: { x: number; y: number; width: number; height: number; url: string }[] = [];
        const dashboardRect = dashboardElement.getBoundingClientRect();
        dashboardElement.querySelectorAll('a[href]').forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
                const linkRect = link.getBoundingClientRect();
                linksData.push({
                    x: linkRect.left - dashboardRect.left,
                    y: linkRect.top - dashboardRect.top,
                    width: linkRect.width,
                    height: linkRect.height,
                    url: href,
                });
            }
        });

        const scale = 2;
        const canvas = await html2canvas(dashboardElement, {
            scale,
            useCORS: true,
            backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#f8fafc',
            allowTaint: true,
            windowWidth: dashboardElement.scrollWidth,
            windowHeight: dashboardElement.scrollHeight,
        });

        if (buttonsContainer) (buttonsContainer as HTMLElement).style.visibility = 'visible';

        const imgData = canvas.toDataURL('image/png', 1.0);
        
        const pdfWidth = canvas.width;
        const pdfHeight = canvas.height;
        
        const pdf = new jsPDF({
            orientation: pdfWidth > pdfHeight ? 'l' : 'p',
            unit: 'px',
            format: [pdfWidth, pdfHeight],
            hotfixes: ['px_scaling'],
        });

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        linksData.forEach(link => {
            pdf.link(link.x * scale, link.y * scale, link.width * scale, link.height * scale, { url: link.url });
        });

        pdf.save(`${companyName.replace(/\s+/g, '_')}_analysis.pdf`);
        setToast({ message: 'PDF report downloaded successfully!', type: 'success' });

    } catch (error) {
        console.error("PDF generation failed:", error);
        setToast({ message: 'Failed to generate PDF report.', type: 'error'});
    } finally {
        setIsLoading(false);
    }
  };
  
  const renderInvestmentThesis = () => {
    const thesis = fullAnalysis.investmentThesis;
    if (typeof thesis === 'string') {
        return thesis.split('\n').filter(line => line.trim().length > 1).map((point, index) => (
            <li key={index}>{point.replace(/^- /, '')}</li>
        ));
    }
    if (Array.isArray(thesis)) {
        return thesis.filter(item => typeof item === 'string' && item.trim()).map((point, index) => (
             <li key={index}>{point.replace(/^- /, '')}</li>
        ));
    }
    return <li>Investment thesis data is not in the expected format.</li>;
  }

  return (
    <>
      <LiveChatModal isOpen={isLiveChatOpen} onClose={() => setLiveChatOpen(false)} analysis={currentAnalysis} />
      <div ref={reportRef} className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">{companyName}</h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 mt-1">{sector} &bull; {geography} &bull; {stage}</p>
            {investorProfile && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 italic">
                  Tailored for: <strong className="text-slate-700 dark:text-slate-200 not-italic">{investorProfile}</strong>
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 action-buttons">
              <button onClick={() => setLiveChatOpen(true)} className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                <MessageCircleIcon className="w-4 h-4 mr-2"/> Live Q&A
              </button>
              <button onClick={downloadReport} className="inline-flex items-center p-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                <DownloadIcon className="w-4 h-4"/>
              </button>
              <button onClick={onNewAnalysis} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-primary/90">
                  New Analysis
              </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex flex-col items-center">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Overall Score</h2>
              <ScoreGauge score={score} />
              <div className="mt-6 flex flex-col items-center space-y-3">
                <RecommendationBadge recommendation={recommendation} />
                <div className="text-sm text-slate-500 dark:text-slate-400">Confidence: <strong>{confidence}</strong></div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Scores Breakdown</h2>
              <div className="space-y-4">
                  {Object.entries(fullAnalysis.scores).map(([key, value]) => (
                      <div key={key}>
                          <div className="flex justify-between items-baseline mb-1">
                              <span className="text-sm font-medium text-slate-800 dark:text-slate-200 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                              <span className="text-sm font-bold text-brand-primary">{value.score} / 100</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div className="bg-brand-primary h-2 rounded-full" style={{ width: `${value.score}%` }}></div>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">{value.reasoning}</p>
                      </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-2 space-y-8">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Executive Summary</h2>
                  <p className="text-slate-600 dark:text-slate-300">{fullAnalysis.executiveSummary}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Investment Thesis</h2>
                  <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                      {renderInvestmentThesis()}
                  </ul>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Key Risks</h2>
                  <ul className="space-y-3">
                      {fullAnalysis.keyRisks.map((risk: GeminiRisk, index: number) => (
                          <li key={index} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                              <div className="flex justify-between items-start mb-1">
                                  <p className="font-semibold text-slate-800 dark:text-slate-200">{risk.risk}</p>
                                  <RiskPill severity={risk.severity} />
                              </div>
                              <p className="text-sm text-slate-500 dark:text-slate-400"><strong>Mitigation:</strong> {risk.mitigation}</p>
                          </li>
                      ))}
                  </ul>
              </div>
              
               <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Benchmark Comparison</h2>
                  <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{fullAnalysis.benchmarkComparison}</p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Data Gaps & Follow-up Questions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Data Gaps</h3>
                          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-sm">
                              {fullAnalysis.dataGaps.map((gap, i) => <li key={i}>{gap}</li>)}
                          </ul>
                      </div>
                      <div>
                          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Follow-up Questions</h3>
                          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-sm">
                              {fullAnalysis.followUpQuestions.map((q, i) => <li key={i}>{q}</li>)}
                          </ul>
                      </div>
                  </div>
              </div>
              
              {groundingSources && groundingSources.length > 0 && (
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Sources</h2>
                       <ul className="space-y-2">
                          {groundingSources.map((source, index) => (
                              <li key={index}>
                                  <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-primary hover:underline">
                                      {source.title || source.uri}
                                  </a>
                              </li>
                          ))}
                      </ul>
                  </div>
              )}
              
              <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Raw JSON Output</h2>
                      <button onClick={() => setShowRawJson(!showRawJson)} className="text-sm font-medium text-brand-primary">{showRawJson ? 'Hide' : 'Show'}</button>
                  </div>
                  {showRawJson && (
                      <pre className="mt-4 bg-slate-100 dark:bg-slate-900 p-4 rounded-md overflow-x-auto text-xs text-slate-800 dark:text-slate-200">
                          {JSON.stringify(fullAnalysis, null, 2)}
                      </pre>
                  )}
              </div>

          </div>
        </div>
      </div>
    </>
  );
};