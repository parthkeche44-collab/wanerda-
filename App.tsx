
import React, { useState, useEffect, useCallback } from 'react';
import { FactCheckResult, AppState } from './types.ts';
import { analyzeNews } from './geminiService.ts';
import ResultCard from './components/ResultCard.tsx';

const App: React.FC = () => {
  const [claim, setClaim] = useState('');
  const [state, setState] = useState<AppState>({
    history: [],
    isAnalyzing: false,
    error: null,
    currentResult: null,
  });

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('verifact_history');
    if (saved) {
      try {
        setState(prev => ({ ...prev, history: JSON.parse(saved) }));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('verifact_history', JSON.stringify(state.history));
  }, [state.history]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claim.trim() || state.isAnalyzing) return;

    setState(prev => ({ ...prev, isAnalyzing: true, error: null, currentResult: null }));

    try {
      const result = await analyzeNews(claim);
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        currentResult: result,
        history: [result, ...prev.history].slice(0, 10), // Keep last 10
      }));
      setClaim('');
    } catch (err: any) {
      setState(prev => ({ ...prev, isAnalyzing: false, error: err.message }));
    }
  };

  const clearHistory = useCallback(() => {
    setState(prev => ({ ...prev, history: [] }));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <i className="fa-solid fa-shield-halved text-white text-xl"></i>
            </div>
            <span className="text-2xl font-black text-slate-800 tracking-tight">VeriFact</span>
          </div>
          <div className="hidden md:flex space-x-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-blue-600 transition-colors">How it works</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Resources</a>
            <a href="#" className="hover:text-blue-600 transition-colors">API</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
              Combat Misinformation with AI
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Verify news claims, viral social media posts, and news snippets instantly using Gemini's search-grounded fact-checking engine.
            </p>
          </div>

          {/* Input Area */}
          <div className="bg-white rounded-2xl shadow-xl p-2 mb-12 border border-slate-100">
            <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-2">
              <input
                type="text"
                placeholder="Paste a headline, claim, or news URL here..."
                className="flex-grow px-6 py-4 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg"
                value={claim}
                onChange={(e) => setClaim(e.target.value)}
                disabled={state.isAnalyzing}
              />
              <button
                type="submit"
                disabled={state.isAnalyzing || !claim.trim()}
                className={`px-8 py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center space-x-2 min-w-[160px] ${
                  state.isAnalyzing 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-95'
                }`}
              >
                {state.isAnalyzing ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <span>Analyze</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Error Message */}
          {state.error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center">
              <i className="fa-solid fa-circle-exclamation mr-3 text-lg"></i>
              {state.error}
            </div>
          )}

          {/* Results Area */}
          {state.currentResult && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Analysis Results</h2>
              </div>
              <ResultCard result={state.currentResult} />
            </div>
          )}

          {/* History / Recent Checks */}
          {state.history.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">Recent Verifications</h2>
                <button 
                  onClick={clearHistory}
                  className="text-sm text-slate-400 hover:text-red-500 transition-colors"
                >
                  Clear History
                </button>
              </div>
              <div className="space-y-4">
                {state.history.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => setState(prev => ({ ...prev, currentResult: item }))}
                    className={`p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-all cursor-pointer flex items-center justify-between group ${state.currentResult?.id === item.id ? 'ring-2 ring-blue-500 border-transparent' : ''}`}
                  >
                    <div className="flex items-center space-x-4 overflow-hidden">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        item.credibilityScore > 70 ? 'bg-green-100 text-green-600' : 
                        item.credibilityScore > 40 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                      }`}>
                        <span className="font-bold text-sm">{item.credibilityScore}%</span>
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-slate-900 truncate max-w-[200px] md:max-w-md">
                          {item.claim}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <i className="fa-solid fa-chevron-right text-slate-300 group-hover:text-blue-500 transition-colors"></i>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 text-white mb-4">
                <i className="fa-solid fa-shield-halved text-blue-500"></i>
                <span className="text-xl font-bold">VeriFact</span>
              </div>
              <p className="text-sm">
                Empowering individuals and journalists with state-of-the-art AI technology to verify information in real-time.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Fact-Checking Guide</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Connect</h4>
              <div className="flex space-x-4 text-xl">
                <a href="#" className="hover:text-white"><i className="fa-brands fa-twitter"></i></a>
                <a href="#" className="hover:text-white"><i className="fa-brands fa-github"></i></a>
                <a href="#" className="hover:text-white"><i className="fa-brands fa-linkedin"></i></a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-xs">
            &copy; {new Date().getFullYear()} VeriFact AI. Powered by Gemini & Google Search Grounding.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
