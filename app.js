// app.js (fixed)
// Assumes React, ReactDOM and window.LucideReact are available globally

const { useState, useEffect } = React;
// Use window.LucideReact which the UMD file exposes
const { Calendar, BookOpen, Code, DollarSign, Sparkles, ChevronLeft, ChevronRight, PieChart, Circle } = window.LucideReact;

const ArcTracker = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [data, setData] = useState(() => {
    // Load data from localStorage on initialization
    try {
      const saved = localStorage.getItem('arc-tracks-data');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.warn('Error parsing saved data', e);
      return {};
    }
  });
  const [showStats, setShowStats] = useState(false);

  const arcs = [
    { id: 'spirituality', name: 'Spirituality', icon: Sparkles, color: '#8B5CF6' },
    { id: 'literature', name: 'Literature', icon: BookOpen, color: '#10B981' },
    { id: 'tech', name: 'Tech Learning', icon: Code, color: '#3B82F6' },
    { id: 'money', name: 'Smart Money', icon: DollarSign, color: '#F59E0B' },
    { id: 'go', name: 'Playing Go', icon: Circle, color: '#EF4444' }
  ];

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem('arc-tracks-data', JSON.stringify(data));
    } catch (e) {
      console.warn('Error saving data:', e);
    }
  }, [data]);

  const getDayKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const toggleArc = (date, arcId) => {
    const dayKey = getDayKey(date);
    setData(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        arcs: {
          ...prev[dayKey]?.arcs,
          [arcId]: !prev[dayKey]?.arcs?.[arcId]
        }
      }
    }));
  };

  const updateNotes = (date, arcId, note) => {
    const dayKey = getDayKey(date);
    setData(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        notes: {
          ...prev[dayKey]?.notes,
          [arcId]: note
        }
      }
    }));
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getMonthStats = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const stats = {};
    arcs.forEach(arc => {
      let completed = 0;
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dayKey = getDayKey(date);
        if (data[dayKey]?.arcs?.[arc.id]) {
          completed++;
        }
      }
      stats[arc.id] = {
        completed,
        percentage: Math.round((completed / daysInMonth) * 100)
      };
    });
    return stats;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(React.createElement('div', { key: `empty-${i}`, className: 'h-24' }));
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayKey = getDayKey(date);
      const dayData = data[dayKey];
      const isSelected = selectedDate.toDateString() === date.toDateString();
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        React.createElement('div', {
          key: day,
          className: `h-24 border border-gray-700 p-1 cursor-pointer transition-all hover:bg-gray-800 ${
            isSelected ? 'ring-2 ring-blue-500 bg-blue-900' : ''
          } ${isToday ? 'bg-yellow-900' : ''} bg-gray-800`,
          onClick: () => setSelectedDate(date)
        }, [
          React.createElement('div', {
            key: 'day-number',
            className: 'text-sm font-medium mb-1 text-white'
          }, day),
          React.createElement('div', {
            key: 'arcs-grid',
            className: 'grid grid-cols-2 gap-1'
          }, [
            // All arcs displayed in grid (keeps original behavior)
            ...arcs.map(arc =>
              React.createElement('div', {
                key: arc.id,
                className: 'w-4 h-4 rounded-full border-2 cursor-pointer transition-all hover:scale-110',
                style: {
                  borderColor: arc.color,
                  backgroundColor: dayData?.arcs?.[arc.id] ? arc.color : 'transparent'
                },
                onClick: (e) => {
                  e.stopPropagation();
                  toggleArc(date, arc.id);
                }
              })
            )
          ])
        ])
      );
    }

    return days;
  };

  const selectedDayKey = getDayKey(selectedDate);
  const selectedDayData = data[selectedDayKey];
  const monthStats = getMonthStats();

  return React.createElement('div', {
    className: 'max-w-6xl mx-auto p-6 bg-gray-900 min-h-screen'
  }, [
    // Header
    React.createElement('div', { key: 'header', className: 'mb-8' }, [
      React.createElement('h1', {
        key: 'title',
        className: 'text-3xl font-bold text-white mb-2'
      }, 'Arc-Tracks'),
      React.createElement('p', {
        key: 'subtitle',
        className: 'text-gray-400'
      }, 'Track your daily progress across the five key areas of growth')
    ]),

    // Arc Legend
    React.createElement('div', {
      key: 'legend',
      className: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8'
    }, arcs.map(arc =>
      React.createElement('div', {
        key: arc.id,
        className: 'flex items-center space-x-2 p-3 bg-gray-800 rounded-lg border border-gray-700'
      }, [
        React.createElement('div', {
          key: 'color-dot',
          className: 'w-4 h-4 rounded-full',
          style: { backgroundColor: arc.color }
        }),
        React.createElement(arc.icon, {
          key: 'icon',
          size: 18,
          style: { color: arc.color }
        }),
        React.createElement('span', {
          key: 'name',
          className: 'font-medium text-white'
        }, arc.name)
      ]))
    ),

    // Main content
    React.createElement('div', {
      key: 'main-content',
      className: 'grid grid-cols-1 lg:grid-cols-3 gap-8'
    }, [
      // Calendar
      React.createElement('div', {
        key: 'calendar',
        className: 'lg:col-span-2'
      }, [
        React.createElement('div', {
          key: 'calendar-header',
          className: 'flex items-center justify-between mb-6'
        }, [
          React.createElement('h2', {
            key: 'month-title',
            className: 'text-2xl font-semibold text-white'
          }, currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })),
          React.createElement('div', {
            key: 'nav-buttons',
            className: 'flex space-x-2'
          }, [
            React.createElement('button', {
              key: 'prev',
              onClick: () => navigateMonth(-1),
              className: 'p-2 hover:bg-gray-800 rounded-lg transition-colors text-white'
            }, React.createElement(ChevronLeft, { size: 20 })),
            React.createElement('button', {
              key: 'next',
              onClick: () => navigateMonth(1),
              className: 'p-2 hover:bg-gray-800 rounded-lg transition-colors text-white'
            }, React.createElement(ChevronRight, { size: 20 })),
            React.createElement('button', {
              key: 'stats',
              onClick: () => setShowStats(!showStats),
              className: 'p-2 hover:bg-gray-800 rounded-lg transition-colors text-white'
            }, React.createElement(PieChart, { size: 20 }))
          ])
        ]),

        // Calendar Grid
        React.createElement('div', {
          key: 'calendar-grid',
          className: 'grid grid-cols-7 gap-1 mb-4'
        }, [
          ...['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day =>
            React.createElement('div', {
              key: day,
              className: 'h-8 flex items-center justify-center font-semibold text-gray-400'
            }, day)
          ),
          ...renderCalendar()
        ])
      ]),

      // Details panel
      React.createElement('div', {
        key: 'details',
        className: 'space-y-6'
      }, [
        React.createElement('div', { key: 'day-details' }, [
          React.createElement('h3', {
            key: 'selected-date',
            className: 'text-xl font-semibold mb-4 text-white'
          }, selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })),

          ...arcs.map(arc =>
            React.createElement('div', {
              key: arc.id,
              className: 'mb-6 p-4 border border-gray-700 rounded-lg bg-gray-800'
            }, [
              React.createElement('div', {
                key: 'arc-header',
                className: 'flex items-center justify-between mb-3'
              }, [
                React.createElement('div', {
                  key: 'arc-info',
                  className: 'flex items-center space-x-2'
                }, [
                  React.createElement(arc.icon, {
                    key: 'icon',
                    size: 18,
                    style: { color: arc.color }
                  }),
                  React.createElement('span', {
                    key: 'name',
                    className: 'font-medium text-white'
                  }, arc.name)
                ]),
                React.createElement('button', {
                  key: 'toggle',
                  onClick: () => toggleArc(selectedDate, arc.id),
                  className: `w-6 h-6 rounded-full border-2 transition-all ${
                    selectedDayData?.arcs?.[arc.id]
                      ? 'border-transparent'
                      : 'border-gray-500 hover:border-gray-400'
                  }`,
                  style: {
                    backgroundColor: selectedDayData?.arcs?.[arc.id] ? arc.color : 'transparent'
                  }
                })
              ]),
              React.createElement('textarea', {
                key: 'notes',
                placeholder: `What did you do for ${arc.name.toLowerCase()} today?`,
                className: 'w-full p-2 border border-gray-600 rounded text-sm resize-none bg-gray-700 text-white placeholder-gray-400',
                rows: 2,
                value: selectedDayData?.notes?.[arc.id] || '',
                onChange: (e) => updateNotes(selectedDate, arc.id, e.target.value)
              })
            ])
          )
        ]),

        // Monthly Stats
        showStats && React.createElement('div', {
          key: 'stats',
          className: 'p-4 bg-gray-800 rounded-lg border border-gray-700'
        }, [
          React.createElement('h4', {
            key: 'stats-title',
            className: 'font-semibold mb-3 text-white'
          }, 'Monthly Progress'),
          ...arcs.map(arc =>
            React.createElement('div', {
              key: arc.id,
              className: 'mb-2'
            }, [
              React.createElement('div', {
                key: 'progress-header',
                className: 'flex justify-between text-sm mb-1 text-gray-300'
              }, [
                React.createElement('span', { key: 'name' }, arc.name),
                React.createElement('span', { key: 'percentage' }, `${monthStats[arc.id].percentage}%`)
              ]),
              React.createElement('div', {
                key: 'progress-bar',
                className: 'w-full bg-gray-700 rounded-full h-2'
              }, React.createElement('div', {
                className: 'h-2 rounded-full transition-all duration-300',
                style: {
                  width: `${monthStats[arc.id].percentage}%`,
                  backgroundColor: arc.color
                }
              }))
            ])
          )
        ])
      ])
    ])
  ]);
};

// Render the app (React 18 compatible)
const rootEl = document.getElementById('root');
if (rootEl) {
  // If createRoot exists (React 18), use it; otherwise fall back to render
  if (ReactDOM.createRoot) {
    ReactDOM.createRoot(rootEl).render(React.createElement(ArcTracker));
  } else {
    ReactDOM.render(React.createElement(ArcTracker), rootEl);
  }
}
