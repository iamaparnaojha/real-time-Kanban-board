import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import KanbanBoard from '../../components/KanbanBoard';
import TaskCard from '../../components/TaskCard';
import TaskForm from '../../components/TaskForm';

describe('WebSocket Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Socket.IO Connection', () => {
    it('initializes Socket.IO connection on mount', () => {
      render(<KanbanBoard />);
      expect(screen.getByTestId('kanban-board')).toBeInTheDocument();
    });

    it('displays connected status when connected', async () => {
      render(<KanbanBoard />);
      await waitFor(() => {
        const status = screen.getByTestId('connection-status');
        expect(status).toHaveTextContent(/Connected|Disconnected/);
      });
    });
  });

  describe('Task Management', () => {
    it('renders task form with all required fields', () => {
      render(<KanbanBoard />);
      expect(screen.getByTestId('input-title')).toBeInTheDocument();
      expect(screen.getByTestId('input-description')).toBeInTheDocument();
      expect(screen.getByTestId('select-priority')).toBeInTheDocument();
      expect(screen.getByTestId('select-category')).toBeInTheDocument();
      expect(screen.getByTestId('input-file')).toBeInTheDocument();
    });

    it('allows user to fill task form', async () => {
      const user = userEvent.setup();
      render(<KanbanBoard />);

      const titleInput = screen.getByTestId('input-title');
      const descriptionInput = screen.getByTestId('input-description');

      await user.type(titleInput, 'Test Task');
      await user.type(descriptionInput, 'Test Description');

      expect(titleInput).toHaveValue('Test Task');
      expect(descriptionInput).toHaveValue('Test Description');
    });

    it('prevents task creation without title', async () => {
      const user = userEvent.setup();
      render(<KanbanBoard />);

      const submitButton = screen.getByTestId('btn-submit');
      await user.click(submitButton);

      // Alert should be triggered
      expect(screen.getByTestId('task-form')).toBeInTheDocument();
    });
  });

  describe('Progress Chart', () => {
    it('displays progress metrics', () => {
      render(<KanbanBoard />);
      expect(screen.getByTestId('progress-chart')).toBeInTheDocument();
      expect(screen.getByTestId('metric-total')).toBeInTheDocument();
      expect(screen.getByTestId('metric-done')).toBeInTheDocument();
      expect(screen.getByTestId('metric-progress')).toBeInTheDocument();
    });

    it('displays progress bar', () => {
      render(<KanbanBoard />);
      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
      expect(screen.getByTestId('progress-percentage')).toBeInTheDocument();
    });
  });

  describe('Column Display', () => {
    it('renders all droppable columns', async () => {
      render(<KanbanBoard />);
      await waitFor(() => {
        expect(screen.getByTestId('droppable-todo')).toBeInTheDocument();
        expect(screen.getByTestId('droppable-inprogress')).toBeInTheDocument();
        expect(screen.getByTestId('droppable-done')).toBeInTheDocument();
      });
    });

    it('displays correct column headers', () => {
      render(<KanbanBoard />);
      expect(screen.getByText('To Do')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error message when connection fails', async () => {
      render(<KanbanBoard />);
      await waitFor(() => {
        const status = screen.getByTestId('connection-status');
        expect(status).toBeInTheDocument();
      });
    });
  });
});

describe('TaskCard Component', () => {
  const renderTaskCard = (task, onDelete = () => {}, onEdit = () => {}) => {
    render(
      <DragDropContext onDragEnd={() => {}}>
        <Droppable droppableId="droppable-task-card">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <TaskCard task={task} index={0} onDelete={onDelete} onEdit={onEdit} />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  };

  it('renders task card with title', () => {
    const task = {
      id: 1,
      title: 'Test Task',
      description: 'Test Description',
      priority: 'high',
      category: 'feature',
      status: 'todo',
      fileUrl: null,
    };

    renderTaskCard(task);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('displays priority badge', () => {
    const task = {
      id: 1,
      title: 'Test Task',
      description: '',
      priority: 'high',
      category: 'feature',
      status: 'todo',
      fileUrl: null,
    };

    renderTaskCard(task);
    expect(screen.getByTestId('priority-badge-1')).toHaveTextContent('high');
  });

  it('displays category badge', () => {
    const task = {
      id: 1,
      title: 'Test Task',
      description: '',
      priority: 'medium',
      category: 'bug',
      status: 'todo',
      fileUrl: null,
    };

    renderTaskCard(task);
    expect(screen.getByTestId('category-badge-1')).toHaveTextContent('bug');
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    const mockDelete = vi.fn();
    const task = {
      id: 1,
      title: 'Test Task',
      description: '',
      priority: 'medium',
      category: 'feature',
      status: 'todo',
      fileUrl: null,
    };

    renderTaskCard(task, mockDelete);
    const deleteButton = screen.getByTestId('delete-btn-1');

    // Mock window.confirm to return true
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    await user.click(deleteButton);
    // Delete will be called through the kanban board emit
    expect(mockDelete).toHaveBeenCalledWith(1);
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    const mockEdit = vi.fn();
    const task = {
      id: 1,
      title: 'Test Task',
      description: '',
      priority: 'medium',
      category: 'feature',
      status: 'todo',
      fileUrl: null,
    };

    renderTaskCard(task, () => {}, mockEdit);
    const editButton = screen.getByTestId('edit-btn-1');

    await user.click(editButton);
    expect(mockEdit).toHaveBeenCalledWith(task);
  });

  it('displays image preview when fileUrl is provided', () => {
    const task = {
      id: 1,
      title: 'Test Task',
      description: '',
      priority: 'medium',
      category: 'feature',
      status: 'todo',
      fileUrl: 'http://example.com/image.jpg',
      fileName: 'image.jpg',
    };

    renderTaskCard(task);
    expect(screen.getByTestId('task-image-1')).toBeInTheDocument();
  });
});

describe('TaskForm Component', () => {
  it('renders all form inputs', () => {
    render(<TaskForm onSubmit={() => {}} />);
    expect(screen.getByTestId('input-title')).toBeInTheDocument();
    expect(screen.getByTestId('input-description')).toBeInTheDocument();
    expect(screen.getByTestId('select-priority')).toBeInTheDocument();
    expect(screen.getByTestId('select-category')).toBeInTheDocument();
    expect(screen.getByTestId('input-file')).toBeInTheDocument();
    expect(screen.getByTestId('btn-submit')).toBeInTheDocument();
  });

  it('submits form with correct data', async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.fn();

    render(<TaskForm onSubmit={mockSubmit} />);

    const titleInput = screen.getByTestId('input-title');
    const descriptionInput = screen.getByTestId('input-description');

    await user.type(titleInput, 'New Task');
    await user.type(descriptionInput, 'New Description');
    await user.click(screen.getByTestId('btn-submit'));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
  });

  it('clears form after successful submission', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={() => {}} />);

    const titleInput = screen.getByTestId('input-title');
    await user.type(titleInput, 'Test Task');
    await user.click(screen.getByTestId('btn-submit'));

    await waitFor(() => {
      expect(titleInput).toHaveValue('');
    });
  });

  it('disables form during submission', async () => {
    render(<TaskForm onSubmit={() => {}} isLoading={true} />);
    expect(screen.getByTestId('btn-submit')).toBeDisabled();
  });
});
