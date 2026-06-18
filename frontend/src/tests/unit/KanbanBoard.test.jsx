import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import KanbanBoard from '../../components/KanbanBoard';

describe('KanbanBoard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the kanban board header', () => {
    render(<KanbanBoard />);
    expect(screen.getByText(/WebSocket-Powered Kanban Board/i)).toBeInTheDocument();
  });

  it('renders three columns: To Do, In Progress, Done', () => {
    render(<KanbanBoard />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('renders task form', () => {
    render(<KanbanBoard />);
    expect(screen.getByTestId('task-form')).toBeInTheDocument();
    expect(screen.getByTestId('input-title')).toBeInTheDocument();
  });

  it('shows connection status', () => {
    render(<KanbanBoard />);
    expect(screen.getByTestId('connection-status')).toBeInTheDocument();
  });

  it('renders progress chart', () => {
    render(<KanbanBoard />);
    expect(screen.getByTestId('progress-chart')).toBeInTheDocument();
  });

  it('displays all three columns with task counts', async () => {
    render(<KanbanBoard />);
    await waitFor(() => {
      expect(screen.getByTestId('task-count-todo')).toBeInTheDocument();
      expect(screen.getByTestId('task-count-inprogress')).toBeInTheDocument();
      expect(screen.getByTestId('task-count-done')).toBeInTheDocument();
    });
  });

  it('shows empty state messages for columns', async () => {
    render(<KanbanBoard />);
    await waitFor(() => {
      expect(screen.getByTestId('empty-todo')).toBeInTheDocument();
      expect(screen.getByTestId('empty-inprogress')).toBeInTheDocument();
      expect(screen.getByTestId('empty-done')).toBeInTheDocument();
    });
  });
});
