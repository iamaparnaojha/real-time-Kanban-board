import React, { useRef, useState, useEffect } from 'react';
import Select from 'react-select';

/**
 * TaskForm Component
 * Form to create new tasks with title, description, priority, category, and file upload
 */
function TaskForm({ onSubmit, isLoading = false, initialData = null, onCancel = null }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState({ value: 'medium', label: 'Medium' });
  const [category, setCategory] = useState({ value: 'feature', label: 'Feature' });
  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  const categoryOptions = [
    { value: 'bug', label: 'Bug' },
    { value: 'feature', label: 'Feature' },
    { value: 'enhancement', label: 'Enhancement' },
  ];

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setPriority(priorityOptions.find(p => p.value === initialData.priority) || { value: 'medium', label: 'Medium' });
      setCategory(categoryOptions.find(c => c.value === initialData.category) || { value: 'feature', label: 'Feature' });
      setFileUrl(initialData.fileUrl || null);
      setFileName(initialData.fileName || null);
      setFilePreview(initialData.fileUrl || null);
    } else {
      setTitle('');
      setDescription('');
      setPriority({ value: 'medium', label: 'Medium' });
      setCategory({ value: 'feature', label: 'Feature' });
      setFileUrl(null);
      setFileName(null);
      setFilePreview(null);
    }
  }, [initialData]);

  // Handle file upload to backend
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5242880) {
      alert('File size exceeds 5MB limit');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed');
      return;
    }

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      const data = await response.json();
      setFileUrl(data.url);
      setFileName(data.filename);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Title is required');
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority: priority.value,
      category: category.value,
      fileUrl,
      fileName,
    });

    // Reset form only if not editing
    if (!initialData) {
      setTitle('');
      setDescription('');
      setPriority({ value: 'medium', label: 'Medium' });
      setCategory({ value: 'feature', label: 'Feature' });
      setFileUrl(null);
      setFileName(null);
      setFilePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="task-form" style={{ marginBottom: '20px' }}>
      <div style={{ display: 'grid', gap: '12px', backgroundColor: '#f9f9f9', padding: '16px', borderRadius: '8px' }}>
        {/* Title Input */}
        <div>
          <label htmlFor="title" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Task Title *
          </label>
          <input
            id="title"
            type="text"
            placeholder="Enter task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-testid="input-title"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Description Input */}
        <div>
          <label htmlFor="description" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Description
          </label>
          <textarea
            id="description"
            placeholder="Enter task description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            data-testid="input-description"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxSizing: 'border-box',
              minHeight: '80px',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Priority Dropdown */}
        <div data-testid="select-priority">
          <label htmlFor="priority" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Priority
          </label>
          <Select
            inputId="priority"
            options={priorityOptions}
            value={priority}
            onChange={setPriority}
            isDisabled={isLoading}
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: '4px',
              }),
            }}
          />
        </div>

        {/* Category Dropdown */}
        <div data-testid="select-category">
          <label htmlFor="category" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Category
          </label>
          <Select
            inputId="category"
            options={categoryOptions}
            value={category}
            onChange={setCategory}
            isDisabled={isLoading}
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: '4px',
              }),
            }}
          />
        </div>

        {/* File Upload */}
        <div>
          <label htmlFor="file" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Upload Image (Optional)
          </label>
          <input
            id="file"
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            disabled={isLoading || uploadingFile}
            data-testid="input-file"
            style={{ padding: '4px' }}
          />
          {uploadingFile && <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Uploading...</p>}
          {filePreview && (
            <div style={{ marginTop: '8px' }}>
              <img
                src={filePreview}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100px',
                  borderRadius: '4px',
                  objectFit: 'cover',
                }}
                data-testid="file-preview"
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="submit"
            disabled={isLoading || uploadingFile}
            data-testid="btn-submit"
            style={{
              padding: '10px 16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading || uploadingFile ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: isLoading || uploadingFile ? 0.6 : 1,
            }}
          >
            {isLoading ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Task' : 'Create Task')}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading || uploadingFile}
              data-testid="btn-cancel"
              style={{
                padding: '10px 16px',
                backgroundColor: '#9e9e9e',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading || uploadingFile ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                opacity: isLoading || uploadingFile ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

export default TaskForm;
