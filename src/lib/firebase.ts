import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { FoundationRecord, SpecialistRecord } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const ADMIN_EMAIL = 'johnny@2itedsol.com';

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  plan: 'free' | 'paid';
  crewCount?: number;
  updatedAt?: string;
  createdAt?: string;
}

export interface AdminUserRecord {
  uid: string;
  email: string | null;
  displayName: string | null;
  plan: 'free' | 'paid';
  crewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Syncs user crewCount and updatedAt metadata on doc users/{uid}.
 */
export const syncUserMetadata = async (uid: string): Promise<number> => {
  try {
    const crewCollectionRef = collection(db, 'users', uid, 'crew');
    const crewSnap = await getDocs(crewCollectionRef);
    const count = crewSnap.size;
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, { crewCount: count, updatedAt: new Date().toISOString() }, { merge: true });
    return count;
  } catch (err) {
    console.error('Error syncing user metadata:', err);
    return 0;
  }
};

/**
 * Ensures the user document users/{uid} exists and contains a plan field (defaulting to "free").
 * If the user's email matches ADMIN_EMAIL, their effective plan is "paid".
 */
export const ensureUserDocument = async (user: User): Promise<UserProfile> => {
  const isAdmin = Boolean(user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());

  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const profileData = {
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName || null,
        plan: isAdmin ? 'paid' : 'free',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(userRef, profileData);
      syncUserMetadata(user.uid).catch(() => {});
      return profileData as UserProfile;
    } else {
      const data = userSnap.data();
      if (!data.plan || (isAdmin && data.plan !== 'paid')) {
        await setDoc(userRef, { plan: isAdmin ? 'paid' : (data.plan || 'free'), updatedAt: new Date().toISOString() }, { merge: true });
      }
      syncUserMetadata(user.uid).catch(() => {});
      const storedPlan = isAdmin ? 'paid' : (data.plan || 'free');
      return {
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName || null,
        ...data,
        plan: storedPlan,
      } as UserProfile;
    }
  } catch (err) {
    console.error('Error in ensureUserDocument:', err);
    return {
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || null,
      plan: isAdmin ? 'paid' : 'free',
    };
  }
};

export const signInWithGoogle = async (): Promise<User | void> => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account',
  });

  try {
    const result = await signInWithPopup(auth, provider);
    if (result && result.user) {
      try {
        await ensureUserDocument(result.user);
      } catch (e) {
        console.error('Error ensuring user doc after sign in:', e);
      }
      return result.user;
    }
  } catch (popupErr: any) {
    if (
      popupErr?.code === 'auth/popup-closed-by-user' ||
      popupErr?.code === 'auth/cancelled-popup-request'
    ) {
      throw new Error('Sign in cancelled.');
    }
    console.warn('signInWithPopup failed, falling back to signInWithRedirect:', popupErr);

    // Fallback to full-page redirect if popup is blocked or unsupported by browser/environment
    try {
      await signInWithRedirect(auth, provider);
    } catch (redirectErr: any) {
      console.error('signInWithRedirect also failed:', redirectErr);
      throw new Error('Sign-in was blocked by browser privacy settings.');
    }
  }
};

export const signOutUser = async (): Promise<void> => {
  await signOut(auth);
};

/**
 * Normalizes focuses to an array everywhere, on save, load, and import.
 */
export function normalizeRecordFocuses<T extends Record<string, any>>(record: T): T {
  if (!record || typeof record !== 'object') return record;
  const result: any = { ...record };

  let rawFocuses = result.focuses;
  if (rawFocuses === undefined || rawFocuses === null) {
    if (result.focus) {
      rawFocuses = result.focus;
    }
  }

  if (typeof rawFocuses === 'string') {
    const trimmed = rawFocuses.trim();
    result.focuses = trimmed ? [trimmed] : [];
    if (!result.focus && trimmed) {
      result.focus = trimmed;
    }
  } else if (Array.isArray(rawFocuses)) {
    const arr = rawFocuses.map((f: any) => String(f).trim()).filter(Boolean);
    result.focuses = arr;
    if (!result.focus && arr.length > 0) {
      result.focus = arr[0];
    }
  } else {
    result.focuses = [];
  }

  return result as T;
}

/**
 * Merges an existing foundation record with an imported foundation record.
 */
