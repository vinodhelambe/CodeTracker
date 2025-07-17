import React, { useState, useRef } from 'react';

const PRESET_TIMERS = [
  { label: 'Pomodoro (25 min)', seconds: 1500 },
  { label: 'Short Break (5 min)', seconds: 300 },
  { label: 'Long Break (15 min)', seconds: 900 },
];

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const Timer = () => {
  const [time, setTime] = useState(0);
  const [input, setInput] = useState('');
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  const startTimer = (seconds) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTime(seconds);
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCustomStart = () => {
    const sec = parseInt(input, 10) * 60;
    if (!isNaN(sec) && sec > 0) {
      startTimer(sec);
    }
  };

  const handleStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg mb-6">
      <h3 className="text-xl font-bold mb-4 text-yellow-400">Timer</h3>
      <div className="flex gap-2 mb-4">
        {PRESET_TIMERS.map(t => (
          <button
            key={t.label}
            onClick={() => startTimer(t.seconds)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg"
            disabled={running}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mb-4">
        <input
          type="number"
          min="1"
          placeholder="Custom (min)"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="bg-gray-700 text-white rounded-lg p-2 w-32"
          disabled={running}
        />
        <button
          onClick={handleCustomStart}
          className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg"
          disabled={running}
        >
          Start
        </button>
      </div>
      <div className="text-4xl font-mono text-yellow-300 mb-2">{formatTime(time)}</div>
      <button
        onClick={handleStop}
        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
        disabled={!running}
      >
        Stop
      </button>
    </div>
  );
};

export default Timer;
