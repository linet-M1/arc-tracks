const { useState, useEffect } = React;

function App() {
  const [areas, setAreas] = useState([
    { id: 1, name: "Health", icon: "heart", progress: 60, color: "red" },
    { id: 2, name: "Learning", icon: "book", progress: 40, color: "blue" },
    { id: 3, name: "Finance", icon: "wallet", progress: 30, color: "green" },
    { id: 4, name: "Relationships", icon: "users", progress: 70, color: "purple" },
    { id: 5, name: "Spirituality", icon: "moon", progress: 50, color: "yellow" },
  ]);

  // Ensure Lucide icons are rendered every time state changes
  useEffect(() => {
    lucide.createIcons();
  });

  const updateProgress = (id, amount) => {
    setAreas((prev) =>
      prev.map((area) =>
        area.id === id
          ? { ...area, progress: Math.min(100, Math.max(0, area.progress + amount)) }
          : area
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
          <i data-lucide="activity"></i>
          Arc-Tracks
        </h1>
        <p className="text-gray-400 mt-2">
          Track your daily progress across five key areas of growth
        </p>
      </header>

      <main className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {areas.map((area) => (
          <div
            key={area.id}
            className="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <i data-lucide={area.icon}></i>
              {area.name}
            </h2>

            {/* Progress bar */}
            <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
              <div
                className={`h-4 rounded-full bg-${area.color}-500`}
                style={{ width: `${area.progress}%` }}
              ></div>
            </div>
            <p className="text-sm mb-4">Progress: {area.progress}%</p>

            {/* Buttons */}
            <div className="flex gap-2 mt-auto">
              <button
                onClick={() => updateProgress(area.id, +10)}
                className="flex items-center gap-1 px-3 py-2 bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                <i data-lucide="plus-circle"></i>
                Increase
              </button>
              <button
                onClick={() => updateProgress(area.id, -10)}
                className="flex items-center gap-1 px-3 py-2 bg-red-500 rounded-lg hover:bg-red-600"
              >
                <i data-lucide="minus-circle"></i>
                Decrease
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
