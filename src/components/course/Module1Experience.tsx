import React, { useState, useRef, useEffect } from 'react';
import { Module1Sidebar } from './Module1Sidebar';
import { CanvasSection1 } from './CanvasSection1';
import { CanvasSection2 } from './CanvasSection2';
import { CanvasSection3 } from './CanvasSection3';
import { CanvasSection4 } from './CanvasSection4';
import { Module1Chat, Message, INITIAL_GUIDE_MESSAGE } from './Module1Chat';
import { CourseM1State, SampleCrewMember } from '../../types';
import { Layout, MessageSquare, CheckCircle2, ArrowRight, X, Lock } from 'lucide-react';

interface Module1ExperienceProps {
  onExitCourse: () => void;
  onReviewCrewProfile?: () => void;
  onBackToDashboard?: () => void;
  crewMemberName?: string;
}

export const Module1Experience: React.FC<Module1ExperienceProps> = ({
  onExitCourse,
  onReviewCrewProfile,
  onBackToDashboard,
  crewMemberName,
}) => {
  const [showCelebrationModal, setShowCelebrationModal] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<'canvas' | 'chat'>('canvas');
  const [externalTriggerMessage, setExternalTriggerMessage] = useState<string | null>(null);
  const [prePopulatedInput, setPrePopulatedInput] = useState<string | null>(null);

  // Section 1 Two-Phase Flow state: 'watching' (Phase 1) vs 'conversation' (Phase 2)
  const [section1Phase, setSection1Phase] = useState<'watching' | 'conversation'>('watching');

  // Section 2 Tab Selector state: 'screencast' vs 'energy'
  const [section2Tab, setSection2Tab] = useState<'screencast' | 'energy'>('screencast');

  // Sub-item tracking for free navigation and active accent tag in sidebar
  const [activeSubItem, setActiveSubItem] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const secParam = params.get('section');
      const savedSec =
        localStorage.getItem('active_section') ||
        localStorage.getItem('course_m1_active_section');
      const sec = secParam ? parseInt(secParam, 10) : (savedSec ? parseInt(savedSec, 10) : 1);
      if (sec === 2) return '2.1';
      if (sec === 3) return '3.1';
      if (sec === 4) return '4.1';
    }
    return '1.1';
  });

  // Draggable resizable panes state (Defaults: 20% Sidebar, 30% Canvas, 50% Chat)
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [activeResizer, setActiveResizer] = useState<'sidebar' | 'canvas' | null>(null);

  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('course_m1_sidebar_width');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 200) return parsed;
      }
    } catch {}
    if (typeof window !== 'undefined') {
      return Math.max(200, Math.round(window.innerWidth * 0.20));
    }
    return 280;
  });

  const [canvasWidth, setCanvasWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('course_m1_canvas_width');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 260) return parsed;
      }
    } catch {}
    if (typeof window !== 'undefined') {
      return Math.max(260, Math.round(window.innerWidth * 0.30));
    }
    return 420;
  });

  // Track whether companion reader is expanded to grant ample breathing room for comparison tables
  const [isReaderExpanded, setIsReaderExpanded] = useState<boolean>(false);

  // Persist customized pane dimensions
  useEffect(() => {
    try {
      localStorage.setItem('course_m1_sidebar_width', sidebarWidth.toString());
    } catch {}
  }, [sidebarWidth]);

  useEffect(() => {
    try {
      localStorage.setItem('course_m1_canvas_width', canvasWidth.toString());
    } catch {}
  }, [canvasWidth]);

  // Persistent conversation thread: preserves continuous message history across all sections
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved =
        sessionStorage.getItem('course_m1_conversation_messages') ||
        localStorage.getItem('course_m1_conversation_messages') ||
        localStorage.getItem('messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If the first message in storage still had the legacy completedSections: [1], sanitize it
          if (parsed[0]?.id === 'guide-intro' && parsed[0]?.text?.includes('"completedSections": [1]')) {
            parsed[0] = INITIAL_GUIDE_MESSAGE;
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not restore chat messages from storage:', e);
    }
    return [INITIAL_GUIDE_MESSAGE];
  });

  // Keep storage synchronized with conversation thread
  useEffect(() => {
    try {
      const serialized = JSON.stringify(messages);
      sessionStorage.setItem('course_m1_conversation_messages', serialized);
      localStorage.setItem('course_m1_conversation_messages', serialized);
      localStorage.setItem('messages', serialized);
    } catch (e) {
      console.warn('Could not persist chat messages to storage:', e);
    }
  }, [messages]);

  // Initial state: Parse URL ?section= or localStorage, and restore persistent courseState
  const [courseState, setCourseState] = useState<CourseM1State>(() => {
    let initialSec = 1;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const secParam = params.get('section');
      if (secParam) {
        const parsed = parseInt(secParam, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 4) {
          initialSec = parsed;
        }
      } else {
        const savedSec =
          localStorage.getItem('active_section') ||
          localStorage.getItem('course_m1_active_section');
        if (savedSec) {
          const parsed = parseInt(savedSec, 10);
          if (!isNaN(parsed) && parsed >= 1 && parsed <= 4) {
            initialSec = parsed;
          }
        }
      }
    }

    let savedCompleted: number[] = [];
    try {
      const savedRaw =
        localStorage.getItem('completed_sections_array') ||
        localStorage.getItem('course_m1_completed_sections');
      if (savedRaw) {
        const parsedArr = JSON.parse(savedRaw);
        if (Array.isArray(parsedArr)) {
          savedCompleted = parsedArr.filter((n) => typeof n === 'number' && n >= 1 && n <= 4);
        }
      }
    } catch {}

    try {
      const saved = localStorage.getItem('course_m1_state') || sessionStorage.getItem('course_m1_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const existingCompleted = Array.isArray(parsed.completedSections) ? parsed.completedSections : [];
          const mergedCompleted = Array.from(
            new Set([
              ...existingCompleted,
              ...savedCompleted,
              ...(initialSec > 1 ? Array.from({ length: initialSec - 1 }, (_, i) => i + 1) : []),
              ...(parsed.milestones?.module_1_complete || (parsed as any).module_1_complete ? [4] : []),
            ])
          );

          return {
            ...parsed,
            currentSection: initialSec,
            completedSections: mergedCompleted,
            milestones: {
              ...(parsed.milestones || {}),
              section_1_complete: mergedCompleted.includes(1) || Boolean(parsed.milestones?.section_1_complete),
              welcomeCompleted: mergedCompleted.includes(1) || Boolean(parsed.milestones?.welcomeCompleted),
              projectGrounded: mergedCompleted.includes(2) || Boolean(parsed.milestones?.projectGrounded),
              intentionSelected: mergedCompleted.includes(3) || Boolean(parsed.milestones?.intentionSelected),
              section_3_complete: mergedCompleted.includes(3) || Boolean(parsed.milestones?.section_3_complete),
              counterpartConfigured: mergedCompleted.includes(4) || Boolean(parsed.milestones?.counterpartConfigured),
              module_1_complete: mergedCompleted.includes(4) || Boolean(parsed.milestones?.module_1_complete),
            },
          };
        }
      }
    } catch {}

    const defaultCompleted = Array.from(
      new Set([
        ...savedCompleted,
        ...(initialSec > 1 ? Array.from({ length: initialSec - 1 }, (_, i) => i + 1) : []),
      ])
    );

    return {
      currentSection: initialSec,
      completedSections: defaultCompleted,
      userProject: '',
      selectedIntention: '',
      selectedPath: null,
      pastedProfile: '',
      milestones: {
        section_1_complete: defaultCompleted.includes(1),
        welcomeCompleted: defaultCompleted.includes(1),
        projectGrounded: defaultCompleted.includes(2),
        intentionSelected: defaultCompleted.includes(3),
        section_3_complete: defaultCompleted.includes(3),
        counterpartConfigured: defaultCompleted.includes(4),
        module_1_complete: defaultCompleted.includes(4),
      },
    };
  });

  // Synchronize localStorage and URL query param with courseState
  useEffect(() => {
    try {
      localStorage.setItem('active_section', courseState.currentSection.toString());
      localStorage.setItem('course_m1_active_section', courseState.currentSection.toString());
      localStorage.setItem('completed_sections_array', JSON.stringify(courseState.completedSections));
      localStorage.setItem('course_m1_completed_sections', JSON.stringify(courseState.completedSections));
      localStorage.setItem('course_m1_state', JSON.stringify(courseState));
      sessionStorage.setItem('course_m1_state', JSON.stringify(courseState));

      if (typeof window !== 'undefined') {
        const currentUrl = new URL(window.location.href);
        if (currentUrl.searchParams.get('section') !== courseState.currentSection.toString()) {
          currentUrl.searchParams.set('section', courseState.currentSection.toString());
          window.history.replaceState({}, '', currentUrl.toString());
        }
      }
    } catch {}
  }, [courseState]);

  // Handle browser back/forward buttons or external URL changes
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const secParam = params.get('section');
      if (secParam) {
        const parsed = parseInt(secParam, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 4 && parsed !== courseState.currentSection) {
          handleSelectSection(parsed);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [courseState.currentSection]);

  // Auto-scroll Pane 2 smoothly to bottom when Module 1 completes to reveal completion card
  useEffect(() => {
    const isM1Complete = Boolean(
      courseState.currentSection === 4 &&
      (courseState.milestones?.module_1_complete ||
        (courseState as any).module_1_complete ||
        courseState.completedSections.includes(4))
    );
    if (isM1Complete && canvasContainerRef.current) {
      const scrollDown = () => {
        if (canvasContainerRef.current) {
          canvasContainerRef.current.scrollTo({
            top: canvasContainerRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      };
      const t1 = setTimeout(scrollDown, 100);
      const t2 = setTimeout(scrollDown, 400);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [
    courseState.currentSection,
    courseState.milestones?.module_1_complete,
    courseState.completedSections,
    courseState.pastedProfile,
  ]);

  // Synchronize activeSubItem with active section & inner phase
  useEffect(() => {
    if (courseState.currentSection !== 1) {
      setIsReaderExpanded(false);
    }
  }, [courseState.currentSection]);

  useEffect(() => {
    if (courseState.currentSection === 1) {
      setActiveSubItem(section1Phase === 'watching' ? '1.1' : '1.2');
    } else if (courseState.currentSection === 2) {
      setActiveSubItem(section2Tab === 'screencast' ? '2.1' : '2.2');
    } else if (courseState.currentSection === 3) {
      if (!activeSubItem.startsWith('3.')) {
        setActiveSubItem('3.1');
      }
    } else if (courseState.currentSection === 4) {
      if (!activeSubItem.startsWith('4.')) {
        setActiveSubItem('4.1');
      }
    }
  }, [courseState.currentSection, section1Phase, section2Tab]);

  // Determine current mode:
  // "Watching Mode": Section 1 (during Phase 1 welcome video) and throughout Section 2
  // "Conversation Mode": Section 1 (Phase 2 after welcome), Section 3, Section 4
  const isWatchingMode =
    (courseState.currentSection === 1 && section1Phase === 'watching') ||
    courseState.currentSection === 2;

  // Handle dragging splitters
  useEffect(() => {
    if (!activeResizer) return;

    const handleDragMove = (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const containerWidth = rect.width;

      if (activeResizer === 'sidebar') {
        const mouseX = clientX - rect.left;
        const minSidebar = 200;
        // In watching mode, only canvas follows sidebar. In conversation mode, leave room for canvas (260) + chat (380) + splitters (16)
        const maxSidebar = isWatchingMode
          ? containerWidth - 260 - 8
          : containerWidth - 260 - 380 - 16;
        const clampedSidebar = Math.min(Math.max(mouseX, minSidebar), Math.max(minSidebar, maxSidebar));
        setSidebarWidth(Math.round(clampedSidebar));
      } else if (activeResizer === 'canvas') {
        const effectiveSidebar = isSidebarCollapsed ? 56 : sidebarWidth;
        const splitter1Width = isSidebarCollapsed ? 0 : 8;
        const mouseX = clientX - rect.left;
        // Canvas width is distance between right of sidebar splitter and the cursor
        const newCanvas = mouseX - effectiveSidebar - splitter1Width;
        const minCanvas = 260;
        const minChat = 380;
        const maxCanvas = containerWidth - effectiveSidebar - splitter1Width - 8 - minChat;
        const clampedCanvas = Math.min(Math.max(newCanvas, minCanvas), Math.max(minCanvas, maxCanvas));
        setCanvasWidth(Math.round(clampedCanvas));
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleDragMove(e.touches[0].clientX);
      }
    };

    const handleEndDrag = () => {
      setActiveResizer(null);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEndDrag);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEndDrag);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEndDrag);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEndDrag);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [activeResizer, isWatchingMode, isSidebarCollapsed, sidebarWidth]);

  // Automatically reset Canvas scroll position to top: 0 on section or tab changes
  useEffect(() => {
    if (canvasContainerRef.current) {
      canvasContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [courseState.currentSection, section1Phase, section2Tab]);

  const handleStateUpdate = (partialState: Partial<CourseM1State>) => {
    setCourseState((prev) => {
      // Strictly require milestones.section_1_complete === true to mark section 1 complete
      const isSection1JustCompleted = partialState.milestones?.section_1_complete === true;

      // Section 3 completion: marked when section_3_complete is true, or completedSections includes 3
      const isSection3JustCompleted =
        (partialState as any).section_3_complete === true ||
        partialState.milestones?.section_3_complete === true ||
        (partialState.completedSections && partialState.completedSections.includes(3));

      // Section 4 / Module 1 completion
      const isM1JustCompleted =
        (partialState as any).module_1_complete === true ||
        partialState.milestones?.module_1_complete === true ||
        Boolean(partialState.milestones?.counterpartConfigured) ||
        (partialState.completedSections && partialState.completedSections.includes(4));

      const mergedCompleted = new Set(prev.completedSections);
      if (isSection1JustCompleted) {
        mergedCompleted.add(1);
      }
      if (isSection3JustCompleted) {
        mergedCompleted.add(3);
      }
      if (isM1JustCompleted) {
        mergedCompleted.add(1);
        mergedCompleted.add(2);
        mergedCompleted.add(3);
        mergedCompleted.add(4);
      }
      if (partialState.completedSections) {
        partialState.completedSections.forEach((s) => {
          if (s === 1) {
            if (isSection1JustCompleted || prev.milestones?.section_1_complete) {
              mergedCompleted.add(1);
            }
          } else {
            mergedCompleted.add(s);
          }
        });
      }

      // ELIMINATE AUTO-BOUNCING:
      // Do NOT automatically switch the screen from Section 1 to Section 2 when the user sends their chat message.
      // Similarly, NEVER automatically advance from Section 3 to Section 4 on chat updates; require explicit click on the Canvas action button.
      let newSection = prev.currentSection;
      if (prev.currentSection === 1 && partialState.currentSection === 2) {
        newSection = 1;
      } else if (prev.currentSection === 3 && partialState.currentSection === 4) {
        newSection = 3;
      } else if (partialState.currentSection !== undefined && prev.currentSection !== 1 && prev.currentSection !== 3) {
        newSection = partialState.currentSection;
      }

      return {
        ...prev,
        ...partialState,
        completedSections: Array.from(mergedCompleted),
        currentSection: newSection,
        milestones: {
          ...prev.milestones,
          ...(partialState.milestones || {}),
          ...(isSection3JustCompleted ? { section_3_complete: true } : {}),
          ...(isM1JustCompleted ? { module_1_complete: true, counterpartConfigured: true } : {}),
        },
      };
    });
  };

  const handleSelectSection = (secNum: number) => {
    setCourseState((prev) => {
      const mergedCompleted = new Set(prev.completedSections);
      if (secNum > 1) {
        for (let i = 1; i < secNum; i++) {
          mergedCompleted.add(i);
        }
      }
      return {
        ...prev,
        currentSection: secNum,
        completedSections: Array.from(mergedCompleted),
      };
    });

    if (secNum === 1) {
      setSection1Phase('watching');
      setActiveSubItem('1.1');
      setMobileActiveTab('canvas');
    } else if (secNum === 2) {
      setSection2Tab('screencast');
      setActiveSubItem('2.1');
      setMobileActiveTab('canvas');
    } else if (secNum === 3) {
      setActiveSubItem('3');
      setMobileActiveTab('canvas');
    } else if (secNum === 4) {
      setActiveSubItem('4');
      setMobileActiveTab('canvas');
      if (!courseState.milestones?.counterpartConfigured && !courseState.completedSections.includes(4)) {
        setExternalTriggerMessage(
          'I am entering Section 4: Lock Your Profile. Please guide me through configuring my counterpart foundation.'
        );
      }
    }
  };

  // Clickable Sub-Item Free Navigation
  const handleSelectSubItem = (subId: string) => {
    setActiveSubItem(subId);

    if (subId === '1.1') {
      setCourseState((prev) => ({ ...prev, currentSection: 1 }));
      setSection1Phase('watching');
      setMobileActiveTab('canvas');
    } else if (subId === '1.2') {
      setCourseState((prev) => ({ ...prev, currentSection: 1 }));
      setSection1Phase('conversation');
      setMobileActiveTab('chat');
    } else if (subId === '2.1') {
      setCourseState((prev) => ({ ...prev, currentSection: 2 }));
      setSection2Tab('screencast');
      setMobileActiveTab('canvas');
    } else if (subId === '2.2') {
      setCourseState((prev) => ({ ...prev, currentSection: 2 }));
      setSection2Tab('energy');
      setMobileActiveTab('canvas');
    } else if (subId === '3' || subId === '3.1' || subId === '3.2') {
      setCourseState((prev) => ({ ...prev, currentSection: 3 }));
      setActiveSubItem('3');
      setMobileActiveTab('canvas');
    } else if (subId === '4' || subId === '4.1' || subId === '4.2' || subId === '4.3') {
      setCourseState((prev) => ({ ...prev, currentSection: 4 }));
      setActiveSubItem('4');
      setMobileActiveTab('canvas');
    }
  };

  // Section 1: Transition from Phase 1 (Watching) to Phase 2 (Conversation)
  const handleContinueToIntroduce = () => {
    setSection1Phase('conversation');
    setActiveSubItem('1.2');
    setMobileActiveTab('chat');
  };

  // Section 1: Allow re-watching the welcome video
  const handleRewatchSection1 = () => {
    setSection1Phase('watching');
    setActiveSubItem('1.1');
    setMobileActiveTab('canvas');
  };

  // Advance from Section 1 to Section 2 deliberately via user action
  const handleProceedFromSection1To2 = () => {
    setCourseState((prev) => ({
      ...prev,
      currentSection: 2,
      completedSections: Array.from(new Set([...prev.completedSections, 1])),
      milestones: {
        ...prev.milestones,
        section_1_complete: true,
        welcomeCompleted: true,
      },
    }));
    setSection2Tab('screencast');
    setActiveSubItem('2.1');
    setMobileActiveTab('canvas');
  };

  // Advance from Section 2 to Section 3: Transition to Conversation Mode and fire clean transition message
  const handleProceedFromSection2To3 = () => {
    setCourseState((prev) => ({
      ...prev,
      currentSection: 3,
      completedSections: Array.from(new Set([...prev.completedSections, 2])),
    }));
    setActiveSubItem('3');
    setMobileActiveTab('chat');
    setExternalTriggerMessage('Moving on to Section 3.');
  };

  // Advance from Section 3 to Section 4: Triggered strictly by clicking the emerald action button
  const handleProceedFromSection3To4 = () => {
    setCourseState((prev) => ({
      ...prev,
      currentSection: 4,
      completedSections: Array.from(new Set([...prev.completedSections, 3])),
      milestones: {
        ...prev.milestones,
        section_3_complete: true,
      },
    }));
    setActiveSubItem('4');
    setMobileActiveTab('canvas');
    setExternalTriggerMessage(
      'I am entering Section 4: Lock Your Profile. Please guide me through configuring my counterpart foundation.'
    );
  };

  const handleSendSampleToChat = (member: SampleCrewMember) => {
    setExternalTriggerMessage(
      `I'd like to explore the "${member.name}" counterpart archetype (${member.intention} posture: "${member.role}"). How would trying on this look stretch my thinking on my project? And how can I use My Crew to build my tailored version?`
    );
    setMobileActiveTab('chat');
  };

  const handleReviewProfile = () => {
    setShowCelebrationModal(false);
    if (onReviewCrewProfile) {
      onReviewCrewProfile();
    } else {
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', '/my-crew');
      }
      onExitCourse();
    }
  };

  const handleBackToOverview = () => {
    setShowCelebrationModal(false);
    if (canvasContainerRef.current) {
      canvasContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDashboard = () => {
    setShowCelebrationModal(false);
    if (onBackToDashboard) {
      onBackToDashboard();
    } else {
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', '/my-crew');
      }
      onExitCourse();
    }
  };

  const handleCompleteModule1 = () => {
    setCourseState((prev) => ({
      ...prev,
      completedSections: Array.from(new Set([...prev.completedSections, 1, 2, 3, 4])),
      milestones: {
        ...prev.milestones,
        module_1_complete: true,
        counterpartConfigured: true,
      },
    }));
    setShowCelebrationModal(true);
    // Strictly do NOT dispatch raw user text into chat; auto-scroll canvas container to bottom
    if (canvasContainerRef.current) {
      setTimeout(() => {
        canvasContainerRef.current?.scrollTo({
          top: canvasContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 100);
    }
  };

  // Helper to resolve locked intention and crew member name for Key Recap
  const lockedIntention = (() => {
    if (courseState.selectedIntention && courseState.selectedIntention.trim()) {
      return courseState.selectedIntention.trim();
    }
    if (courseState.milestones?.selectedIntention && typeof courseState.milestones.selectedIntention === 'string') {
      return courseState.milestones.selectedIntention.trim();
    }
    return 'Specialist Alignment';
  })();

  const memberName = (() => {
    if (crewMemberName && crewMemberName.trim() && crewMemberName !== 'AI Crew') {
      return crewMemberName.trim();
    }
    const textsToCheck: string[] = [];
    if (courseState.pastedProfile) textsToCheck.push(courseState.pastedProfile);
    if (messages && messages.length > 0) {
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'user' && messages[i].text.length > 25) {
          textsToCheck.push(messages[i].text);
        }
      }
    }
    for (const text of textsToCheck) {
      const lines = text.split('\n');
      for (const rawLine of lines) {
        const line = rawLine.trim();
        const match = line.match(/^(?:#+\s*)?(?:\*\*|\*|__)?(?:name|specialist|counterpart|member|crew member|role)(?:\*\*|\*|__)?:\s*(.+)/i);
        if (match && match[1]) {
          const clean = match[1].replace(/[*#`_]/g, '').trim();
          if (clean && clean.length >= 2 && clean.length <= 40) return clean;
        }
        if (line.startsWith('# ') || line.startsWith('## ')) {
          const heading = line.replace(/^#+\s*/, '').replace(/[*#`_]/g, '').trim();
          if (
            heading &&
            heading.length >= 2 &&
            heading.length <= 35 &&
            !heading.toLowerCase().includes('foundation') &&
            !heading.toLowerCase().includes('profile') &&
            !heading.toLowerCase().includes('template') &&
            !heading.toLowerCase().includes('module')
          ) {
            return heading;
          }
        }
      }
    }
    return 'Primary Counterpart';
  })();

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full overflow-hidden bg-stone-100">
      {/* Mobile Tab Switcher (Visible on < lg screens only in Conversation Mode) */}
      {!isWatchingMode && (
        <div className="lg:hidden flex items-center justify-around border-b border-stone-200 bg-white px-2 py-1.5 shrink-0 z-10">
          <button
            onClick={() => setMobileActiveTab('canvas')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
              mobileActiveTab === 'canvas'
                ? 'bg-[#004364] text-white'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Section Canvas (Assets)</span>
          </button>
          <button
            onClick={() => setMobileActiveTab('chat')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
              mobileActiveTab === 'chat'
                ? 'bg-[#004364] text-white'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Guide Conversation</span>
          </button>
        </div>
      )}

      {/* Main Container Layout with Draggable Splitters */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden relative">
        {/* Collapsible Left Sidebar with Subsections */}
        <Module1Sidebar
          currentSection={courseState.currentSection}
          completedSections={courseState.completedSections}
          activeSubItem={activeSubItem}
          isCollapsed={isSidebarCollapsed}
          width={sidebarWidth}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onSelectSection={handleSelectSection}
          onSelectSubItem={handleSelectSubItem}
          onExitCourse={onExitCourse}
        />

        {/* Splitter 1: Sidebar <-> Canvas */}
        {!isSidebarCollapsed && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize sidebar pane"
            tabIndex={0}
            onMouseDown={(e) => {
              e.preventDefault();
              setActiveResizer('sidebar');
            }}
            onTouchStart={() => setActiveResizer('sidebar')}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') {
                setSidebarWidth((w) => Math.max(200, w - 20));
              } else if (e.key === 'ArrowRight') {
                setSidebarWidth((w) => Math.min(480, w + 20));
              }
            }}
            className={`hidden lg:flex items-center justify-center w-2 shrink-0 cursor-col-resize select-none z-20 transition-colors border-x border-stone-200/50 ${
              activeResizer === 'sidebar'
                ? 'bg-sky-500'
                : 'bg-stone-200/80 hover:bg-sky-400/80'
            }`}
            title="Drag to resize sidebar (or use Left/Right arrow keys)"
          >
            <div
              className={`w-0.5 h-8 rounded-full transition-colors ${
                activeResizer === 'sidebar' ? 'bg-white' : 'bg-stone-400 group-hover:bg-white'
              }`}
            />
          </div>
        )}

        {/* Canvas / Media Pane */}
        {/* In Watching Mode or when Reader is expanded: Full-width container; in Conversation Mode: customized width (default 30%, min 260px) */}
        <div
          ref={canvasContainerRef}
          style={
            !isWatchingMode && !isReaderExpanded
              ? { width: `${canvasWidth}px` }
              : undefined
          }
          className={`overflow-y-auto transition-[width] duration-300 ease-in-out ${
            isWatchingMode || isReaderExpanded
              ? 'w-full flex-1 bg-stone-50/50 p-4 sm:p-8'
              : `w-full flex-1 min-w-[260px] lg:flex-none lg:shrink-0 border-r border-stone-200 bg-white p-4 sm:p-6 ${
                  mobileActiveTab === 'canvas' ? 'block' : 'hidden lg:block'
                }`
          }`}
        >
          {courseState.currentSection === 1 && (
            <CanvasSection1
              isCompleted={Boolean(courseState.milestones.section_1_complete)}
              phase={section1Phase}
              onContinueToIntroduce={handleContinueToIntroduce}
              onRewatch={handleRewatchSection1}
              onProceedToSection2={handleProceedFromSection1To2}
              onReaderToggle={setIsReaderExpanded}
            />
          )}

          {courseState.currentSection === 2 && (
            <CanvasSection2
              isCompleted={courseState.completedSections.includes(2)}
              userProject={courseState.userProject}
              activeTab={section2Tab}
              onTabChange={(tab) => {
                setSection2Tab(tab);
                setActiveSubItem(tab === 'screencast' ? '2.1' : '2.2');
              }}
              onProceedToSection3={handleProceedFromSection2To3}
            />
          )}

          {courseState.currentSection === 3 && (
            <CanvasSection3
              isCompleted={Boolean(
                courseState.completedSections.includes(3) ||
                courseState.milestones?.section_3_complete ||
                (courseState as any).section_3_complete
              )}
              onProceedToSection4={handleProceedFromSection3To4}
            />
          )}

          {courseState.currentSection === 4 && (
            <CanvasSection4
              isCompleted={Boolean(
                courseState.completedSections.includes(4) ||
                courseState.milestones?.module_1_complete ||
                (courseState as any).module_1_complete ||
                courseState.milestones?.counterpartConfigured
              )}
              isModule1Done={Boolean(
                courseState.milestones?.module_1_complete ||
                (courseState as any).module_1_complete ||
                (courseState.completedSections.includes(4) && courseState.milestones?.counterpartConfigured)
              )}
              selectedPath={courseState.selectedPath}
              pastedProfile={courseState.pastedProfile}
              onUpdatePastedProfile={(val) =>
                setCourseState((prev) => ({ ...prev, pastedProfile: val }))
              }
              onSelectPath={(path) => {
                setCourseState((prev) => ({
                  ...prev,
                  selectedPath: path,
                }));
                if (path === 'path_b') {
                  setExternalTriggerMessage(
                    'I am choosing Path B to create a new crew member via My Crew.'
                  );
                }
              }}
              onSendSampleToChat={handleSendSampleToChat}
              onCompleteModule={handleCompleteModule1}
              onReviewCrewProfile={handleReviewProfile}
              onBackToDashboard={handleDashboard}
              onBackToOverview={handleBackToOverview}
            />
          )}
        </div>

        {/* Splitter 2: Canvas <-> Conversation */}
        {!isWatchingMode && !isReaderExpanded && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize canvas and conversation panes"
            tabIndex={0}
            onMouseDown={(e) => {
              e.preventDefault();
              setActiveResizer('canvas');
            }}
            onTouchStart={() => setActiveResizer('canvas')}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') {
                setCanvasWidth((w) => Math.max(260, w - 20));
              } else if (e.key === 'ArrowRight') {
                setCanvasWidth((w) => Math.min(800, w + 20));
              }
            }}
            className={`hidden lg:flex items-center justify-center w-2 shrink-0 cursor-col-resize select-none z-20 transition-colors border-x border-stone-200/50 ${
              activeResizer === 'canvas'
                ? 'bg-sky-500'
                : 'bg-stone-200/80 hover:bg-sky-400/80'
            }`}
            title="Drag to resize Canvas and Conversation panes (or use Left/Right arrow keys)"
          >
            <div
              className={`w-0.5 h-8 rounded-full transition-colors ${
                activeResizer === 'canvas' ? 'bg-white' : 'bg-stone-400 group-hover:bg-white'
              }`}
            />
          </div>
        )}

        {/* Resizable Conversation (Right Pane) - Fills remaining space (default ~50%, min-w 380px) */}
        {/* Strictly kept mounted in React DOM; completely hidden during Watching Mode or when Reader is expanded */}
        <div
          style={{ minWidth: isReaderExpanded ? '0px' : '380px' }}
          className={`w-full flex-1 flex-col h-full bg-white transition-all duration-300 ease-in-out ${
            isWatchingMode || isReaderExpanded
              ? 'hidden'
              : mobileActiveTab === 'chat'
              ? 'flex min-w-[380px]'
              : 'hidden lg:flex min-w-[380px]'
          }`}
        >
          <Module1Chat
            courseState={courseState}
            onStateUpdate={handleStateUpdate}
            externalTriggerMessage={externalTriggerMessage}
            onClearExternalTrigger={() => setExternalTriggerMessage(null)}
            prePopulatedInput={prePopulatedInput}
            onClearPrePopulatedInput={() => setPrePopulatedInput(null)}
            messages={messages}
            setMessages={setMessages}
            onCompleteModule1={handleCompleteModule1}
          />
        </div>
      </div>

      {/* Full-screen mouse capture overlay when actively dragging to prevent iframes from eating events */}
      {activeResizer && (
        <div
          className="fixed inset-0 z-50 cursor-col-resize select-none pointer-events-auto"
          style={{ cursor: 'col-resize' }}
        />
      )}

      {/* Module 1 Completion Celebration Dialog Modal */}
      {showCelebrationModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="celebration-modal-title"
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setShowCelebrationModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 text-stone-900 relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={handleBackToOverview}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Close celebration dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Celebratory badge / icon */}
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3.5 text-3xl shadow-xs ring-8 ring-emerald-50">
              🎉
            </div>

            {/* Header */}
            <h3
              id="celebration-modal-title"
              className="text-xl sm:text-2xl font-extrabold text-center text-stone-900 mb-1.5"
            >
              🎉 Module 1 Complete: Intention Locked!
            </h3>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-stone-600 text-center leading-relaxed mb-5 font-normal">
              You have moved beyond default AI mirrors and configured a specialized counterpart with clear operating boundaries.
            </p>

            {/* Key Recap: Displays user's locked intention and crew member name */}
            <div className="bg-stone-50 border border-stone-200/90 rounded-xl p-4 mb-4 space-y-2.5 text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Key Recap
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-stone-600">Locked Intention:</span>
                <span className="font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
                  {lockedIntention}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-stone-600">Counterpart Member:</span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  {memberName}
                </span>
              </div>
            </div>

            {/* High-Visibility Upcoming Modules Callout Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 my-4 flex items-center justify-center gap-2 text-center">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="text-sm font-semibold text-amber-900">
                Modules 2-5 will be available soon.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleReviewProfile}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <span>View My Crew in Dashboard ──►</span>
              </button>

              <button
                type="button"
                onClick={handleBackToOverview}
                className="flex-1 py-3 px-4 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-800 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 border border-stone-300 transition-all cursor-pointer"
              >
                <span>Back to Course Overview</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
