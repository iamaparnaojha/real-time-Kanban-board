import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

/**
 * TaskCard Component
 * Displays individual task with details and delete option
 */
function TaskCard({ task, index, onDelete, onEdit }) {
  const getPriorityColor = (priority) => {
    const colors = {
      low: '#4CAF50',
      medium: '#FFC107',
      high: '#F44336',
    };
    return colors[priority] || '#9E9E9E';
  };

  const getCategoryBg = (category) => {
    const colors = {
      bug: '#FFEBEE',
      feature: '#E3F2FD',
      enhancement: '#F3E5F5',
    };
    return colors[category] || '#F5F5F5';
  };

  return (
    <Draggable draggableId={`task-${task.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          data-testid={`task-card-${task.id}`}
          style={{
            ...provided.draggableProps.style,
            backgroundColor: snapshot.isDragging ? '#f0f0f0' : 'white',
            padding: '12px',
            marginBottom: '8px',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            boxShadow: snapshot.isDragging ? '0 5px 15px rgba(0,0,0,0.2)' : 'none',
            cursor: 'grab',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 8px 0', wordWrap: 'break-word' }}>{task.title}</h4>
              {task.description && (
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666' }}>
                  {task.description}
                </p>
              )}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: '3px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: 'white',
                    backgroundColor: getPriorityColor(task.priority),
                  }}
                  data-testid={`priority-badge-${task.id}`}
                >
                  {task.priority}
                </span>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: '3px',
                    fontSize: '11px',
                    backgroundColor: getCategoryBg(task.category),
                    color: '#333',
                    border: '1px solid #ccc',
                  }}
                  data-testid={`category-badge-${task.id}`}
                >
                  {task.category}
                </span>
              </div>
              {task.fileUrl && (
                <div style={{ marginBottom: '8px' }}>
                  <img
                    src={task.fileUrl}
                    alt={task.fileName}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '150px',
                      borderRadius: '4px',
                      objectFit: 'cover',
                    }}
                    data-testid={`task-image-${task.id}`}
                  />
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '8px' }}>
              <button
                onClick={() => onEdit(task)}
                data-testid={`edit-btn-${task.id}`}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
                title="Edit task"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(task.id)}
                data-testid={`delete-btn-${task.id}`}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
                title="Delete task"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default TaskCard;
