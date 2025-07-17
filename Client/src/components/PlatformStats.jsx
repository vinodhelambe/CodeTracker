import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {  data } from '../api/fileService';


// Utility: Get solved count from Codeforces using backend API
async function getSolvedCountCodeforces(handle) {
  try {
    // Use the codeforces function from fileService.js with the handle parameter
    const res = await data.codeforces(handle);
    const submissions = res.submissions;
    
    if (submissions.status !== 'OK') {
      throw new Error('CF submissions API error: ' + submissions.comment);
    }

    // Count solved problems
    const solved = new Set();
    for (const sub of submissions.result) {
      if (sub.verdict === 'OK') {
        solved.add(`${sub.problem.contestId}-${sub.problem.index}`);
      }
    }
    return solved.size;
  } catch (error) {
    console.error('Error getting solved count:', error);
    return 0;
  }
}

// Platform API configurations
const PLATFORM_CONFIGS = [
  {
    name: 'Codeforces',
    key: 'codeforces',
    username: 'vinodghelambe',
    api: async (username) => {
      try {
        if (!username || username.trim() === '') {
          throw new Error('Invalid username');
        }

        // Use backend API to get filtered Codeforces stats
        const res = await data.codeforces(username);

        // If backend returns error
        if (res.error) {
          throw new Error('Codeforces API error');
        }

        // The backend already returns the filtered object
        return res;
      } catch (error) {
        console.error('Error fetching Codeforces data:', error);
        return { error: true };
      }
    }
  },
  {
    name: 'LeetCode',
    key: 'leetcode',
    username: 'VinodHelambe',
    api: async (username) => {
      try {
        if (!username || username.trim() === '') {
          throw new Error('Invalid username');
        }

       
        const res = await data.leetcode(username);

        // If backend returns error
        if (res.error) {
          throw new Error('LeetCode API error');
        }
        // The backend already returns the filtered object
        return res;
      } catch (error) {
        console.error('Error fetching LeetCode data:', error);
        return { error: true };
      }
    }
  },
  {
    name: 'HackerRank',
    key: 'hackerrank',
    username: 'vinodghelambe',
    api: async (username) => {
      try {
        if (!username || username.trim() === '') {
          throw new Error('Invalid username');
        }

        // Use backend API to get filtered HackerRank stats
        const res = await data.hackerRank(username);

        // If backend returns error
        if (res.error) {
          throw new Error('HackerRank API error');
        }

        // The backend already returns the filtered object
        return res;
      } catch (error) {
        console.error('Error fetching HackerRank data:', error);
        return { error: true };
      }
    }
  }
];

const PLATFORM_LIST = [
  { key: 'codeforces', name: 'Codeforces' },
  { key: 'leetcode', name: 'LeetCode' },
  { key: 'hackerrank', name: 'HackerRank' },
];

function getPlatformConfig(key, username) {
  const base = PLATFORM_CONFIGS.find(p => p.key === key);
  return { ...base, username };
}

const PlatformCard = ({ platform, data, children, controls }) => {
  const handleCardClick = (e) => {
    if (e.target.closest('.card-controls')) return; // Don't trigger on controls
    if (data.error) return;
    let url = '';
    switch (platform.key) {
      case 'codeforces':
        url = `https://codeforces.com/profile/${data.username}`;
        break;
      case 'leetcode':
        url = `https://leetcode.com/u/${data.username}`;
        break;
      case 'hackerrank':
        url = `https://www.hackerrank.com/profile/${data.username}`;
        break;
      default:
        return;
    }
    window.open(url, '_blank');
  };

  return (
    <div
      className={`bg-gray-800 p-4 rounded-lg border cursor-pointer hover:bg-gray-700 transition-colors duration-200 min-h-64 flex flex-col justify-between ${platform.key === 'codeforces' ? 'border-blue-500' : platform.key === 'leetcode' ? 'border-yellow-500' : 'border-green-500'}`}
      onClick={handleCardClick}
      title={`Click to visit ${platform.name} profile`}
      style={{height: '100%'}}
    >
      {children}
      <div className="mt-4 flex justify-end card-controls">{controls}</div>
    </div>
  );
};

const CACHE_KEY = 'platform_stats_cache_v1';
const PLATFORM_LIST_KEY = 'platforms_list_v1';

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

function saveCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

function loadPlatforms() {
  try {
    const raw = localStorage.getItem(PLATFORM_LIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function savePlatforms(platforms) {
  try {
    localStorage.setItem(PLATFORM_LIST_KEY, JSON.stringify(platforms));
  } catch {}
}

const PlatformStats = () => {
  const [platforms, setPlatforms] = useState(loadPlatforms()); // [{key, username}]
  const [input, setInput] = useState({ platform: '', username: '' });
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [editIdx, setEditIdx] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [cache, setCache] = useState(loadCache());

  // Add platform handler
  const handleAddPlatform = (e) => {
    e.preventDefault();
    if (!input.platform || !input.username.trim()) return;
    if (platforms.some(p => p.key === input.platform)) return;
    const newPlatforms = [...platforms, { key: input.platform, username: input.username.trim() }];
    setPlatforms(newPlatforms);
    savePlatforms(newPlatforms);
    setInput({ platform: '', username: '' });
  };

  // Remove platform
  const handleRemove = (key) => {
    const newPlatforms = platforms.filter(p => p.key !== key);
    setPlatforms(newPlatforms);
    savePlatforms(newPlatforms);
    setStats(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
    // Remove from cache as well
    const newCache = { ...cache };
    Object.keys(newCache).forEach(k => {
      if (k.startsWith(key + ':')) delete newCache[k];
    });
    setCache(newCache);
    saveCache(newCache);
  };

  // Edit username
  const handleEdit = (idx) => {
    setEditIdx(idx);
    setEditValue(platforms[idx].username);
  };
  const handleEditSave = (idx) => {
    if (!editValue.trim()) return;
    const newPlatforms = platforms.map((p, i) => i === idx ? { ...p, username: editValue.trim() } : p);
    setPlatforms(newPlatforms);
    savePlatforms(newPlatforms);
    setEditIdx(null);
    // Remove old cache for this platform (in case username changed)
    const oldKey = `${platforms[idx].key}:${platforms[idx].username}`;
    const newCache = { ...cache };
    delete newCache[oldKey];
    setCache(newCache);
    saveCache(newCache);
  };

  // Fetch stats for all platforms
  const fetchStats = async () => {
    setLoading(true);
    let newStats = { ...stats };
    let newCache = { ...cache };
    const promises = platforms.map(async (p) => {
      const config = getPlatformConfig(p.key, p.username);
      const cacheKey = `${p.key}:${p.username}`;
      // Use cache if available
      if (newCache[cacheKey]) {
        newStats[p.key] = newCache[cacheKey].data;
        return;
      }
      try {
        const data = await config.api(p.username);
        newStats[p.key] = data;
        newCache[cacheKey] = { data };
      } catch {
        newStats[p.key] = { error: true };
      }
    });
    await Promise.all(promises);
    setStats(newStats);
    setCache(newCache);
    saveCache(newCache);
    setLastUpdated(new Date());
    setLoading(false);
  };

  // On mount, load platforms and stats from localStorage
  useEffect(() => {
    setCache(loadCache());
    setPlatforms(loadPlatforms());
  }, []);

  // When platforms change, fetch stats
  useEffect(() => {
    if (platforms.length > 0) fetchStats();
    else setStats({});
    // eslint-disable-next-line
  }, [platforms]);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-indigo-400">Platform Statistics</h2>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-sm text-gray-400">Updated: {lastUpdated.toLocaleTimeString()}</span>
          )}
          <button
            onClick={fetchStats}
            disabled={loading || platforms.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-300"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      {/* Add Platform Form */}
      <form onSubmit={handleAddPlatform} className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="text-gray-300 text-sm mb-1 block">Platform</label>
          <select
            className="bg-gray-700 text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={input.platform}
            onChange={e => setInput(i => ({ ...i, platform: e.target.value }))}
          >
            <option value="">Select</option>
            {PLATFORM_LIST.filter(p => !platforms.some(pl => pl.key === p.key)).map(p => (
              <option key={p.key} value={p.key}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-gray-300 text-sm mb-1 block">Username</label>
          <input
            className="bg-gray-700 text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            type="text"
            value={input.username}
            onChange={e => setInput(i => ({ ...i, username: e.target.value }))}
            placeholder="Enter username"
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-300"
          disabled={!input.platform || !input.username.trim() || platforms.some(p => p.key === input.platform)}
        >
          Add Platform
        </button>
      </form>
      {/* Render Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((p, idx) => {
          const config = getPlatformConfig(p.key, p.username);
          const data = stats[p.key] || {};
          // Card content
          let cardContent = null;
          if (data.error) {
            cardContent = (
              <>
                <h3 className={`text-lg font-bold ${config.key === 'codeforces' ? 'text-blue-400' : config.key === 'leetcode' ? 'text-yellow-400' : 'text-green-400'} mb-2`}>{config.name}</h3>
                <p className="text-red-400">Error loading data</p>
              </>
            );
          } else if (config.key === 'codeforces') {
            cardContent = (
              <>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-blue-400">{config.name}</h3>
                  <span className="text-sm text-gray-400">@{data.username}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{data.maxRating}</div>
                    <div className="text-xs text-gray-400">Max Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{data.currentRating}</div>
                    <div className="text-xs text-gray-400">Current Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{data.problemsSolved}</div>
                    <div className="text-xs text-gray-400">Problems Solved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{data.contestsParticipated}</div>
                    <div className="text-xs text-gray-400">Contests</div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className="text-sm text-gray-300">Rank: {data.rank}</span>
                  <span className="text-sm text-gray-300 ml-2">({data.country})</span>
                </div>
              </>
            );
          } else if (config.key === 'leetcode') {
            cardContent = (
              <>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-yellow-400">{config.name}</h3>
                  <span className="text-sm text-gray-400">@{data.username}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{data.totalSolved}</div>
                    <div className="text-xs text-gray-400">Total Solved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{data.contestRating}</div>
                    <div className="text-xs text-gray-400">Contest Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">{data.easySolved}</div>
                    <div className="text-xs text-gray-400">Easy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-400">{data.mediumSolved}</div>
                    <div className="text-xs text-gray-400">Medium</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-400">{data.hardSolved}</div>
                    <div className="text-xs text-gray-400">Hard</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{data.attendedContests}</div>
                    <div className="text-xs text-gray-400">Contests</div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className="text-sm text-gray-300">Acceptance: {data.acceptanceRate}</span>
                  <span className="text-sm text-gray-300 ml-2">{data.globalRank}</span>
                </div>
              </>
            );
          } else if (config.key === 'hackerrank') {
            cardContent = (
              <>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-green-400">{config.name}</h3>
                  <span className="text-sm text-gray-400">@{data.username}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{data.problemSolvingStars} ⭐</div>
                    <div className="text-xs text-gray-400">Problem Solving Stars</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{data.cppStars} ⭐</div>
                    <div className="text-xs text-gray-400">C++ Stars</div>
                  </div>
                </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{data.problemsSolved}</div>
                    <div className="text-xs text-gray-400">Problems Solved</div>
                  </div>
              </>
            );
          }
          // Controls
          const controls = (
            editIdx === idx ? (
              <>
                <input
                  className="bg-gray-700 text-white rounded px-2 py-1 w-28 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onKeyDown={e => { e.stopPropagation(); if (e.key === 'Enter') handleEditSave(idx); }}
                  onClick={e => e.stopPropagation()}
                />
                <button className="text-green-400 text-xs font-bold ml-2" onClick={e => { e.stopPropagation(); handleEditSave(idx); }}>Save</button>
                <button className="text-gray-400 text-xs font-bold ml-2" onClick={e => { e.stopPropagation(); setEditIdx(null); }}>Cancel</button>
              </>
            ) : (
              <>
                <button className="text-yellow-400 text-xs font-bold ml-2" title="Edit Username" onClick={e => {e.stopPropagation(); handleEdit(idx);}}>Edit</button>
                <button className="text-red-400 text-xs font-bold ml-2" title="Remove Platform" onClick={e => {e.stopPropagation(); handleRemove(p.key);}}>Remove</button>
              </>
            )
          );
          return (
            <PlatformCard key={p.key} platform={config} data={data} controls={controls}>
              {cardContent}
            </PlatformCard>
          );
        })}
      </div>
    </div>
  );
};

export default PlatformStats;
