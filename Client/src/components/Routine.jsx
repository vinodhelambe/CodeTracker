import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { data } from '../api/fileService';

function Routine() {
  const { Userdata } = useContext(AppContext);
  const [routines, setRoutines] = useState([]);
  // Set default selectedDate to today's date in local time (YYYY-MM-DD)
  const now = new Date();
  const localDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yyyy = localDate.getFullYear();
  const mm = String(localDate.getMonth() + 1).padStart(2, '0');
  const dd = String(localDate.getDate()).padStart(2, '0');
  const todayLocal = `${yyyy}-${mm}-${dd}`;
  const [selectedDate, setSelectedDate] = useState(todayLocal);
  const [newTask, setNewTask] = useState('');
  const [editIdx, setEditIdx] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Fetch all routines on mount
  useEffect(() => {
    data.loadRoutine()
      .then(fetchedRoutines => {
        if (Array.isArray(fetchedRoutines) && fetchedRoutines.length > 0) {
          setRoutines(fetchedRoutines);
        } else {
          // Fallback: get from localStorage if DB returns nothing
          const local = JSON.parse(localStorage.getItem('routineLocal') || '[]');
          setRoutines(local);
        }
      })
      .catch(() => {
        // Fallback: get from localStorage if DB call fails
        const local = JSON.parse(localStorage.getItem('routineLocal') || '[]');
        setRoutines(local);
      });
  }, []);

  const todayRoutine = routines.find(r => r.date === selectedDate) ;

  const handleToggleComplete = async (idx) => {
    if (!todayRoutine) return;
    const updatedTasks = todayRoutine.tasks.map((t, i) =>
      i === idx ? { ...t, completed: !t.completed } : t
    );
    setRoutines(rs =>
      rs.map(r => r.date === selectedDate ? { ...r, tasks: updatedTasks } : r)
    );
    // Persist
    try {
      const payload = { date: selectedDate, tasks: updatedTasks };
      const savedRoutine = await data.saveRoutine(payload);
      setRoutines(rs =>
        rs.map(r => r.date === selectedDate ? savedRoutine : r)
      );
    } catch (err) {
      console.error('Failed to update routine:', err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const taskObj = { activity: newTask.trim(), completed: false };
    const updatedTasks = todayRoutine ? [...todayRoutine.tasks, taskObj] : [taskObj];
    const payload = { userId: Userdata && Userdata._id, date: selectedDate, tasks: updatedTasks };
    try {
      const savedRoutine = await data.saveRoutine(payload);
      const existingRoutineIndex = routines.findIndex(r => r.date === selectedDate);
      if (existingRoutineIndex > -1) {
        setRoutines(routines.map((r, index) => index === existingRoutineIndex ? savedRoutine : r));
      } else {
        setRoutines([...routines, savedRoutine]);
      }

    } catch (err) {
      // Only update localStorage if DB call fails
      let local = JSON.parse(localStorage.getItem('routineLocal') || '[]');
      const idxInLocal = local.findIndex(r => r.date === selectedDate);
      if (idxInLocal > -1) {
        local[idxInLocal].tasks = updatedTasks;
      } else {
        local.push({ date: selectedDate, tasks: updatedTasks });
      }
      localStorage.setItem('routineLocal', JSON.stringify(local));
      const newRoutine = { date: selectedDate, tasks: updatedTasks };
      const existingRoutineIndex = routines.findIndex(r => r.date === selectedDate);
      if (existingRoutineIndex > -1) {
        setRoutines(routines.map((r, index) => index === existingRoutineIndex ? newRoutine : r));
      } else {
        setRoutines([...routines, newRoutine]);
      }
    }
    setNewTask('');
  };

  const handleEditTask = async (idx, newValue) => {
    if (!todayRoutine) return;
    const updatedTasks = todayRoutine.tasks.map((t, i) =>
      i === idx ? { ...t, activity: newValue } : t
    );
    const payload = { date: selectedDate, tasks: updatedTasks };
    try {
      const savedRoutine = await data.saveRoutine(payload);
      setRoutines(rs =>
        rs.map(r => r.date === selectedDate ? savedRoutine : r)
      );
      setEditIdx(null);
    } catch (err) {
      // Only update localStorage if DB call fails
      let local = JSON.parse(localStorage.getItem('routineLocal') || '[]');
      const idxInLocal = local.findIndex(r => r.date === selectedDate);
      if (idxInLocal > -1) {
        local[idxInLocal].tasks = updatedTasks;
      } else {
        local.push({ date: selectedDate, tasks: updatedTasks });
      }
      localStorage.setItem('routineLocal', JSON.stringify(local));
      setRoutines(rs =>
        rs.map(r => r.date === selectedDate ? { ...r, tasks: updatedTasks } : r)
      );
      setEditIdx(null);
    }
  };

  const handleDeleteTask = async (idx) => {
    if (!todayRoutine) return;
    if (!window.confirm('Delete this task?')) return;
    const updatedTasks = todayRoutine.tasks.filter((_, i) => i !== idx);
    const payload = { date: selectedDate, tasks: updatedTasks };
    try {
      const savedRoutine = await data.saveRoutine(payload);
      setRoutines(rs =>
        rs.map(r => r.date === selectedDate ? savedRoutine : r)
      );
    } catch (err) {
      // Only update localStorage if DB call fails
      let local = JSON.parse(localStorage.getItem('routineLocal') || '[]');
      const idxInLocal = local.findIndex(r => r.date === selectedDate);
      if (idxInLocal > -1) {
        local[idxInLocal].tasks = updatedTasks;
      } else {
        local.push({ date: selectedDate, tasks: updatedTasks });
      }
      localStorage.setItem('routineLocal', JSON.stringify(local));
      setRoutines(rs =>
        rs.map(r => r.date === selectedDate ? { ...r, tasks: updatedTasks } : r)
      );
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-4 text-purple-400">Daily Routine</h2>
      <div className="flex flex-col lg:flex-row">
        {/* Calendar */}
        <div className="mb-6 lg:mb-0 lg:mr-8">
          <Calendar
            onChange={d => setSelectedDate(d.toLocaleDateString('en-CA'))}
            value={new Date(selectedDate)}
            className="rounded-lg overflow-hidden shadow-lg"
          />
        </div>
        <div className="flex-grow">
          {/* Add‐task form */}
          <form
            onSubmit={handleAddTask}
            className="mb-6 bg-gray-800 p-4 rounded-lg space-y-4"
          >
            <h3 className="text-xl font-semibold">Add Task for {selectedDate}</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="New task..."
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                className="flex-grow p-2 rounded bg-gray-700 text-white focus:outline-none"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-500 rounded hover:bg-indigo-600"
              >
                Add
              </button>
            </div>
          </form>
          {/* Task list */}
          <div className="bg-gray-800 p-6 rounded-lg">
            {todayRoutine?.tasks?.length > 0 ? (
              <ul className="space-y-4">
                {todayRoutine.tasks.map((task, idx) => (
                  <li
                    key={idx}
                    className={`flex items-center p-4 rounded-lg transition duration-300 ${
                      task.completed ? 'bg-gray-700 text-gray-500' : 'bg-gray-900'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleComplete(idx)}
                      className="form-checkbox h-6 w-6 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 cursor-pointer"
                    />
                    <div className="ml-4 flex-grow">
                      {editIdx === idx ? (
                        <form
                          onSubmit={async e => {
                            e.preventDefault();
                            await handleEditTask(idx, editValue);
                          }}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="text"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            className="p-2 rounded bg-gray-700 text-white focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditIdx(null)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <p className={`ml-2 ${task.completed ? 'line-through' : ''}`}>{task.activity}</p>
                      )}
                    </div>
                    {editIdx !== idx && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditIdx(idx);
                            setEditValue(task.activity);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTask(idx)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-lg font-bold"
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-center">
                No tasks for {selectedDate}. Add one above!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Routine;