export function mergeFoundationRecords(
  existing: FoundationRecord,
  imported: FoundationRecord
): FoundationRecord {
  const merged: FoundationRecord = {
    ...imported,
    ...existing,
  };

  merged.personaName = existing.personaName || imported.personaName || existing.crewName || imported.crewName;

  if (Array.isArray(existing.coreValues) || Array.isArray(imported.coreValues)) {
    const combined = [
      ...(Array.isArray(existing.coreValues) ? existing.coreValues : []),
      ...(Array.isArray(imported.coreValues) ? imported.coreValues : []),
    ];
    merged.coreValues = Array.from(new Set(combined.map((s) => String(s).trim()).filter(Boolean)));
  }

  if (Array.isArray(existing.keyGoals) || Array.isArray(imported.keyGoals)) {
    const combined = [
      ...(Array.isArray(existing.keyGoals) ? existing.keyGoals : []),
      ...(Array.isArray(imported.keyGoals) ? imported.keyGoals : []),
    ];
    merged.keyGoals = Array.from(new Set(combined.map((s) => String(s).trim()).filter(Boolean)));
  }

  return normalizeRecordFocuses(merged);
}

export interface SavedCrewData {
  foundation: FoundationRecord | null;
  crew: SpecialistRecord[];
  userProfile?: UserProfile | null;
}

/**
 * Saves or updates foundation record and adds/updates a specialist record in Firestore.
 */
