import { runNotificationSystem, cleanupOldNotifications } from './notifications';

// Background task manager for automated processes
class BackgroundTaskManager {
  private intervalIds: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  // Start background tasks
  start() {
    if (this.isRunning) {
      console.log('Background tasks already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting background tasks...');

    // Run notification system every 6 hours
    this.scheduleTask('notifications', () => {
      this.runWithErrorHandling('Notification System', runNotificationSystem);
    }, 6 * 60 * 60 * 1000); // 6 hours

    // Clean up old notifications daily
    this.scheduleTask('cleanup', () => {
      this.runWithErrorHandling('Notification Cleanup', cleanupOldNotifications);
    }, 24 * 60 * 60 * 1000); // 24 hours

    // Run initial notification check immediately
    this.runWithErrorHandling('Initial Notification Check', runNotificationSystem);
  }

  // Stop background tasks
  stop() {
    if (!this.isRunning) {
      console.log('Background tasks are not running');
      return;
    }

    console.log('Stopping background tasks...');
    
    this.intervalIds.forEach((intervalId, taskName) => {
      clearInterval(intervalId);
      console.log(`Stopped task: ${taskName}`);
    });
    
    this.intervalIds.clear();
    this.isRunning = false;
  }

  // Schedule a recurring task
  private scheduleTask(name: string, task: () => void, intervalMs: number) {
    const intervalId = setInterval(task, intervalMs);
    this.intervalIds.set(name, intervalId);
    console.log(`Scheduled task "${name}" to run every ${intervalMs / 1000} seconds`);
  }

  // Run a task with error handling
  private async runWithErrorHandling(taskName: string, task: () => Promise<void>) {
    try {
      console.log(`Running ${taskName}...`);
      await task();
      console.log(`${taskName} completed successfully`);
    } catch (error) {
      console.error(`Error in ${taskName}:`, error);
      // In production, you might want to send this to a monitoring service
    }
  }

  // Get status of background tasks
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeTasks: Array.from(this.intervalIds.keys()),
      taskCount: this.intervalIds.size,
    };
  }
}

// Singleton instance
export const backgroundTaskManager = new BackgroundTaskManager();

// Auto-start in client-side environments
if (typeof window !== 'undefined') {
  // Start background tasks when the module loads
  backgroundTaskManager.start();

  // Stop tasks when the page unloads
  window.addEventListener('beforeunload', () => {
    backgroundTaskManager.stop();
  });
}

// Utility functions for manual task execution
export const runNotificationSystemNow = async () => {
  try {
    await runNotificationSystem();
    console.log('Manual notification system run completed');
  } catch (error) {
    console.error('Error running notification system manually:', error);
    throw error;
  }
};

export const runCleanupNow = async () => {
  try {
    await cleanupOldNotifications();
    console.log('Manual cleanup completed');
  } catch (error) {
    console.error('Error running cleanup manually:', error);
    throw error;
  }
};

// Export the manager for external control
export default backgroundTaskManager;