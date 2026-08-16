import React, { useState, useEffect } from 'react';
import { User, getRedirectResult } from 'firebase/auth';
import { AlertCircle, X } from 'lucide-react';
import { AppState, FoundationRecord, SpecialistRecord } from './types';
import { Header } from './components/Header';
import { WelcomeState } from './components/WelcomeState';
import { ChatState } from './components/ChatState';
import { DeliveryState } from './components/DeliveryState';
import { DashboardState } from './components/DashboardState';
import { AdminState } from './components/AdminState';
import { UnsavedCrewModal } from './components/UnsavedCrewModal';
import { UpgradeModal } from './components/UpgradeModal';
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

export default function App() {
  const [appState, setAppState] = useState<AppState>('welcome');
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
        setAppState((prev) => (prev === 'welcome' ? 'dashboard' : prev));
      } else {
        setUserFoundation(null);
        setCrewMembers([]);
        setUserProfile(null);
        setAppState((prev) => (prev === 'dashboard' || prev === 'admin' ? 'welcome' : prev));
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

  const handleStartChat = () => {
    if (user && !isPaid && crewMembers.length >= 1) {
      setIsUpgradeModalOpen(true);
      return;
    }
    setChatInitialMode('capture');
    setAppState('chat');
  };

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
    if (appState === 'delivery' && !isCrewSaved) {
      setPendingAction('reset');
      return;
    }
    executePendingAction('reset');
  };

  const handleGoDashboard = () => {
    if (appState === 'delivery' && !isCrewSaved) {
      setPendingAction('dashboard');
      return;
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
      />

      {authErrorMessage && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-xs sm:text-sm text-amber-800 flex items-center justify-between max-w-5xl mx-auto w-full my-2 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{authErrorMessage}</span>
          </div>
          <button
            onClick={() => setAuthErrorMessage(null)}
            className="text-amber-600 hover:text-amber-900 cursor-pointer p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <main className="flex-1">
        {appState === 'welcome' && (
          <WelcomeState onStart={handleStartChat} onSignIn={handleSignInOrDashboard} />
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

      {/* Upgrade Paid Gate Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
}
