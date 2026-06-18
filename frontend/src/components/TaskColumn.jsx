import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

/**
 * TaskColumn Component
 * Represents a column (todo, in-progress, done) with droppable area
 */
function TaskColumn({ columnId, columnTitle, tasks, onDelete, onEdit }) {
  const getColumnColor = (columnId) => {
    const colors = {
      todo: '#E3F2FD',
      inprogress: '#FFF3E0',
      done: '#E8F5E9',
    };
    return colors[columnId] || '#F5F5F5';
  };

  const getHeaderColor = (columnId) => {
    const colors = {
      todo: '#2196F3',
      inprogress: '#FF9800',
      done: '#4CAF50',
    };
    return colors[columnId] || '#9E9E9E';
  };

  return (
    <div
      data-testid={`column-${columnId}`}
      style={{
        flex: 1,
        backgroundColor: getColumnColor(columnId),
        borderRadius: '8px',
        padding: '12px',
        minHeight: '500px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Column Header */}
      <div
        style={{
          backgroundColor: getHeaderColor(columnId),
          color: 'white',
          padding: '10px 12px',
          borderRadius: '4px',
          marginBottom: '12px',
          fontWeight: 'bold',
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{columnTitle}</span>
        <span
          data-testid={`task-count-${columnId}`}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px',
          }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            data-testid={`droppable-${columnId}`}
            style={{
              flex: 1,
              backgroundColor: snapshot.isDraggingOver ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
              borderRadius: '4px',
              padding: '8px',
              transition: 'background-color 0.2s',
            }}
          >
            {/* Render Tasks */}
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  color: '#999',
                  padding: '20px',
                  fontSize: '14px',
                }}
                data-testid={`empty-${columnId}`}
              >
                No tasks yet. Drag tasks here or create new ones.
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default TaskColumn;
