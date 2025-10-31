import React, { useState, useCallback, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Sector, Geography, Stage, Weightages, AnalysisInput } from '../types';
import { SECTOR_OPTIONS, GEOGRAPHY_OPTIONS, STAGE_OPTIONS, DEFAULT_WEIGHTAGES } from '../constants';
import { analyzeStartup } from '../services/geminiService';
import { calculateScore, getRecommendation } from '../services/scoreCalculator';
import { UploadCloudIcon, FileTextIcon, WandSparklesIcon } from './icons';

interface AnalysisFormProps {
  onAnalysisComplete: () => void;
}

export const AnalysisForm: React.FC<AnalysisFormProps> = ({ onAnalysisComplete }) => {
  const { addAnalysisToHistory, setCurrentAnalysis, setIsLoading, setToast } = useContext(AppContext);

  const [companyName, setCompanyName] = useState('');
  const [sector, setSector] = useState<Sector>(Sector.SAAS);
  const [geography, setGeography] = useState<Geography>(Geography.INDIA);
  const [stage, setStage] = useState<Stage>(Stage.SEED);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; mimeType: string; data: string } | null>(null);
  const [founderNotes, setFounderNotes] = useState('');
  const [publicUrls, setPublicUrls] = useState('');
  const [investorProfile, setInvestorProfile] = useState('');
  const [weightages, setWeightages] = useState<Weightages>(DEFAULT_WEIGHTAGES);
  const [showWeights, setShowWeights] = useState(false);

  const handleFileChange = useCallback(async (file: File | null) => {
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setToast({ message: 'Please upload a file smaller than 10MB.', type: 'error' });
        return;
      }
      
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];

      if (!allowedTypes.includes(file.type)) {
          setToast({ message: 'Unsupported file type. Please upload a PDF, DOC, DOCX, PPT, or PPTX file.', type: 'error'});
          return;
      }

      setUploadedFile(null);
      setIsLoading(true);

      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = (reader.result as string).split(',')[1];
          setUploadedFile({
            name: file.name,
            mimeType: file.type,
            data: base64Data,
          });
          setToast({ message: `File '${file.name}' processed successfully.`, type: 'success' });
          setIsLoading(false);
        };
        reader.onerror = () => {
          setToast({ message: 'Error reading file.', type: 'error' });
          setIsLoading(false);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        setToast({ message: error instanceof Error ? error.message : 'File processing failed.', type: 'error' });
        setIsLoading(false);
      }
    }
  }, [setToast, setIsLoading]);

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeightages({ ...weightages, [e.target.name]: parseInt(e.target.value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
        setToast({ message: 'Company name is required.', type: 'error' });
        return;
    }
    if (!uploadedFile) {
        setToast({ message: 'Please upload a pitch deck or document.', type: 'error' });
        return;
    }

    setIsLoading(true);
    const input: AnalysisInput = {
      companyName, sector, geography, stage,
      pitchDeckFile: uploadedFile, founderNotes, publicUrls, weightages, investorProfile
    };

    try {
      const { result: analysisResult, sources } = await analyzeStartup(input);
      const score = calculateScore(analysisResult, weightages);
      const recommendation = getRecommendation(score, analysisResult.confidence);

      const finalAnalysis = {
        id: new Date().toISOString(),
        timestamp: Date.now(),
        companyName, sector, geography, stage,
        score, recommendation, confidence: analysisResult.confidence,
        fullAnalysis: analysisResult,
        groundingSources: sources,
        investorProfile: investorProfile.trim() || undefined,
      };

      addAnalysisToHistory(finalAnalysis);
      setCurrentAnalysis(finalAnalysis);
      setToast({ message: `Analysis for ${companyName} complete!`, type: 'success' });
      onAnalysisComplete();
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : 'Analysis failed.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Startup Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Company Name</label>
                <input type="text" id="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-slate-900 dark:text-white" />
              </div>
              <div>
                <label htmlFor="sector" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Sector</label>
                <select id="sector" value={sector} onChange={e => setSector(e.target.value as Sector)} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-slate-900 dark:text-white">
                  {SECTOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="geography" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Geography</label>
                <select id="geography" value={geography} onChange={e => setGeography(e.target.value as Geography)} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-slate-900 dark:text-white">
                  {GEOGRAPHY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="stage" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Stage</label>
                <select id="stage" value={stage} onChange={e => setStage(e.target.value as Stage)} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-slate-900 dark:text-white">
                  {STAGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Input Data</h2>
            
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pitch Deck / Document</label>
                <div onDragOver={handleDragOver} onDrop={handleDrop} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        <UploadCloudIcon className="mx-auto h-12 w-12 text-slate-400" />
                        <div className="flex text-sm text-slate-600 dark:text-slate-400">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-brand-primary hover:text-brand-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-primary">
                                <span>Upload a file</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={e => handleFileChange(e.target.files ? e.target.files[0] : null)} />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-slate-500">PDF, DOCX, PPTX up to 10MB</p>
                    </div>
                </div>
                {uploadedFile && (
                    <div className="mt-4 flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 rounded-md">
                        <div className="flex items-center space-x-3">
                            <FileTextIcon className="w-6 h-6 text-brand-primary" />
                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{uploadedFile.name}</span>
                        </div>
                        <span className="text-sm text-green-600 dark:text-green-400">Ready for analysis</span>
                    </div>
                )}
            </div>

            <div>
                <label htmlFor="founderNotes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Founder Notes</label>
                <textarea id="founderNotes" rows={4} value={founderNotes} onChange={e => setFounderNotes(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-slate-900 dark:text-white" placeholder="Paste founder emails, call notes, updates..."></textarea>
            </div>

            <div>
                <label htmlFor="publicUrls" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Public URLs</label>
                <input type="text" id="publicUrls" value={publicUrls} onChange={e => setPublicUrls(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-slate-900 dark:text-white" placeholder="https://example.com, https://techcrunch.com/..." />
                 <p className="text-xs text-slate-500 mt-1">Comma-separated URLs for the AI to research.</p>
            </div>
            
            <div>
                <label htmlFor="investorProfile" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Investor Profile (Optional)</label>
                <textarea id="investorProfile" rows={3} value={investorProfile} onChange={e => setInvestorProfile(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-slate-900 dark:text-white" placeholder="Enter an investor's name, fund, or investment thesis (e.g., 'Sequoia Capital', 'Andreessen Horowitz', 'Focus on social impact startups')"></textarea>
                <p className="text-xs text-slate-500 mt-1">Tailor the analysis to a specific investor's perspective.</p>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md">
            <button type="button" onClick={() => setShowWeights(!showWeights)} className="text-lg font-semibold text-slate-900 dark:text-white w-full text-left">
                Custom Weightages {showWeights ? '(-)' : '(+)'}
            </button>
            {showWeights && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-6">
                    {Object.entries(weightages).map(([key, value]) => (
                        <div key={key}>
                            <label htmlFor={key} className="block text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                            <input type="number" id={key} name={key} value={value} onChange={handleWeightChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-slate-900 dark:text-white" />
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div className="flex justify-end">
            <button type="submit" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-slate-900">
                <WandSparklesIcon className="w-5 h-5 mr-2" />
                Analyze Startup
            </button>
        </div>
      </form>
    </div>
  );
};