export const saveCrewToFirestore = async (
  uid: string,
  foundationRecord: FoundationRecord,
  specialistRecord: SpecialistRecord
): Promise<string> => {
  const normalizedFoundation = normalizeRecordFocuses(foundationRecord);
  const normalizedSpecialist = normalizeRecordFocuses(specialistRecord);

  // 1. Save foundation record to users/{uid}/foundation/main
  const foundationRef = doc(db, 'users', uid, 'foundation', 'main');
  await setDoc(
    foundationRef,
    {
      ...normalizedFoundation,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  // 2. Generate or use existing member ID
  const memberId =
    normalizedSpecialist.id ||
    `member_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const memberToSave: SpecialistRecord = {
    ...normalizedSpecialist,
    id: memberId,
    updatedAt: new Date().toISOString(),
  };

  const memberRef = doc(db, 'users', uid, 'crew', memberId);
  await setDoc(memberRef, memberToSave, { merge: true });

  await syncUserMetadata(uid);

  return memberId;
};

/**
 * Imports foundation/traits and crew members into Firestore.
 */
export const importCrewToFirestore = async (
  uid: string,
  traits: FoundationRecord | null,
  crew: SpecialistRecord[],
  mode: 'replace' | 'add',
  foundationAction: 'keep' | 'merge' | 'replace' = 'replace'
): Promise<void> => {
  if (mode === 'replace') {
    const crewCollectionRef = collection(db, 'users', uid, 'crew');
    const crewSnap = await getDocs(crewCollectionRef);
    const deletePromises = crewSnap.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);
  }

  if (traits && foundationAction !== 'keep') {
    const foundationRef = doc(db, 'users', uid, 'foundation', 'main');
    const normalizedTraits = normalizeRecordFocuses(traits);
    await setDoc(
      foundationRef,
      {
        ...normalizedTraits,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  }

  for (let i = 0; i < crew.length; i++) {
    const member = normalizeRecordFocuses(crew[i]);
    const memberId =
      member.id ||
      `member_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`;

    const memberToSave: SpecialistRecord = {
      ...member,
      id: memberId,
      updatedAt: new Date().toISOString(),
    };

    const memberRef = doc(db, 'users', uid, 'crew', memberId);
    await setDoc(memberRef, memberToSave, { merge: true });
  }

  await syncUserMetadata(uid);
};

/**
 * Admin helper to fetch all user account records with metadata.
 */
export const fetchAllUsersForAdmin = async (): Promise<AdminUserRecord[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser?.email || currentUser.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return [];
  }

  try {
    const usersRef = collection(db, 'users');
    const querySnap = await getDocs(usersRef);

    const userPromises = querySnap.docs.map(async (docSnap) => {
      const data = docSnap.data();
      const isAdminDoc = data.email && data.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      let crewCount = typeof data.crewCount === 'number' ? data.crewCount : 0;

      // Always query live crew subcollection count to ensure existing accounts created before metadata sync show their true count
      try {
        const crewSnap = await getDocs(collection(db, 'users', docSnap.id, 'crew'));
        crewCount = crewSnap.size;
        if (data.crewCount !== crewCount) {
          setDoc(doc(db, 'users', docSnap.id), { crewCount }, { merge: true }).catch(() => {});
        }
      } catch (e) {
        // Fallback to cached crewCount on parent doc if subcollection query fails
      }

      return {
        uid: docSnap.id,
        email: data.email || null,
        displayName: data.displayName || null,
        plan: isAdminDoc ? 'paid' : (data.plan || 'free'),
        crewCount,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as AdminUserRecord;
    });

    return await Promise.all(userPromises);
  } catch (err) {
    console.error('Error fetching users for admin:', err);
    return [];
  }
};

/**
 * Admin helper to update a user's plan directly by UID.
 */
export const updateUserPlanByAdmin = async (
  targetUid: string,
  targetPlan: 'free' | 'paid'
): Promise<boolean> => {
  const currentUser = auth.currentUser;
  if (!currentUser?.email || currentUser.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return false;
  }

  try {
    const userRef = doc(db, 'users', targetUid);
    await setDoc(userRef, { plan: targetPlan, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    console.error('Error updating plan by admin:', err);
    return false;
  }
};

/**
 * Sets a user's plan ("free" or "paid") by their email address.
 * Used by admin to manually activate customers.
 */
export const setUserPlanByEmail = async (
  email: string,
  targetPlan: 'free' | 'paid'
): Promise<{ success: boolean; message: string }> => {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', cleanEmail));
    const querySnap = await getDocs(q);

    if (!querySnap.empty) {
      const updatePromises = querySnap.docs.map((userDoc) =>
        setDoc(userDoc.ref, { plan: targetPlan, updatedAt: new Date().toISOString() }, { merge: true })
      );
      await Promise.all(updatePromises);
      return {
        success: true,
        message: `Set plan to "${targetPlan}" for ${cleanEmail}.`,
      };
    } else {
      // Create a pending user document so when they register/login later, they get this plan
      const sanitizedDocId = `pending_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
      const pendingDocRef = doc(db, 'users', sanitizedDocId);
      await setDoc(
        pendingDocRef,
        {
          email: cleanEmail,
          plan: targetPlan,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return {
        success: true,
        message: `Created pre-activated record for ${cleanEmail} with plan "${targetPlan}".`,
      };
    }
  } catch (err: any) {
    console.error('Error updating user plan by email:', err);
    return { success: false, message: err.message || 'Failed to update user plan.' };
  }
};

/**
 * Loads foundation record and all crew members for a signed-in user.
 */
export const fetchUserCrewFromFirestore = async (uid: string): Promise<SavedCrewData> => {
  let foundation: FoundationRecord | null = null;
  const crew: SpecialistRecord[] = [];
  let userProfile: UserProfile | null = null;

  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    const currentUser = auth.currentUser;
    const userEmail = currentUser?.email || null;
    const isAdmin = Boolean(userEmail && userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase());

    if (userSnap.exists()) {
      const data = userSnap.data();
      const storedPlan = data.plan || (isAdmin ? 'paid' : 'free');
      if (!data.plan || (isAdmin && data.plan !== 'paid')) {
        await setDoc(userRef, { plan: isAdmin ? 'paid' : storedPlan, updatedAt: new Date().toISOString() }, { merge: true });
      }
      userProfile = {
        uid,
        email: data.email || userEmail,
        displayName: data.displayName || currentUser?.displayName || null,
        ...data,
        plan: isAdmin ? 'paid' : storedPlan,
      } as UserProfile;
    } else {
      const profileData = {
        uid,
        email: userEmail,
        displayName: currentUser?.displayName || null,
        plan: isAdmin ? 'paid' : 'free',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(userRef, profileData);
      userProfile = profileData as UserProfile;
    }
  } catch (err) {
    console.error('Error ensuring user document:', err);
  }

  try {
    const foundationSnap = await getDoc(doc(db, 'users', uid, 'foundation', 'main'));
    if (foundationSnap.exists()) {
      foundation = normalizeRecordFocuses(foundationSnap.data() as FoundationRecord);
    }
  } catch (err) {
    console.error('Error loading foundation record:', err);
  }

  try {
    const crewCollectionRef = collection(db, 'users', uid, 'crew');
    const crewSnap = await getDocs(crewCollectionRef);
    crewSnap.forEach((docSnap) => {
      crew.push(normalizeRecordFocuses({ id: docSnap.id, ...docSnap.data() } as SpecialistRecord));
    });
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, { crewCount: crew.length, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.error('Error loading crew members:', err);
  }

  return { foundation, crew, userProfile };
};

/**
  * Deletes a single crew member document for a user from Firestore.
  */
export const deleteSingleCrewMemberFromFirestore = async (uid: string, memberId: string): Promise<void> => {
  if (!uid || !memberId) return;
  const memberRef = doc(db, 'users', uid, 'crew', memberId);
  await deleteDoc(memberRef);
  await syncUserMetadata(uid);
};

/**
  * Deletes foundation record and all crew member documents for a user from Firestore.
  */
export const deleteAllUserDataFromFirestore = async (uid: string): Promise<void> => {
  try {
    const foundationRef = doc(db, 'users', uid, 'foundation', 'main');
    await deleteDoc(foundationRef);
  } catch (err) {
    console.error('Error deleting foundation document:', err);
  }

  try {
    const crewCollectionRef = collection(db, 'users', uid, 'crew');
    const crewSnap = await getDocs(crewCollectionRef);
    const deletePromises = crewSnap.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);
  } catch (err) {
    console.error('Error deleting crew member documents:', err);
  }

  await syncUserMetadata(uid);
};

export { onAuthStateChanged };
export type { User };
