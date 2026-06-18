import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

/**
 * ProgressChart Component
 * Displays real-time progress with task count per column and completion percentage
 */
function ProgressChart({ tasks }) {
  // Calculate statistics
  const todoCount = tasks.filter((t) => t.status === 'todo').length;
  const inprogressCount = tasks.filter((t) => t.status === 'inprogress').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const totalCount = tasks.length;
  const donePercentage = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // Data for bar chart (task counts)
  const columnData = [
    { name: 'To Do', count: todoCount },
    { name: 'In Progress', count: inprogressCount },
    { name: 'Done', count: doneCount },
  ];

  // Data for progress overview
  const progressData = [
    { name: 'Completion', value: donePercentage },
    { name: 'Remaining', value: 100 - donePercentage },
  ];

  // Data for priority distribution
  const priorityData = [
    {
      name: 'Low',
      count: tasks.filter((t) => t.priority === 'low').length,
    },
    {
      name: 'Medium',
      count: tasks.filter((t) => t.priority === 'medium').length,
    },
    {
      name: 'High',
      count: tasks.filter((t) => t.priority === 'high').length,
    },
  ];

  return (
    <div
      data-testid="progress-chart"
      style={{
        backgroundColor: '#f9f9f9',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '20px',
      }}
    >
      <h3 style={{ margin: '0 0 16px 0' }}>📊 Progress Dashboard</h3>

      {/* Key Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div
          data-testid="metric-total"
          style={{
            backgroundColor: 'white',
            padding: '12px',
            borderRadius: '4px',
            textAlign: 'center',
            border: '1px solid #e0e0e0',
          }}
        >
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>
            {totalCount}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Total Tasks</div>
        </div>

        <div
          data-testid="metric-done"
          style={{
            backgroundColor: 'white',
            padding: '12px',
            borderRadius: '4px',
            textAlign: 'center',
            border: '1px solid #e0e0e0',
          }}
        >
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
            {doneCount}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Completed</div>
        </div>

        <div
          data-testid="metric-progress"
          style={{
            backgroundColor: 'white',
            padding: '12px',
            borderRadius: '4px',
            textAlign: 'center',
            border: '1px solid #e0e0e0',
          }}
        >
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>
            {donePercentage}%
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Completion</div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {/* Task Count Chart */}
        <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Tasks by Column</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={columnData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2196F3" data-testid="bar-chart" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Distribution Chart */}
        <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Tasks by Priority</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#FF9800" data-testid="line-chart" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
          <span>Overall Completion Progress</span>
          <span data-testid="progress-percentage">{donePercentage}%</span>
        </div>
        <div
          style={{
            width: '100%',
            height: '24px',
            backgroundColor: '#e0e0e0',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <div
            data-testid="progress-bar"
            style={{
              height: '100%',
              width: `${donePercentage}%`,
              backgroundColor: '#4CAF50',
              transition: 'width 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            {donePercentage > 10 && `${donePercentage}%`}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressChart;
