import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Moon, Sun, Play, Pause, RotateCcw, Calendar, Clock, Target, Zap, Star, Coffee } from 'lucide-react';

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [animatingTodos, setAnimatingTodos] = useState(new Set());

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Pomodoro timer logic
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds(timerSeconds - 1);
        } else if (timerMinutes > 0) {
          setTimerMinutes(timerMinutes - 1);
          setTimerSeconds(59);
        } else {
          // Timer finished - play sound and reset
          playSound('complete');
          setIsTimerRunning(false);
          setTimerMinutes(25);
          setTimerSeconds(0);
          alert('Pomodoro session complete! Take a break! 🎉');
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerMinutes, timerSeconds]);

  // Sound effects function
  const playSound = (type) => {
    // Using Web Audio API to create simple sound effects
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'add') {
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
    } else if (type === 'delete') {
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.1);
    } else if (type === 'complete') {
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2);
    }
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const addTodo = () => {
    if (inputValue.trim() !== '') {
      const newTodo = {
        id: Date.now(),
        text: inputValue,
        completed: false,
        dueDate: dueDate || null,
        dueTime: dueTime || null,
        createdAt: new Date().toISOString()
      };
      
      // Add animation
      setAnimatingTodos(prev => new Set([...prev, newTodo.id]));
      setTimeout(() => {
        setAnimatingTodos(prev => {
          const next = new Set(prev);
          next.delete(newTodo.id);
          return next;
        });
      }, 500);
      
      setTodos([newTodo, ...todos]);
      setInputValue('');
      setDueDate('');
      setDueTime('');
      playSound('add');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        const updated = { ...todo, completed: !todo.completed };
        if (updated.completed) {
          playSound('complete');
        }
        return updated;
      }
      return todo;
    }));
  };

  const deleteTodo = (id) => {
    setAnimatingTodos(prev => new Set([...prev, id]));
    playSound('delete');
    
    setTimeout(() => {
      setTodos(todos.filter(todo => todo.id !== id));
      setAnimatingTodos(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerMinutes(25);
    setTimerSeconds(0);
  };

  const formatTime = (minutes, seconds) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isOverdue = (todo) => {
    if (!todo.dueDate) return false;
    const now = new Date();
    const dueDateTime = new Date(`${todo.dueDate}T${todo.dueTime || '23:59'}`);
    return dueDateTime < now && !todo.completed;
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;
  const overdueCount = todos.filter(todo => isOverdue(todo)).length;

  const getTaskIcon = (index) => {
    const icons = [Target, Zap, Star, Coffee, Calendar, Clock];
    const IconComponent = icons[index % icons.length];
    return IconComponent;
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800' 
        : 'bg-gradient-to-br from-blue-50 via-white to-blue-100'
    } py-8`}>
      <div className={`max-w-4xl mx-auto ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } rounded-2xl shadow-2xl overflow-hidden transition-all duration-500`}>
        
        {/* Header */}
        <div className={`${
          darkMode ? 'bg-gradient-to-r from-blue-800 to-indigo-800' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
        } p-6`}>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Target className="animate-pulse" />
              Todo Master
            </h1>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-300 hover:scale-110"
            >
              {darkMode ? <Sun className="text-yellow-300" size={24} /> : <Moon className="text-blue-900" size={24} />}
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className={`${
              darkMode ? 'bg-gray-700 text-white' : 'bg-blue-50 text-blue-800'
            } rounded-xl p-4 text-center transition-all duration-300 hover:scale-105`}>
              <div className="text-2xl font-bold">{totalCount}</div>
              <div className="text-sm opacity-75">Total Tasks</div>
            </div>
            <div className={`${
              darkMode ? 'bg-gray-700 text-white' : 'bg-green-50 text-green-800'
            } rounded-xl p-4 text-center transition-all duration-300 hover:scale-105`}>
              <div className="text-2xl font-bold">{completedCount}</div>
              <div className="text-sm opacity-75">Completed</div>
            </div>
            <div className={`${
              darkMode ? 'bg-gray-700 text-white' : 'bg-yellow-50 text-yellow-800'
            } rounded-xl p-4 text-center transition-all duration-300 hover:scale-105`}>
              <div className="text-2xl font-bold">{totalCount - completedCount}</div>
              <div className="text-sm opacity-75">Remaining</div>
            </div>
            <div className={`${
              darkMode ? 'bg-gray-700 text-white' : 'bg-red-50 text-red-800'
            } rounded-xl p-4 text-center transition-all duration-300 hover:scale-105`}>
              <div className="text-2xl font-bold">{overdueCount}</div>
              <div className="text-sm opacity-75">Overdue</div>
            </div>
          </div>

          {/* Pomodoro Timer */}
          <div className={`${
            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'
          } rounded-xl p-6 mb-8 border-2`}>
            <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
              darkMode ? 'text-white' : 'text-blue-800'
            }`}>
              <Coffee /> Pomodoro Timer
            </h3>
            <div className="flex items-center justify-center gap-6">
              <div className={`text-4xl font-mono font-bold ${
                darkMode ? 'text-blue-300' : 'text-blue-600'
              }`}>
                {formatTime(timerMinutes, timerSeconds)}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={toggleTimer}
                  className={`p-3 rounded-full ${
                    isTimerRunning 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white transition-all duration-300 hover:scale-110`}
                >
                  {isTimerRunning ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button
                  onClick={resetTimer}
                  className="p-3 rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-all duration-300 hover:scale-110"
                >
                  <RotateCcw size={20} />
                </button>
              </div>
            </div>
            <input
              type="text"
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              placeholder="What are you working on?"
              className={`w-full mt-4 px-4 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                  : 'bg-white border-blue-300 text-gray-800 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          {/* Progress Bar */}
          {totalCount > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Progress: {completedCount} of {totalCount} tasks completed
                </span>
                <span className={`text-sm font-bold ${
                  darkMode ? 'text-blue-300' : 'text-blue-600'
                }`}>
                  {Math.round((completedCount / totalCount) * 100)}%
                </span>
              </div>
              <div className={`w-full ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              } rounded-full h-3 overflow-hidden`}>
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-700 ease-out shadow-lg"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Add Todo Form */}
          <div className={`${
            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'
          } rounded-xl p-6 mb-8 border-2`}>
            <div className="space-y-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a new task..."
                className={`w-full px-4 py-3 rounded-lg border-2 ${
                  darkMode 
                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                    : 'bg-white border-blue-300 text-gray-800 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
              />
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={`block text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <Calendar size={16} className="inline mr-1" />
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-600 border-gray-500 text-white' 
                        : 'bg-white border-blue-300 text-gray-800'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                
                <div className="flex-1">
                  <label className={`block text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <Clock size={16} className="inline mr-1" />
                    Due Time
                  </label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-600 border-gray-500 text-white' 
                        : 'bg-white border-blue-300 text-gray-800'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>
              
              <button
                onClick={addTodo}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 font-semibold shadow-lg"
              >
                <Plus size={20} />
                Add Task
              </button>
            </div>
          </div>

          {/* Todo List */}
          <div className="space-y-3">
            {todos.length === 0 ? (
              <div className={`text-center py-12 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <div className="text-6xl mb-4">📝</div>
                <p className="text-xl">No tasks yet. Add one above!</p>
              </div>
            ) : (
              todos.map((todo, index) => {
                const IconComponent = getTaskIcon(index);
                const overdue = isOverdue(todo);
                const isAnimating = animatingTodos.has(todo.id);
                
                return (
                  <div
                    key={todo.id}
                    className={`
                      flex items-center p-4 rounded-xl border-2 transition-all duration-500 transform
                      ${isAnimating ? 'animate-pulse scale-95 opacity-50' : 'hover:scale-102'}
                      ${todo.completed
                        ? darkMode 
                          ? 'bg-green-900 border-green-700 text-green-100' 
                          : 'bg-green-50 border-green-200 text-green-800'
                        : overdue
                          ? darkMode
                            ? 'bg-red-900 border-red-700 text-red-100'
                            : 'bg-red-50 border-red-200 text-red-800'
                          : darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-650' 
                            : 'bg-white border-blue-200 text-gray-800 hover:border-blue-300 hover:shadow-md'
                      }
                    `}
                  >
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={`
                        flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 transition-all duration-300 hover:scale-110
                        ${todo.completed
                          ? 'bg-green-500 border-green-500 text-white shadow-lg' 
                          : darkMode
                            ? 'border-gray-400 hover:border-green-400 hover:bg-green-400 hover:text-white'
                            : 'border-gray-400 hover:border-green-500 hover:bg-green-500 hover:text-white'
                        }
                      `}
                    >
                      {todo.completed && <Check size={16} />}
                    </button>
                    
                    <IconComponent 
                      size={20} 
                      className={`flex-shrink-0 mr-3 ${
                        todo.completed ? 'opacity-50' : ''
                      }`} 
                    />
                    
                    <div className="flex-1">
                      <span
                        className={`block font-medium transition-all duration-300 ${
                          todo.completed ? 'line-through opacity-60' : ''
                        }`}
                      >
                        {todo.text}
                      </span>
                      
                      {(todo.dueDate || todo.dueTime) && (
                        <div className={`text-xs mt-1 flex items-center gap-2 ${
                          overdue ? 'font-semibold' : 'opacity-70'
                        }`}>
                          {todo.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(todo.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          {todo.dueTime && (
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {todo.dueTime}
                            </span>
                          )}
                          {overdue && !todo.completed && (
                            <span className="text-red-500 font-bold">OVERDUE!</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className={`flex-shrink-0 p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                        darkMode 
                          ? 'text-red-400 hover:text-red-300 hover:bg-red-900' 
                          : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                      }`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Clear Completed */}
          {completedCount > 0 && (
            <button
              onClick={() => setTodos(todos.filter(todo => !todo.completed))}
              className={`w-full mt-6 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105 ${
                darkMode 
                  ? 'text-red-400 hover:text-red-300 hover:bg-red-900' 
                  : 'text-red-600 hover:text-red-800 hover:bg-red-50'
              } border-2 border-dashed ${
                darkMode ? 'border-red-700 hover:border-red-500' : 'border-red-200 hover:border-red-400'
              }`}
            >
              Clear Completed Tasks ({completedCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}