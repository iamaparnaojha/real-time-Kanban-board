import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { io } from 'socket.io-client';
import TaskForm from './TaskForm';
import TaskColumn from './TaskColumn';
import ProgressChart from './ProgressChart';

/**
 * KanbanBoard Component
 * Main component managing tasks, real-time sync via Socket.IO, and drag-drop
 */
function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      reconnectionDelay: 1000,
      reconnection: true,
      reconnectionAttempts: 10,
      transports: ['websocket', 'polling'],
    });

    // Connection established
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setError(null);
    });

    // Receive initial task list
    newSocket.on('sync:tasks', (data) => {
      console.log('Syncing tasks:', data.tasks);
      setTasks(data.tasks || []);
    });

    // New task created (from any client)
    newSocket.on('task:created', (task) => {
      console.log('Task created:', task);
      setTasks((prevTasks) => [...prevTasks, task]);
    });

    // Task updated
    newSocket.on('task:updated', (updatedTask) => {
      console.log('Task updated:', updatedTask);
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
    });

    // Task moved to different column
    newSocket.on('task:moved', (data) => {
      console.log('Task moved:', data);
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === data.taskId ? { ...t, status: data.newStatus } : t
        )
      );
    });

    // Task deleted
    newSocket.on('task:deleted', (data) => {
      console.log('Task deleted:', data.id);
      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== data.id));
    });

    // Connection error
    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setError('Failed to connect to server');
      setIsConnected(false);
    });

    // Disconnected
    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Create new task
  const handleCreateTask = (taskData) => {
    if (!socket) return;

    setIsLoading(true);
    socket.emit('task:create', taskData, (response) => {
      setIsLoading(false);
      if (!response?.success) {
        setError(response?.error || 'Failed to create task');
      }
    });
  };

  // Update existing task
  const handleUpdateTask = (taskData) => {
    if (!socket || !editingTask) return;

    setIsLoading(true);
    const payload = { ...taskData, id: editingTask.id };
    socket.emit('task:update', payload, (response) => {
      setIsLoading(false);
      if (!response?.success) {
        setError(response?.error || 'Failed to update task');
      } else {
        setEditingTask(null);
      }
    });
  };

  // Delete task
  const handleDeleteTask = (taskId) => {
    if (!socket) return;

    if (window.confirm('Are you sure you want to delete this task?')) {
      socket.emit('task:delete', { id: taskId }, (response) => {
        if (!response?.success) {
          setError(response?.error || 'Failed to delete task');
        }
      });
    }
  };

  // Handle drag and drop
  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    // If dropped outside a valid droppable area, do nothing
    if (!destination) {
      return;
    }

    // If dropped in the same position, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Extract task ID
    const taskId = parseInt(draggableId.replace('task-', ''), 10);

    // Get the task
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // If status changed, emit move event
    if (source.droppableId !== destination.droppableId) {
      if (!socket) return;

      socket.emit(
        'task:move',
        {
          taskId,
          newStatus: destination.droppableId,
        },
        (response) => {
          if (!response?.success) {
            setError(response?.error || 'Failed to move task');
          }
        }
      );
    }
  };

  // Get tasks by status
  const getTasks = (status) => tasks.filter((t) => t.status === status);

  return (
    <div data-testid="kanban-board" style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: '0 0 8px 0' }}>📋 WebSocket-Powered Kanban Board</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span
            data-testid="connection-status"
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              backgroundColor: isConnected ? '#4CAF50' : '#f44336',
              color: 'white',
            }}
          >
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
          {error && (
            <span style={{ color: '#f44336', fontSize: '14px' }} data-testid="error-message">
              ⚠️ {error}
            </span>
          )}
        </div>
      </div>

      {/* Task Form */}
      {editingTask ? (
        <div style={{ marginBottom: '20px', padding: '16px', border: '2px solid #2196F3', borderRadius: '8px', backgroundColor: '#fff' }}>
          <h2 style={{ marginTop: 0 }}>Edit Task</h2>
          <TaskForm 
            onSubmit={handleUpdateTask} 
            isLoading={isLoading} 
            initialData={editingTask} 
            onCancel={() => setEditingTask(null)}
          />
        </div>
      ) : (
        <TaskForm onSubmit={handleCreateTask} isLoading={isLoading} />
      )}

      {/* Progress Chart */}
      <ProgressChart tasks={tasks} />

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
          }}
        >
          <TaskColumn
            columnId="todo"
            columnTitle="To Do"
            tasks={getTasks('todo')}
            onDelete={handleDeleteTask}
            onEdit={setEditingTask}
          />
          <TaskColumn
            columnId="inprogress"
            columnTitle="In Progress"
            tasks={getTasks('inprogress')}
            onDelete={handleDeleteTask}
            onEdit={setEditingTask}
          />
          <TaskColumn
            columnId="done"
            columnTitle="Done"
            tasks={getTasks('done')}
            onDelete={handleDeleteTask}
            onEdit={setEditingTask}
          />
        </div>
      </DragDropContext>

      {/* Loading Indicator */}
      {isLoading && (
        <div
          data-testid="loading-indicator"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '12px 16px',
            backgroundColor: '#2196F3',
            color: 'white',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          ⏳ Syncing...
        </div>
      )}
    </div>
  );
}

export default KanbanBoard;
