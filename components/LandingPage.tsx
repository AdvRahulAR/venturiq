import React from 'react';
import { FileTextIcon, UserCheckIcon, SearchIcon, MessageCircleIcon, ShieldCheckIcon, DownloadIcon, UploadCloudIcon, WandSparklesIcon, ClipboardCheckIcon, UserIcon, BuildingOffice2Icon, HomeModernIcon, RocketLaunchIcon } from './icons';

interface LandingPageProps {
  onStart: () => void;
  onViewDemo: () => void;
}

const features = [
  {
    name: 'Deep Document Analysis',
    description: 'Automatically extracts and synthesizes key information from pitch decks, founder notes, and financial models. Go from document to deal memo in minutes.',
    icon: FileTextIcon,
  },
  {
    name: 'Personalized Investor Lens',
    description: "Tailor every analysis to a specific investor's profile, fund, or thesis. The AI researches their preferences to generate recommendations from their unique perspective.",
    icon: UserCheckIcon,
  },
  {
    name: 'Live Research Assistant',
    description: 'Connects to Google Search in real-time to fact-check claims, analyze competitors, and discuss current events with cited sources, all within your analysis context.',
    icon: SearchIcon,
  },
  {
    name: 'Interactive Voice Q&A',
    description: 'Have a live, natural language conversation with your AI analyst. Dive deeper into the analysis, ask follow-up questions, and get real-time audio responses.',
    icon: MessageCircleIcon,
  },
  {
    name: 'Professional PDF Reports',
    description: 'Download any analysis as a cleanly formatted, shareable PDF. Perfect for team briefings, archiving, or sharing with your investment committee.',
    icon: DownloadIcon,
  },
  {
    name: 'Privacy-First Architecture',
    description: 'All document processing happens locally in your browser. Your sensitive data is never stored on a server, ensuring complete confidentiality.',
    icon: ShieldCheckIcon,
  },
];

const howItWorksSteps = [
    {
        name: '1. Upload & Input',
        description: 'Securely upload a pitch deck and add relevant founder notes, public URLs, or a specific investor profile to tailor the analysis.',
        icon: UploadCloudIcon,
    },
    {
        name: '2. AI Analyzes',
        description: "VenturIQ's advanced AI performs a deep, multi-faceted analysis, leveraging real-time Google Search to ground its insights in current market data.",
        icon: WandSparklesIcon,
    },
    {
        name: '3. Receive Insights',
        description: 'Get a comprehensive, investor-grade report with a clear recommendation, downloadable as a PDF in minutes.',
        icon: ClipboardCheckIcon,
    },
];

const whoIsItFor = [
    {
        name: 'Angel Investors',
        description: 'Make faster, data-driven decisions on individual deals without the overhead of a full analyst team.',
        icon: UserIcon,
    },
    {
        name: 'Venture Capitalists',
        description: 'Accelerate your deal flow screening and free up your team to focus on high-potential opportunities and due diligence.',
        icon: BuildingOffice2Icon,
    },
    {
        name: 'Family Offices',
        description: 'Evaluate direct investment opportunities with institutional-grade rigor and personalized analysis.',
        icon: HomeModernIcon,
    },
    {
        name: 'Accelerators',
        description: 'Quickly assess and benchmark a high volume of applicants to identify the most promising startups for your cohort.',
        icon: RocketLaunchIcon,
    },
];


export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onViewDemo }) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="text-center">
               <div className="flex items-center justify-center mb-4">
                   <img src="https://lh3.googleusercontent.com/d/1yFaPb6VldctsJRRA-ILgWPd1lOFkzIhk" alt="VenturIQ Logo" className="w-16 h-16" />
               </div>
              <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
                <span className="block xl:inline">The AI Co-pilot for</span>{' '}
                <span className="block text-brand-primary xl:inline">Smarter Investing</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-slate-500 dark:text-slate-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                VenturIQ transforms unstructured startup data into investor-grade insights. Perform deep, unbiased analysis in minutes, not days, and make decisions with confidence.
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <button
                    onClick={onStart}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-brand-primary hover:bg-brand-primary/90 md:py-4 md:text-lg md:px-10"
                  >
                    Start New Analysis
                  </button>
                </div>
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                    <button
                        onClick={onViewDemo}
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-brand-primary bg-white hover:bg-slate-50 md:py-4 md:text-lg md:px-10 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                    >
                        View Demo Analysis
                    </button>
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base font-semibold text-brand-primary tracking-wide uppercase">How It Works</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Get Started in Three Simple Steps
            </p>
            <p className="mt-4 max-w-2xl text-xl text-slate-500 dark:text-slate-400 lg:mx-auto">
              Our streamlined process takes you from raw data to actionable intelligence with minimal effort.
            </p>
          </div>
          
          <div className="mt-12">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
              {howItWorksSteps.map((step) => (
                <div key={step.name} className="text-center">
                  <div className="flex items-center justify-center h-20 w-20 mx-auto bg-brand-primary/10 rounded-full">
                    <step.icon className="h-10 w-10 text-brand-primary" aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">{step.name}</h3>
                  <p className="mt-2 text-base text-slate-500 dark:text-slate-400">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 sm:py-24 bg-slate-100/50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
                <h2 className="text-base font-semibold text-brand-primary tracking-wide uppercase">Features</h2>
                <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                    An Unparalleled Edge in Venture Investing
                </p>
                <p className="mt-4 max-w-2xl text-xl text-slate-500 dark:text-slate-400 lg:mx-auto">
                    VenturIQ provides a suite of powerful, integrated tools designed to help you source, analyze, and decide with greater speed and accuracy.
                </p>
            </div>

            <div className="mt-12">
                <dl className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                    <div key={feature.name} className="flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                        <dt className="flex items-center">
                            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-brand-primary text-white">
                                <feature.icon className="h-6 w-6" aria-hidden="true" />
                            </div>
                            <p className="ml-4 text-lg leading-6 font-bold text-slate-900 dark:text-white">{feature.name}</p>
                        </dt>
                        <dd className="mt-2 flex-1 text-base text-slate-500 dark:text-slate-400">{feature.description}</dd>
                    </div>
                    ))}
                </dl>
            </div>
        </div>
      </div>

      {/* Who Is This For Section */}
      <div className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
                <h2 className="text-base font-semibold text-brand-primary tracking-wide uppercase">Who Is This For?</h2>
                <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                    Built for the Modern Investor
                </p>
                <p className="mt-4 max-w-2xl text-xl text-slate-500 dark:text-slate-400 lg:mx-auto">
                    Whether you're a solo investor or part of a large fund, VenturIQ is designed to fit your workflow.
                </p>
            </div>
            
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {whoIsItFor.map((audience) => (
                <div key={audience.name} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10">
                    <audience.icon className="h-6 w-6 text-brand-primary" aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 text-lg font-medium text-slate-900 dark:text-white">{audience.name}</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{audience.description}</p>
                </div>
              ))}
            </div>
        </div>
      </div>

    </div>
  );
};