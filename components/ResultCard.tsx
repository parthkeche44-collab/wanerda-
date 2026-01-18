
import React from 'react';
import { FactCheckResult, Verdict } from '../types.ts';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ResultCardProps {
  result: FactCheckResult;
}

const VerdictBadge: React.FC<{ verdict: Verdict }> = ({ verdict }) => {
  const colors: Record<Verdict, string> = {
    [Verdict.TRUE]: 'bg-green-100 text-green-800 border-green-200',
    [Verdict.FALSE]: 'bg-red-100 text-red-800 border-red-200',
    [Verdict.MISLEADING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [Verdict.UNVERIFIED]: 'bg-gray-100 text-gray-800 border-gray-200',
    [Verdict.PARTS_TRUE]: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  const icons: Record<Verdict, string> = {
    [Verdict.TRUE]: 'fa-circle-check',
    [Verdict.FALSE]: 'fa-circle-xmark',
    [Verdict.MISLEADING]: 'fa-triangle-exclamation',
    [Verdict.UNVERIFIED]: 'fa-circle-question',
    [Verdict.PARTS_TRUE]: 'fa-circle-half-stroke',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${colors[verdict]}`}>
      <i className={`fa-solid ${icons[verdict]} mr-2`}></i>
      {verdict}
    </span>
  );
};

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const chartData = [
    { name: 'Credibility', value: result.credibilityScore },
    { name: 'Remaining', value: 100 - result.credibilityScore },
  ];

  const COLORS = [
    result.credibilityScore > 70 ? '#22c55e' : result.credibilityScore > 40 ? '#f59e0b' : '#ef4444',
    '#e2e8f0'
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Left Side: Score Visualization */}
          <div className="w-full md:w-1/3 flex flex-col items-center">
            <div className="h-48 w-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-bold text-slate-800">{result.credibilityScore}%</span>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Credibility</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <VerdictBadge verdict={result.verdict} />
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="w-full md:w-2/3">
            <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2">
              "{result.claim}"
            </h3>
            
            <div className="prose prose-slate max-w-none">
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Analysis Breakdown</h4>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap italic">
                {result.analysis}
              </p>
            </div>

            {result.sources.length > 0 && (
              <div className="mt-8">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Verification Sources</h4>
                <div className="flex flex-wrap gap-2">
                  {result.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 bg-slate-50 hover:bg-slate-100 text-blue-600 rounded-lg border border-slate-200 text-sm transition-colors group"
                    >
                      <span className="max-w-[150px] truncate">{source.title}</span>
                      <i className="fa-solid fa-arrow-up-right-from-square ml-2 text-xs opacity-50 group-hover:opacity-100 transition-opacity"></i>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
        <span>Analyzed by VeriFact AI Engine</span>
        <span>{new Date(result.timestamp).toLocaleString()}</span>
      </div>
    </div>
  );
};

export default ResultCard;
