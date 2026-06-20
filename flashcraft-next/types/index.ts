export interface FileTree {
  path: string;
  content: string;
  type: "typescript" | "jsx" | "css" | "json" | "html" | "markdown" | "text";
}

export interface GeneratedCodeOutput {
  id: string;
  sessionId: string;
  files: FileTree[];
  buildStatus: "success" | "error" | "pending";
  buildError?: string;
  model: string;
}

export interface CodeGenerationRequest {
  prompt: string;
  model?: "claude-3-5-sonnet-20241022" | "claude-3-5-opus-20241022";
  context?: {
    framework?: string;
    styling?: string;
    includeTypes?: boolean;
  };
}

export interface CodeGenerationResponse {
  id: string;
  sessionId: string;
  files: FileTree[];
  previewUrl?: string;
  status: "generating" | "ready" | "error";
  error?: string;
}

export interface DeploymentResponse {
  id: string;
  liveUrl: string;
  status: "pending" | "building" | "live" | "failed";
  statusMessage?: string;
}

export interface StudioSessionResponse {
  id: string;
  prompt: string;
  status: string;
  previewUrl?: string;
  generatedCode?: GeneratedCodeOutput;
  deployments?: DeploymentResponse[];
  createdAt: string;
  updatedAt: string;
}
