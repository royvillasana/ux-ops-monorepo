export type RunStatus = 'queued' | 'running' | 'success' | 'failed';

export interface ArtifactRun {
  id: string;
  artifact: string;
  framework: string;
  status: RunStatus;
  updatedAt: string;
}

export interface BotRun {
  id: string;
  bot: string;
  task: string;
  status: RunStatus;
  updatedAt: string;
}
