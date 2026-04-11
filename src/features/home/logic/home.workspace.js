// src/features/home/logic/home.workspace.js

export function buildWorkspaceBuckets(tasks = []) {
  return {
    analyst: tasks.filter((task) => task?.workspace === 'analyst'),
    app: tasks.filter((task) => task?.workspace === 'app'),
    other: tasks.filter(
      (task) => !task?.workspace || !['analyst', 'app'].includes(task.workspace)
    ),
  }
}
