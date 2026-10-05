export type AppState = 'welcome' | 'chat' | 'delivery' | 'dashboard' | 'admin' | 'course_m1';

export interface CourseM1State {
  currentSection: number;
  completedSections: number[];
  userProject: string;
  selectedIntention: string;
  selectedPath: 'path_a' | 'path_b' | null;
  pastedProfile: string;
  milestones: {
    section_1_complete?: boolean;
    welcomeCompleted?: boolean;
    projectGrounded?: boolean;
    intentionSelected?: boolean;
    section_3_complete?: boolean;
    counterpartConfigured?: boolean;
    [key: string]: any;
  };
}

export interface SampleCrewMember {
  id: string;
  name: string;
  intention: string;
  tagline: string;
  role: string;
  posture: string;
  protects: string;
  samplePrompt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'guide';
  text: string;
  isHiddenTrigger?: boolean;
}

export interface FoundationRecord {
  crewName?: string;
  personName?: string;
  personaName?: string;
  coreValues?: string[];
  communicationStyle?: string;
  workingPreferences?: string;
  keyGoals?: string[];
  focuses?: string[];
  [key: string]: any;
}

export interface SpecialistRecord {
  id?: string;
  name?: string;
  role?: string;
  focus?: string;
  focuses?: string[];
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
