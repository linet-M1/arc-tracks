const { useState, useEffect } = React;

const ArcTracker = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('arc-tracks-data');
    return saved ? JSON.parse(saved) : {};
  });
  const [showStats, setShowStats] = useState(false);

  const arcs = [
    { id: 'spirituality', name: 'Spirituality', icon: 'sparkles', color: '#8B5CF6' },
    { id: 'literature', name: 'Literature', icon: 'book-open', color: '#10B981' },
    { id: 'tech', name: 'Tech Learning', icon: 'code', color: '#3B82F6' },
    { id: 'money', name: 'Smart Money', icon: 'dollar-sign', color: '#F59E0B' },
    { id: 'go', name: 'Playing Go', icon: 'circle', color: '#EF4444' }
  ];

  useEffect(() => {
    localStorage.setItem('arc-tracks-data', JSON.stringify(data));
  }, [data]);

  const getDayKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  const toggleArc = (date, arcId) => {
    const dayKey = getDayKey(date);
    setData((prev) => ({
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
    setData((prev) => ({
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

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getMonthStats = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const stats = {};
    arcs.forEach((arc) => {
      let completed = 0;
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dayKey = getDayKey(date);
        if (data[dayKey]?.arcs?.[arc.id]) completed++;
      }
      stats[arc.id] = { completed, percentage: Math.round((completed / daysInMonth) * 100) };
    });
    return stats;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayKey = getDayKey(date);
      const dayData = data[dayKey];
      const isSelected = selectedDate.toDateString() === date.toDateString();
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          className={`h-24 border border-gray-700 p-1 cursor-pointer transition-all hover:bg-gray-800 ${
            isSelected ? 'ring-2 ring-blue-500 bg-blue-900' : ''
          } ${isToday ? 'bg-yellow-900' : ''} bg-gray-850`}
          onClick={() => setSelectedDate(date)}
        >
          <div className="text-sm font-medium mb-1 text-white">{day}</div>
          <div className="grid grid-cols-2 gap-1">
            {arcs.map((arc) => (
              <div
                key={arc.id}
                className="w-4 h-4 rounded-full border-2 cursor-pointer transition-all hover:scale-110"
                style={{
                  borderColor: arc.color,
                  backgroundColor: dayData?.arcs?.[arc.id] ? arc.color : 'transparent'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleArc(date, arc.id);
                }}
              ></div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  const selectedDayKey = getDayKey(selectedDate);
  const selectedDayData = data[selectedDayKey];
  const monthStats = getMonthStats();

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Arc-Tracks</h1>
        <p className="text-gray-400">Track your daily progress across the five key areas of growth</p>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {arcs.map((arc) => (
          <div key={arc.id} className="flex items-center space-x-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: arc.color }}></div>
            <i data-lucide={arc.icon} style={{ color: arc.color }}></i>
            <span className="font-medium text-white">{arc.name}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-white"
              >
                <i data-lucide="chevron-left"></i>
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-white"
              >
                <i data-lucide="chevron-right"></i>
              </button>
              <button
                onClick={() => setShowStats(!showStats)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-white"
              >
                <i data-lucide="pie-chart"></i>
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="h-8 flex items-center justify-center font-semibold text-gray-400">
                {day}
              </div>
            ))}
            {renderCalendar()}
          </div>
        </div>

        {/* Day Detail */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            {arcs.map((arc) => (
              <div key={arc.id} className="mb-6 p-4 border border-gray-700 rounded-lg bg-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <i data-lucide={arc.icon} style={{ color: arc.color }}></i>
                    <span className="font-medium text-white">{arc.name}</span>
                  </div>
                  <button
                    onClick={() => toggleArc(selectedDate, arc.id)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      selectedDayData?.arcs?.[arc.id] ? 'border-transparent' : 'border-gray-500 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: selectedDayData?.arcs?.[arc.id] ? arc.color : 'transparent' }}
                  ></button>
                </div>
                <textarea
                  placeholder={`What did you do for ${arc.name.toLowerCase()} today?`}
                  className="w-full p-2 border border-gray-600 rounded text-sm resize-none bg-gray-700 text-white placeholder-gray-400"
                  rows={2}
                  value={selectedDayData?.notes?.[arc.id] || ''}
                  onChange={(e) => updateNotes(selectedDate, arc.id, e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* Stats */}
          {showStats && (
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h4 className="font-semibold mb-3 text-white">Monthly Progress</h4>
              {arcs.map((arc) => (
                <div key={arc.id} className="mb-2">
                  <div className="flex justify-between text-sm mb-1 text-gray-300">
                    <span>{arc.name}</span>
                    <span>{monthStats[arc.id].percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ width: `${monthStats[arc.id].percentage}%`, backgroundColor: arc.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Render
ReactDOM.render(<ArcTracker />, document.getElementById('root'));

// Initialize Lucide icons after render
lucide.createIcons();
