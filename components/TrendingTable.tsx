
import React from 'react';
import { Song } from '../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  songs: Song[];
}

export const TrendingTable: React.FC<Props> = ({ songs }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/50">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-800/50 text-zinc-400 uppercase text-xs font-semibold">
          <tr>
            <th className="px-6 py-4">Rank</th>
            <th className="px-6 py-4">Track Info</th>
            <th className="px-6 py-4">Genre</th>
            <th className="px-6 py-4">Daily Streams</th>
            <th className="px-6 py-4">Score</th>
            <th className="px-6 py-4">Trend</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {songs.map((song) => (
            <tr key={song.id} className="hover:bg-zinc-800/30 transition-colors">
              <td className="px-6 py-4 font-bold text-zinc-500 text-lg">
                #{song.rank}
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-semibold text-zinc-100">{song.title}</span>
                  <span className="text-zinc-500 text-xs">{song.artist}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                  {song.genre}
                </span>
              </td>
              <td className="px-6 py-4 text-zinc-400">
                {song.dailyStreams}M
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500" 
                      style={{ width: `${song.popularityScore}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-zinc-400">{song.popularityScore}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                {song.trend === 'up' && <TrendingUp className="text-emerald-400 w-5 h-5" />}
                {song.trend === 'down' && <TrendingDown className="text-rose-400 w-5 h-5" />}
                {song.trend === 'steady' && <Minus className="text-zinc-600 w-5 h-5" />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
