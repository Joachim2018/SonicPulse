
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Music, TrendingUp, Download, RefreshCw, Sparkles, ExternalLink,
  Github, Database, Activity, Info
} from 'lucide-react';
import { Song, AnalyticsData, LoadingState } from './types';
import { fetchTrendingMusic, getAIPredictions } from './services/geminiService';
import { TrendingTable } from './components/TrendingTable';
import { MusicCharts } from './components/MusicCharts';

const App: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<LoadingState>(LoadingState.IDLE);
  const [prediction, setPrediction] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(LoadingState.SEARCHING);
      setError(null);
      const result = await fetchTrendingMusic();
      setData(result);
      setLoading(LoadingState.IDLE);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch real-time music data. Please try again.');
      setLoading(LoadingState.ERROR);
    }
  }, []);

  const handlePredict = async () => {
    if (!data) return;
    try {
      setLoading(LoadingState.ANALYZING);
      const insight = await getAIPredictions(data.songs);
      setPrediction(insight);
      setLoading(LoadingState.IDLE);
    } catch (err) {
      console.error(err);
      setLoading(LoadingState.IDLE);
    }
  };

  const exportToCSV = () => {
    if (!data) return;
    const headers = ['Rank', 'Title', 'Artist', 'Genre', 'Daily Streams (M)', 'Popularity Score', 'Trend'];
    const rows = data.songs.map(s => [
      s.rank,
      `"${s.title}"`,
      `"${s.artist}"`,
      s.genre,
      s.dailyStreams,
      s.popularityScore,
      s.trend
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `trending_music_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen pb-12 flex flex-col">
      {/* Header */}
      <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Music className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">SonicPulse</h1>
                <p className="text-[10px] text-zinc-500 font-medium tracking-widest uppercase">Music Intelligence</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={loadData}
                disabled={loading !== LoadingState.IDLE}
                className="p-2 text-zinc-400 hover:text-white transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className={`w-5 h-5 ${loading === LoadingState.SEARCHING ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={exportToCSV}
                disabled={!data}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex-1">
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-3">
            <Info className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2 text-zinc-500">
              <span className="text-sm font-medium uppercase tracking-wider">Top Artist</span>
              <Activity className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-zinc-100 truncate">
              {data?.songs[0]?.artist || 'Loading...'}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Leading global charts</p>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2 text-zinc-500">
              <span className="text-sm font-medium uppercase tracking-wider">Dominant Genre</span>
              <Database className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-bold text-zinc-100">
              {data ? data.songs.reduce((acc, curr) => {
                const count = data.songs.filter(s => s.genre === curr.genre).length;
                return count > acc.count ? { genre: curr.genre, count } : acc;
              }, { genre: '', count: 0 }).genre : 'Loading...'}
            </p>
            <p className="text-xs text-zinc-500 mt-1">High distribution volume</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2 text-zinc-500">
              <span className="text-sm font-medium uppercase tracking-wider">Last Sync</span>
              <TrendingUp className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-zinc-100">
              {data?.lastUpdated || '--:--'}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Real-time market check</p>
          </div>
        </div>

        {/* Charts Section */}
        {data && <div className="mb-10"><MusicCharts songs={data.songs} /></div>}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                Trending Pulse
                <span className="text-xs font-normal text-zinc-500">Top 10 Worldwide</span>
              </h2>
            </div>
            
            {!data && loading !== LoadingState.IDLE ? (
              <div className="h-96 bg-zinc-900/50 rounded-xl border border-zinc-800 animate-pulse flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-zinc-500 font-medium">Extracting global trends via Gemini Search...</p>
              </div>
            ) : data ? (
              <TrendingTable songs={data.songs} />
            ) : null}

            {data?.sources && data.sources.length > 0 && (
              <div className="mt-6 p-4 bg-zinc-900/30 rounded-lg border border-zinc-800">
                <h4 className="text-xs font-bold text-zinc-500 uppercase mb-3 tracking-widest flex items-center gap-2">
                   Grounding Sources
                </h4>
                <div className="flex flex-wrap gap-3">
                  {data.sources.map((src, idx) => (
                    <a 
                      key={idx} 
                      href={src.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-800 rounded-full text-[10px] text-zinc-400 hover:text-white transition-colors border border-zinc-700/50"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {src.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="w-20 h-20 text-indigo-500" />
              </div>
              <h3 className="text-lg font-bold text-zinc-100 mb-2 flex items-center gap-2">
                AI Insight Engine
              </h3>
              <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                {data?.summary || 'Fetch trends to see AI summary of the current music landscape.'}
              </p>
              
              <button 
                onClick={handlePredict}
                disabled={!data || loading === LoadingState.ANALYZING}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading === LoadingState.ANALYZING ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                Generate 90-Day Forecast
              </button>

              {prediction && (
                <div className="mt-6 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 animate-in fade-in slide-in-from-bottom-2">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase mb-3 tracking-widest">Analysis Result</h4>
                  <div className="text-zinc-300 text-sm space-y-3 prose prose-invert custom-scrollbar max-h-60 overflow-y-auto pr-2">
                    {prediction.split('\n').map((para, idx) => para.trim() && (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h4 className="text-zinc-100 font-semibold mb-4 flex items-center gap-2">
                <Github className="w-5 h-5" /> About SonicPulse
              </h4>
              <p className="text-zinc-500 text-xs leading-relaxed mb-4">
                This dashboard utilizes the Gemini 3 Flash model with Google Search grounding to synthesize scattered data points from billboard charts, streaming platform API snippets, and news into a cohesive analytics view.
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-[10px] text-zinc-500">
                  <span>Model</span>
                  <span className="text-zinc-300">gemini-3-flash-preview</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-zinc-500">
                  <span>Data Latency</span>
                  <span className="text-emerald-500">Near Real-Time</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-zinc-500">
                  <span>Grounding</span>
                  <span className="text-indigo-400">Enabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-zinc-800 py-8 text-center">
        <p className="text-zinc-600 text-sm">
          Powered by Google Gemini API &bull; Built for Music Analysts
        </p>
      </footer>
    </div>
  );
};

export default App;
