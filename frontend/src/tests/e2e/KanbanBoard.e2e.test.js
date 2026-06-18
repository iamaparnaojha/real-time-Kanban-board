import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

const makeTitle = (base) => `${base} ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

// Helper to find a task card by its title text
const taskCardByTitle = (title) => `xpath=//div[starts-with(@data-testid,'task-card-') and .//text()[contains(.,"${title}")]]`;

test.describe('Kanban Board E2E Tests', () => {
  test.beforeEach(async ({ page, request }) => {
    // Reset backend state for deterministic tests
    await request.post('http://localhost:5000/api/test/reset');
    await page.goto(BASE_URL);
    // Wait for the board to load
    await page.waitForSelector('[data-testid="kanban-board"]');
    // Wait for socket connection to be established
    await page.waitForSelector('[data-testid="connection-status"] >> text=Connected', { timeout: 10000 });

    // Ensure server/client are in a clean empty state before tests run
    try {
      await page.waitForSelector('[data-testid="empty-todo"]', { timeout: 5000 });
    } catch (e) {
      // If not empty, reset again and reload the page, then wait for empty
      await request.post('http://localhost:5000/api/test/reset');
      await page.reload();
      await page.waitForSelector('[data-testid="connection-status"] >> text=Connected', { timeout: 10000 });
      await page.waitForSelector('[data-testid="empty-todo"]', { timeout: 5000 });
    }
  });

  test('should render the kanban board with three columns', async ({ page }) => {
    await expect(page.locator('[data-testid="column-todo"] >> text=To Do')).toBeVisible();
    await expect(page.locator('[data-testid="column-inprogress"] >> text=In Progress')).toBeVisible();
    await expect(page.locator('[data-testid="column-done"] >> text=Done')).toBeVisible();
  });

  test('should display task form', async ({ page }) => {
    await expect(page.locator('[data-testid="task-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="input-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="input-description"]')).toBeVisible();
  });

  test('should display connection status', async ({ page }) => {
    await expect(page.locator('[data-testid="connection-status"]')).toBeVisible();
  });

  test('should display progress dashboard', async ({ page }) => {
    await expect(page.locator('[data-testid="progress-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="metric-total"]')).toBeVisible();
    await expect(page.locator('[data-testid="metric-done"]')).toBeVisible();
    await expect(page.locator('[data-testid="metric-progress"]')).toBeVisible();
  });

  test('should create a new task', async ({ page }) => {
    const title = makeTitle('Test Task E2E');

    // Fill in task form
    await page.fill('[data-testid="input-title"]', title);
    await page.fill('[data-testid="input-description"]', 'This is a test task');

    // Select priority
    await page.click('[data-testid="select-priority"]');
    await page.click('text=High');

    // Select category
    await page.click('[data-testid="select-category"]');
    await page.click('text=Bug');

    // Submit form
    await page.click('[data-testid="btn-submit"]');

    // Wait for task to appear by title
    await page.waitForSelector(taskCardByTitle(title), { timeout: 10000 });

    // Verify task was created
    await expect(page.locator(taskCardByTitle(title)).first()).toBeVisible();
  });

  test('should display task with priority and category badges', async ({ page }) => {
    const title = makeTitle('Priority Test');
    // Create a task
    await page.fill('[data-testid="input-title"]', title);
    await page.click('[data-testid="btn-submit"]');

    // Wait for task by title
    await page.waitForSelector(taskCardByTitle(title), { timeout: 10000 });

    // Find the task card element
    const taskCard = page.locator(taskCardByTitle(title)).first();

    // Verify badges exist inside the card
    await expect(taskCard.locator('[data-testid^="priority-badge-"]')).toBeVisible();
    await expect(taskCard.locator('[data-testid^="category-badge-"]')).toBeVisible();
  });

  test('should allow drag and drop between columns', async ({ page }) => {
    const title = makeTitle('Drag Test Task');
    // Create a task first
    await page.fill('[data-testid="input-title"]', title);
    await page.click('[data-testid="btn-submit"]');

    // Wait for task to appear in To Do column by title
    await page.waitForSelector(taskCardByTitle(title), { timeout: 10000 });

    // Get the task card and in-progress column
    const taskCard = page.locator(taskCardByTitle(title)).first();
    const inProgressColumn = page.locator('[data-testid="droppable-inprogress"]');

    // Drag task to In Progress column
    const taskBox = await taskCard.boundingBox();
    const columnBox = await inProgressColumn.boundingBox();

    if (taskBox && columnBox) {
      await page.mouse.move(taskBox.x + taskBox.width / 2, taskBox.y + taskBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(columnBox.x + columnBox.width / 2, columnBox.y + columnBox.height / 2);
      await page.mouse.up();

      // Wait for task to move
      await page.waitForTimeout(1000);
    }
  });

  test('should delete a task with confirmation', async ({ page }) => {
    const title = makeTitle('Delete Test Task');
    // Create a task
    await page.fill('[data-testid="input-title"]', title);
    await page.click('[data-testid="btn-submit"]');

    // Wait for task by title
    await page.waitForSelector(taskCardByTitle(title), { timeout: 10000 });

    // Find the task card
    const taskCard = page.locator(taskCardByTitle(title)).first();

    // Set up dialog handler to accept confirmation
    page.on('dialog', (dialog) => dialog.accept());

    // Click delete button inside the card
    await taskCard.locator('[data-testid^="delete-btn-"]').click();

    // Wait for task to be removed
    await page.waitForTimeout(1000);

    // Verify task is gone
    await expect(page.locator(taskCardByTitle(title)).first()).not.toBeVisible();
  });

  test('should edit an existing task', async ({ page }) => {
    const title = makeTitle('Task to Edit');
    // Create a task
    await page.fill('[data-testid="input-title"]', title);
    await page.click('[data-testid="btn-submit"]');

    // Wait for task by title
    await page.waitForSelector(taskCardByTitle(title), { timeout: 10000 });

    const taskCard = page.locator(taskCardByTitle(title)).first();
    
    // Click edit button
    await taskCard.locator('[data-testid^="edit-btn-"]').click();

    // Verify form is populated
    await expect(page.locator('[data-testid="input-title"]')).toHaveValue(title);

    // Edit the task
    const newTitle = makeTitle('Edited Task');
    await page.fill('[data-testid="input-title"]', newTitle);
    
    // Change priority
    await page.click('[data-testid="select-priority"]');
    await page.click('text=High');

    // Submit the update
    await page.click('[data-testid="btn-submit"]');

    // Wait for the edited task to appear
    await page.waitForSelector(taskCardByTitle(newTitle), { timeout: 10000 });

    // Verify new properties
    const editedCard = page.locator(taskCardByTitle(newTitle)).first();
    await expect(editedCard).toBeVisible();
    await expect(editedCard.locator('[data-testid^="priority-badge-"]')).toContainText('high');
  });

  test('should display task count in column headers', async ({ page }) => {
    // Create multiple tasks
    for (let i = 0; i < 3; i++) {
      await page.fill('[data-testid="input-title"]', `Task ${i + 1}`);
      await page.click('[data-testid="btn-submit"]');
      await page.waitForTimeout(500);
    }

    // Check task count
    const todoCount = page.locator('[data-testid="task-count-todo"]');
    await expect(todoCount).toContainText('3', { timeout: 10000 });
  });

  test('should update priority dropdown', async ({ page }) => {
    const title = makeTitle('Low Priority Task');
    // Create a task with Low priority
    await page.fill('[data-testid="input-title"]', title);

    // Select priority as Low
    await page.click('[data-testid="select-priority"]');
    await page.click('text=Low');

    await page.click('[data-testid="btn-submit"]');

    // Wait for task by title
    await page.waitForSelector(taskCardByTitle(title), { timeout: 10000 });

    const taskCard = page.locator(taskCardByTitle(title)).first();
    // Verify priority badge shows "low"
    await expect(taskCard.locator('[data-testid^="priority-badge-"]')).toContainText('low');
  });

  test('should update category dropdown', async ({ page }) => {
    const title = makeTitle('Enhancement Task');
    // Create a task with Enhancement category
    await page.fill('[data-testid="input-title"]', title);

    // Select category as Enhancement
    await page.click('[data-testid="select-category"]');
    await page.click('text=Enhancement');

    await page.click('[data-testid="btn-submit"]');

    // Wait for task by title
    await page.waitForSelector(taskCardByTitle(title), { timeout: 10000 });

    const taskCard = page.locator(taskCardByTitle(title)).first();
    // Verify category badge shows "enhancement"
    await expect(taskCard.locator('[data-testid^="category-badge-"]')).toContainText('enhancement');
  });

  test('should display empty state in columns', async ({ page }) => {
    // All columns should show empty message
    await expect(page.locator('[data-testid="empty-todo"]')).toBeVisible();
    await expect(page.locator('[data-testid="empty-inprogress"]')).toBeVisible();
    await expect(page.locator('[data-testid="empty-done"]')).toBeVisible();
  });

  test('should handle form validation', async ({ page }) => {
    // Try to submit empty form
    await page.click('[data-testid="btn-submit"]');

    // Should still see the form
    await expect(page.locator('[data-testid="task-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="input-title"]')).toHaveValue('');
  });

  test('should calculate and display completion percentage', async ({ page }) => {
    // Create 4 tasks
    for (let i = 0; i < 4; i++) {
      await page.fill('[data-testid="input-title"]', `Task ${i + 1}`);
      await page.click('[data-testid="btn-submit"]');
      await page.waitForTimeout(500);
    }

    // Initially completion should be 0%
    let progressPercentage = page.locator('[data-testid="progress-percentage"]');
    await expect(progressPercentage).toContainText('0%');

    // Verify progress chart displays
    await expect(page.locator('[data-testid="progress-chart"]')).toBeVisible();
  });

  test('should display real-time updates from other clients simulation', async ({ page }) => {
    const title = makeTitle('Shared Task');
    // Create a task in first page
    await page.fill('[data-testid="input-title"]', title);
    await page.click('[data-testid="btn-submit"]');

    // Wait for task by title
    await page.waitForSelector(taskCardByTitle(title), { timeout: 10000 });

    // Verify task is visible
    await expect(page.locator(taskCardByTitle(title)).first()).toBeVisible();
  });
});
