import React, { useState, useEffect } from 'react';
import { User, getRedirectResult } from 'firebase/auth';
import { AlertCircle, X, RotateCcw } from 'lucide-react';
import { AppState, FoundationRecord, SpecialistRecord } from './types';
import { Header } from './components/Header';
import { WelcomeState } from './components/WelcomeState';
import { ChatState } from './components/ChatState';
import { DeliveryState } from './components/DeliveryState';
import { DashboardState } from './components/DashboardState';
import { AdminState } from './components/AdminState';
import { UnsavedCrewModal } from './components/UnsavedCrewModal';
import { UpgradeModal } from './components/UpgradeModal';
import { Module1Experience } from './components/course/Module1Experience';
import {
  auth,
  onAuthStateChanged,
  signInWithGoogle,
  signOutUser,
  saveCrewToFirestore,
  fetchUserCrewFromFirestore,
  deleteSingleCrewMemberFromFirestore,
  ADMIN_EMAIL,
  UserProfile,
} from './lib/firebase';

const isCourseModule1Path = () =>
  typeof window !== 'undefined' &&
  window.location.pathname.startsWith('/course/onboarding/module-1');

const isMyCrewPath = () =>
  typeof window !== 'undefined' &&
  (window.location.pathname.startsWith('/my-crew') || window.location.pathname.startsWith('/dashboard'));

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => {
    if (isCourseModule1Path()) {
      return 'course_m1';
    }
    if (isMyCrewPath()) {
      return 'dashboard';
    }
    return 'welcome';
  });
  const [user, setUser] = useState<User | null>(null);
  const [foundationRecord, setFoundationRecord] = useState<FoundationRecord | null>(null);
  const [specialistRecord, setSpecialistRecord] = useState<SpecialistRecord | null>(null);
  const [userFoundation, setUserFoundation] = useState<FoundationRecord | null>(null);
  const [crewMembers, setCrewMembers] = useState<SpecialistRecord[]>([]);
  const [isLoadingCrew, setIsLoadingCrew] = useState(false);
  const [chatInitialMode, setChatInitialMode] = useState<'capture' | 'add_member'>('capture');
  const [deliveryCrewMembers, setDeliveryCrewMembers] = useState<SpecialistRecord[]>([]);

  // User Profile & Upgrade Modal state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);

  const userPlan = userProfile?.plan || 'free';
  const isPaid =
    userPlan === 'paid' ||
    Boolean(user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());

  // Unsaved state & confirmation modal tracking
  const [isCrewSaved, setIsCrewSaved] = useState<boolean>(false);
  const [hasRosterUpdate, setHasRosterUpdate] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<'reset' | 'dashboard' | 'signout' | null>(null);
  const [isModalSaving, setIsModalSaving] = useState<boolean>(false);
  const [modalSaveError, setModalSaveError] = useState<string | null>(null);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);
  const [isCourseResetModalOpen, setIsCourseResetModalOpen] = useState<boolean>(false);
  const [courseSessionKey, setCourseSessionKey] = useState<number>(0);

  // Handle browser popstate for /course/onboarding/module-1 and /my-crew
  useEffect(() => {
    const handlePopState = () => {
      if (isCourseModule1Path()) {
        setAppState('course_m1');
      } else if (isMyCrewPath()) {
        setAppState('dashboard');
      } else if (appState === 'course_m1') {
        setAppState(user ? 'dashboard' : 'welcome');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [appState, user]);

  // Monitor Auth state changes and redirect result
  useEffect(() => {
    // Check if coming back from redirect sign-in
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setAppState('dashboard');
        }
      })
      .catch((err) => {
        console.error('Error handling redirect sign-in:', err);
      });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsLoadingCrew(true);
        const savedData = await fetchUserCrewFromFirestore(currentUser.uid);
        setUserFoundation(savedData.foundation);
        setCrewMembers(savedData.crew);
        if (savedData.userProfile) {
          setUserProfile(savedData.userProfile);
        }
        setIsLoadingCrew(false);
        setAppState((prev) => {
          if (prev === 'course_m1') return 'course_m1';
          return prev === 'welcome' ? 'dashboard' : prev;
        });
      } else {
        setUserFoundation(null);
        setCrewMembers([]);
        setUserProfile(null);
        setAppState((prev) => {
          if (prev === 'course_m1') return 'course_m1';
          return prev === 'dashboard' || prev === 'admin' ? 'welcome' : prev;
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Prevent accidental browser navigation/unload when unsaved crew exists
  useEffect(() => {
    if (appState === 'delivery' && !isCrewSaved) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [appState, isCrewSaved]);

  const refreshCrewData = async (uid: string) => {
    setIsLoadingCrew(true);
    const savedData = await fetchUserCrewFromFirestore(uid);
    setUserFoundation(savedData.foundation);
    setCrewMembers(savedData.crew);
    if (savedData.userProfile) {
      setUserProfile(savedData.userProfile);
    }
    setIsLoadingCrew(false);
  };

  const handleGoCourseModule1 = (targetSection?: number) => {
    let activeSec = targetSection && targetSection >= 1 && targetSection <= 4 ? targetSection : 1;
    if (!targetSection) {
      try {
        const savedSec =
          localStorage.getItem('active_section') ||
          localStorage.getItem('course_m1_active_section');
        if (savedSec) {
          const parsed = parseInt(savedSec, 10);
          if (!isNaN(parsed) && parsed >= 1 && parsed <= 4) {
            activeSec = parsed;
          }
        } else {
          const savedState = localStorage.getItem('course_m1_state') || sessionStorage.getItem('course_m1_state');
          if (savedState) {
            const parsedState = JSON.parse(savedState);
            if (parsedState?.currentSection && parsedState.currentSection >= 1 && parsedState.currentSection <= 4) {
              activeSec = parsedState.currentSection;
            }
          }
        }
      } catch {}
    }

    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/course/onboarding/module-1?section=${activeSec}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    setAppState('course_m1');
  };

  const handleExitCourse = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/my-crew');
    }
    setAppState(user ? 'dashboard' : 'welcome');
  };

  const handleStartChat = () => {
    if (user && !isPaid && crewMembers.length >= 1) {
      setIsUpgradeModalOpen(true);
      return;
    }
    setChatInitialMode('capture');
    setAppState('chat');
  };

  // Support launching builder from URL param ?start=builder
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('start') === 'builder') {
        handleStartChat();
      }
    }
  }, []);

  const handleRecordsReady = (foundation: FoundationRecord, specialist: SpecialistRecord) => {
    setFoundationRecord(foundation);
    setSpecialistRecord(specialist);
    setDeliveryCrewMembers([specialist]);
    setIsCrewSaved(false); // Newly created crew member starts unsaved
    setAppState('delivery');
  };

  const handleSelectMember = (member: SpecialistRecord) => {
    const fRecord = userFoundation || {
      crewName: member.role ? `${member.role}'s Crew` : 'AI Crew',
    };
    setFoundationRecord(fRecord);
    setSpecialistRecord(member);
    setDeliveryCrewMembers([member]);
    setIsCrewSaved(true); // Loaded existing saved crew member
    setAppState('delivery');
  };

  const handleGetFullCrewProfile = () => {
    if (crewMembers.length === 0) return;
    const fRecord = userFoundation || {
      crewName: 'AI Crew',
    };
    setFoundationRecord(fRecord);
    setSpecialistRecord(crewMembers[0]);
    setDeliveryCrewMembers(crewMembers);
    setIsCrewSaved(true);
    setAppState('delivery');
  };

  const handleAddMember = async () => {
    // If user is signed in as a free user and already has 1 or more saved crew members, show upgrade modal
    if (user && !isPaid && crewMembers.length >= 1) {
      setIsUpgradeModalOpen(true);
      return;
    }

    setFoundationRecord(null);
    setSpecialistRecord(null);
    setIsCrewSaved(false);

    let loadedFoundation = userFoundation;
    let loadedCrew = crewMembers;

    if (user) {
      setIsLoadingCrew(true);
      try {
        const savedData = await fetchUserCrewFromFirestore(user.uid);
        loadedFoundation = savedData.foundation;
        loadedCrew = savedData.crew;
        setUserFoundation(savedData.foundation);
        setCrewMembers(savedData.crew);
        if (savedData.userProfile) {
          setUserProfile(savedData.userProfile);
        }
      } catch (err) {
        console.error('Error fetching user crew before adding member:', err);
      } finally {
        setIsLoadingCrew(false);
      }
    }

    const hasFoundation =
      loadedFoundation &&
      typeof loadedFoundation === 'object' &&
      Object.keys(loadedFoundation).length > 0;

    if (user && hasFoundation) {
      setChatInitialMode('add_member');
    } else {
      setChatInitialMode('capture');
    }

    setAppState('chat');
  };

  const handleSaveCrew = async (): Promise<void> => {
    if (!foundationRecord || !specialistRecord) return;
    setIsModalSaving(true);
    setModalSaveError(null);
    try {
      let currentUser = user;
      if (!currentUser) {
        currentUser = ((await signInWithGoogle()) as User) || null;
        if (currentUser) setUser(currentUser);
      }

      if (!currentUser) {
        throw new Error('Sign-in required to save your crew.');
      }

      // Check crew limit for free users
      const savedData = await fetchUserCrewFromFirestore(currentUser.uid);
      const isUserPaid =
        savedData.userProfile?.plan === 'paid' ||
        Boolean(currentUser.email && currentUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());

      const isExistingMember = savedData.crew.some(
        (m) => m.id === specialistRecord.id
      );

      if (!isUserPaid && savedData.crew.length >= 1 && !isExistingMember) {
        setIsUpgradeModalOpen(true);
        throw new Error('Free users can save 1 crew member. Upgrade to build your full crew.');
      }

      await saveCrewToFirestore(currentUser.uid, foundationRecord, specialistRecord);
      setIsCrewSaved(true);
      setHasRosterUpdate(true);
      await refreshCrewData(currentUser.uid);
      setAppState('dashboard');
    } catch (err: any) {
      console.error('Failed to save crew:', err);
      setModalSaveError(err.message || 'Failed to save crew.');
      throw err;
    } finally {
      setIsModalSaving(false);
    }
  };

  const executePendingAction = (action: 'reset' | 'dashboard' | 'signout') => {
    const nextAction = action;
    setPendingAction(null);
    setModalSaveError(null);

    if (nextAction === 'reset') {
      setFoundationRecord(null);
      setSpecialistRecord(null);
      setIsCrewSaved(false);
      setAppState('welcome');
    } else if (nextAction === 'dashboard') {
      setFoundationRecord(null);
      setSpecialistRecord(null);
      setIsCrewSaved(false);
      setAppState('dashboard');
    } else if (nextAction === 'signout') {
      handleSignOutDirect();
    }
  };

  const handleReset = () => {
    if (appState === 'course_m1') {
      setIsCourseResetModalOpen(true);
      return;
    }
    if (appState === 'delivery' && !isCrewSaved) {
      setPendingAction('reset');
      return;
    }
    executePendingAction('reset');
  };

  const handleConfirmCourseReset = () => {
    try {
      localStorage.removeItem('course_m1_conversation_messages');
      localStorage.removeItem('messages');
      localStorage.removeItem('course_m1_state');
      localStorage.removeItem('course_m1_active_section');
      localStorage.removeItem('active_section');
      localStorage.removeItem('course_m1_completed_sections');
      localStorage.removeItem('completed_sections_array');
      sessionStorage.removeItem('course_m1_conversation_messages');
      sessionStorage.removeItem('course_m1_state');
    } catch (e) {
      console.warn('Could not clear course storage:', e);
    }
    setCourseSessionKey((prev) => prev + 1);
    setIsCourseResetModalOpen(false);
  };

  const handleGoDashboard = () => {
    if (appState === 'delivery' && !isCrewSaved) {
      setPendingAction('dashboard');
      return;
    }
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/my-crew');
    }
    executePendingAction('dashboard');
  };

  const handleGoAdmin = () => {
    if (appState === 'delivery' && !isCrewSaved) {
      setPendingAction('dashboard'); // Navigate after confirmation if unsaved
      return;
    }
    setAppState('admin');
  };

  const handleSignOutDirect = async () => {
    await signOutUser();
    setUser(null);
    setUserFoundation(null);
    setCrewMembers([]);
    setFoundationRecord(null);
    setSpecialistRecord(null);
    setIsCrewSaved(false);
    setAppState('welcome');
  };

  const handleSignOut = async () => {
    if (appState === 'delivery' && !isCrewSaved) {
      setPendingAction('signout');
      return;
    }
    await handleSignOutDirect();
  };

  const handleSignInOrDashboard = async () => {
    setAuthErrorMessage(null);
    if (user) {
      handleGoDashboard();
    } else {
      try {
        const signedInUser = await signInWithGoogle();
        if (signedInUser) {
          handleGoDashboard();
        }
      } catch (err: any) {
        console.error('Sign-in cancelled or failed:', err);
        if (err?.message && !err.message.includes('cancelled')) {
          setAuthErrorMessage(err.message);
        }
      }
    }
  };

  const handleModalSaveAndProceed = async () => {
    try {
      await handleSaveCrew();
      if (pendingAction) {
        executePendingAction(pendingAction);
      } else {
        setPendingAction(null);
      }
    } catch (_) {
      // Error state managed by modalSaveError
    }
  };

  const handleModalDiscardAndLeave = () => {
    if (pendingAction) {
      executePendingAction(pendingAction);
    } else {
      setPendingAction(null);
    }
  };

  const handleDeleteSingleMember = async (memberId: string) => {
    if (!user || !memberId) return;
    await deleteSingleCrewMemberFromFirestore(user.uid, memberId);
    await refreshCrewData(user.uid);
  };

  return (
    <div className="min-h-screen bg-white text-[#1B1B1B] flex flex-col font-sans">
      <Header
        appState={appState}
        onReset={handleReset}
        user={user}
        onSignIn={handleSignInOrDashboard}
        onSignOut={handleSignOut}
        onGoDashboard={user ? handleGoDashboard : undefined}
        onGoAdmin={user && isPaid ? handleGoAdmin : undefined}
        onOpenPricing={() => setIsUpgradeModalOpen(true)}
        onGoCourse={handleGoCourseModule1}
      />

      {authErrorMessage && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-3 text-xs sm:text-sm text-rose-800 flex items-center justify-between max-w-5xl mx-auto w-full my-2 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{authErrorMessage}</span>
          </div>
          <button
            onClick={() => setAuthErrorMessage(null)}
            className="text-rose-600 hover:text-rose-900 cursor-pointer p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <main className="flex-1 flex flex-col">
        {appState === 'welcome' && (
          <WelcomeState
            onStart={handleStartChat}
            onSignIn={handleSignInOrDashboard}
            user={user}
            onGoCourse={handleGoCourseModule1}
          />
        )}

        {appState === 'admin' && user && (
          <AdminState
            user={user}
            onGoDashboard={handleGoDashboard}
            onRefreshCrew={() => refreshCrewData(user.uid)}
          />
        )}

        {appState === 'dashboard' && user && (
          <DashboardState
            user={user}
            foundationRecord={userFoundation}
            crewMembers={crewMembers}
            onSelectMember={handleSelectMember}
            onAddMember={handleAddMember}
            onGetFullProfile={handleGetFullCrewProfile}
            onSignOut={handleSignOut}
            onDeleteSingleMember={handleDeleteSingleMember}
            onRefreshCrew={() => refreshCrewData(user.uid)}
            isLoading={isLoadingCrew}
            isPaid={isPaid}
            onTriggerUpgrade={() => setIsUpgradeModalOpen(true)}
            hasRosterUpdate={hasRosterUpdate}
            onDismissBanner={() => setHasRosterUpdate(false)}
            onGoCourse={handleGoCourseModule1}
          />
        )}

        {appState === 'chat' && (
          <ChatState
            onRecordsReady={handleRecordsReady}
            user={user}
            initialMode={chatInitialMode}
            userFoundation={userFoundation}
            crewMembers={crewMembers}
          />
        )}

        {appState === 'course_m1' && (
          <Module1Experience
            key={`course-m1-${courseSessionKey}`}
            onExitCourse={handleExitCourse}
            onReviewCrewProfile={() => {
              if (typeof window !== 'undefined') {
                window.history.pushState({}, '', '/my-crew');
              }
              setAppState(user ? 'dashboard' : 'welcome');
            }}
            onBackToDashboard={() => {
              if (typeof window !== 'undefined') {
                window.history.pushState({}, '', '/my-crew');
              }
              setAppState(user ? 'dashboard' : 'welcome');
            }}
            crewMemberName={crewMembers[0]?.name || userFoundation?.crewName}
          />
        )}

        {appState === 'delivery' && foundationRecord && specialistRecord && (
          <DeliveryState
            foundationRecord={foundationRecord}
            specialistRecord={specialistRecord}
            allCrewMembers={deliveryCrewMembers}
            onReset={handleReset}
            user={user}
            onUserSignedIn={(newUser) => setUser(newUser)}
            isSaved={isCrewSaved}
            onSaveCrew={handleSaveCrew}
            onSaved={() => {
              if (user) {
                refreshCrewData(user.uid);
              }
            }}
          />
        )}
      </main>

      {/* Confirmation Modal when navigating away with unsaved crew */}
      <UnsavedCrewModal
        isOpen={Boolean(pendingAction)}
        isSaving={isModalSaving}
        saveError={modalSaveError}
        onSaveAndProceed={handleModalSaveAndProceed}
        onCancel={() => {
          setPendingAction(null);
          setModalSaveError(null);
        }}
        onDiscardAndLeave={handleModalDiscardAndLeave}
      />

      {/* Upgrade Paid Gate Modal - suppressed on course routes */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen && appState !== 'course_m1' && !isCourseModule1Path()}
        onClose={() => setIsUpgradeModalOpen(false)}
      />

      {/* Course Reset Confirmation Modal - Slate/Rose palette, no amber/orange */}
      {isCourseResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center mx-auto border border-slate-700">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">
                Reset course progress and start fresh?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                This will clear all course conversation messages, milestone flags, and choices, returning you to Section 1.1 with a clean initial state.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsCourseResetModalOpen(false)}
                className="flex-1 py-2.5 px-3 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer border border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCourseReset}
                className="flex-1 py-2.5 px-3 text-xs font-bold bg-rose-900/40 text-rose-300 border border-rose-800 hover:bg-rose-900/70 hover:text-white rounded-xl transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Course</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
