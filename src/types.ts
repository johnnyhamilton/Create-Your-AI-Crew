export type AppState = 'welcome' | 'chat' | 'delivery';

export interface Message {
  id: string;
  role: 'user' | 'guide';
  text: string;
  isHiddenTrigger?: boolean;
}

export interface FoundationRecord {
  personName?: string;
  coreValues?: string[];
  communicationStyle?: string;
  workingPreferences?: string;
  keyGoals?: string[];
  [key: string]: any;
}

export interface SpecialistRecord {
  role?: string;
  archetype?: string;
  directives?: string[];
  specializations?: string[];
  [key: string]: any;
}

export type PlatformTarget =
  | 'fyi_persona'
  | 'gemini_gem'
  | 'claude_project'
  | 'chatgpt_project'
  | 'copilot_agent'
  | 'generic_session';

export interface PlatformOption {
  id: PlatformTarget;
  label: string;
  description: string;
}

export interface GenerationPayload {
  generationDate: string;
  artifactType: 'crew_profile';
  traitsAlreadyInstalled: boolean;
  platformTarget: PlatformTarget;
  defaultMember: string;
  traits: FoundationRecord;
  crew: SpecialistRecord[];
}
