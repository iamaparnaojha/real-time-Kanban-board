import React from "react";
import KanbanBoard from "./components/KanbanBoard";

function App() {
  return (
    <div className="App" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <KanbanBoard />
    </div>
  );
}

export default App;
