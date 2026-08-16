import React, { useState, useRef, useEffect } from 'react';
import { User } from 'firebase/auth';
import { FoundationRecord, SpecialistRecord } from '../types';
import {
  Sparkles,
  Plus,
  Compass,
  LogOut,
  ShieldCheck,
  User as UserIcon,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  X,
  ChevronRight,
} from 'lucide-react';
import {
  deleteAllUserDataFromFirestore,
  importCrewToFirestore,
  mergeFoundationRecords,
  normalizeRecordFocuses,
} from '../lib/firebase';
import { PrivacyModal } from './PrivacyModal';

interface DashboardStateProps {
  user: User;
  foundationRecord: FoundationRecord | null;
  crewMembers: SpecialistRecord[];
  onSelectMember: (member: SpecialistRecord) => void;
  onAddMember: () => void;
  onGetFullProfile?: () => void;
  onSignOut: () => void;
  onDeleteSingleMember?: (memberId: string) => Promise<void>;
  onRefreshCrew?: () => Promise<void> | void;
  isLoading?: boolean;
  isPaid?: boolean;
  onTriggerUpgrade?: () => void;
  hasRosterUpdate?: boolean;
  onDismissBanner?: () => void;
}

export const DashboardState: React.FC<DashboardStateProps> = ({
  user,
  foundationRecord,
  crewMembers,
  onSelectMember,
  onAddMember,
  onGetFullProfile,
  onSignOut,
  onDeleteSingleMember,
  onRefreshCrew,
  isLoading = false,
  isPaid = false,
  onTriggerUpgrade,
  hasRosterUpdate = false,
  onDismissBanner,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [memberToDelete, setMemberToDelete] = useState<SpecialistRecord | null>(null);
  const [isDeletingMember, setIsDeletingMember] = useState(false);

  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showBanner, setShowBanner] = useState<boolean>(hasRosterUpdate);

  useEffect(() => {
    if (hasRosterUpdate) {
      setShowBanner(true);
    }
  }, [hasRosterUpdate]);

  // Import Crew State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [pendingImportData, setPendingImportData] = useState<{
    traits: FoundationRecord;
    crew: SpecialistRecord[];
  } | null>(null);
  const [foundationConflictData, setFoundationConflictData] = useState<{
    traits: FoundationRecord;
    crew: SpecialistRecord[];
    importedPersonaName: string;
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const crewHeading =
    foundationRecord?.crewName ||
    (foundationRecord?.personName ? `${foundationRecord.personName}'s AI Crew` : 'My AI Crew');

  const handleDownloadEverything = () => {
    const personaName =
      foundationRecord?.personaName ||
      foundationRecord?.crewName ||
      (foundationRecord?.personName ? `${foundationRecord.personName}'s AI Crew` : 'My AI Crew');

    const dataToExport = {
      traits: {
        personaName,
        ...foundationRecord,
      },
      crew: crewMembers,
      exportedAt: new Date().toISOString(),
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      },
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crew-records.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    setImportError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (!content) {
        setImportError("That doesn't look like a crew file. Import the crew-records.json you downloaded from here.");
        return;
      }

      let parsed: any;
      try {
        parsed = JSON.parse(content);
      } catch (_) {
        setImportError("That doesn't look like a crew file. Import the crew-records.json you downloaded from here.");
        return;
      }

      const rawTraits = parsed?.traits || parsed?.foundation;
      const rawCrew = parsed?.crew || parsed?.crewMembers;

      const isValidTraits = rawTraits && typeof rawTraits === 'object';
      const isValidCrew = Array.isArray(rawCrew);

      if (!isValidTraits || !isValidCrew) {
        setImportError("That doesn't look like a crew file. Import the crew-records.json you downloaded from here.");
        return;
      }

      const normalizedTraits = normalizeRecordFocuses(rawTraits as FoundationRecord);
      const normalizedCrew = (rawCrew as SpecialistRecord[]).map(normalizeRecordFocuses);

      const savedPersonaName =
        foundationRecord?.personaName ||
        foundationRecord?.crewName ||
        foundationRecord?.personName ||
        '';

      const importedPersonaName =
        normalizedTraits?.personaName ||
        normalizedTraits?.crewName ||
        normalizedTraits?.personName ||
        '';

      const hasSavedFoundation = Boolean(
        foundationRecord &&
        Object.keys(foundationRecord).length > 0 &&
        savedPersonaName.trim().length > 0
      );

      const isDifferentFoundation =
        hasSavedFoundation &&
        importedPersonaName.trim().length > 0 &&
        savedPersonaName.trim().toLowerCase() !== importedPersonaName.trim().toLowerCase();

      const importPayload = {
        traits: normalizedTraits,
        crew: normalizedCrew,
      };

      if (isDifferentFoundation) {
        setFoundationConflictData({
          ...importPayload,
          importedPersonaName,
        });
      } else if (crewMembers.length > 0) {
        setPendingImportData(importPayload);
      } else {
        await executeImport(importPayload, 'replace', 'replace');
      }
    };

    reader.readAsText(file);
  };

  const executeImport = async (
    data: { traits: FoundationRecord; crew: SpecialistRecord[] },
    mode: 'replace' | 'add',
    foundationAction: 'keep' | 'merge' | 'replace' = 'replace'
  ) => {
    // Check limit for free users: maximum 1 saved crew member
    const expectedCount = mode === 'replace' ? data.crew.length : crewMembers.length + data.crew.length;
    if (!isPaid && expectedCount > 1) {
      setPendingImportData(null);
      setFoundationConflictData(null);
      if (onTriggerUpgrade) {
        onTriggerUpgrade();
      }
      return;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      let finalTraits = data.traits;
      if (foundationAction === 'merge' && foundationRecord) {
        finalTraits = mergeFoundationRecords(foundationRecord, data.traits);
      }

      await importCrewToFirestore(user.uid, finalTraits, data.crew, mode, foundationAction);
      setPendingImportData(null);
      setFoundationConflictData(null);
      setShowBanner(true);
      if (onRefreshCrew) {
        await onRefreshCrew();
      }
    } catch (err: any) {
      console.error('Failed to import crew:', err);
      setImportError(err.message || 'Failed to import crew data.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadSingleMember = (member: SpecialistRecord) => {
    const dataToExport = {
      exportedAt: new Date().toISOString(),
      foundation: foundationRecord,
      specialist: member,
    };

    const fileName = `${(member.name || member.role || 'crew_member').toLowerCase().replace(/[^a-z0-9]/g, '_')}_spec.json`;
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAllUserDataFromFirestore(user.uid);
      setShowDeleteModal(false);
      onSignOut();
    } catch (err: any) {
      console.error('Failed to delete crew data:', err);
      setDeleteError(err.message || 'Failed to delete crew data.');
      setIsDeleting(false);
    }
  };

  const handleConfirmDeleteMember = async () => {
    if (!memberToDelete || !memberToDelete.id || !onDeleteSingleMember) return;
    setIsDeletingMember(true);
    try {
      await onDeleteSingleMember(memberToDelete.id);
      setMemberToDelete(null);
    } catch (err) {
      console.error('Failed to delete single member:', err);
    } finally {
      setIsDeletingMember(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 font-sans space-y-8 animate-fadeIn">
      {/* Top Welcome / Account Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#649940] tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-8 h-8 text-[#649940] shrink-0" />
          <span>My AI Crew Dashboard</span>
        </h1>

        {/* Prominent Privacy Button */}
        <button
          onClick={() => setShowPrivacyModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#649940]/10 hover:bg-[#649940]/20 text-[#3b6021] font-bold text-xs rounded-full border border-[#649940]/30 transition-all cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
        >
          <ShieldCheck className="w-4 h-4 text-[#649940]" />
          <span>Your privacy matters.</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#649940]" />
        </button>
      </div>

      {/* Main Action Bar */}
      <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-[#1B1B1B]">Manage & Deploy Your Crew</h2>
          <p className="text-xs text-[#1B1B1B]/70 mt-1 leading-relaxed">
            Your crew profile carries every member. Deploy it once, then call whoever the work needs.
          </p>
        </div>

        {/* Primary Action */}
        <div>
          {onGetFullProfile && (
            <button
              onClick={() => {
                if (showBanner) {
                  setShowBanner(false);
                  if (onDismissBanner) onDismissBanner();
                }
                onGetFullProfile();
              }}
              disabled={crewMembers.length === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#004364] hover:bg-[#00314a] text-white font-bold text-sm sm:text-base rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
              title="Generate one Crew Profile containing ALL saved crew members"
            >
              <Sparkles className="w-4 h-4 text-[#CBA62C]" />
              <span>Get my crew profile</span>
            </button>
          )}
        </div>

        {/* Secondary Actions */}
        <div className="pt-3 border-t border-stone-200/80 flex flex-wrap items-center gap-2.5">
          <button
            onClick={onAddMember}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-stone-100 text-stone-800 font-medium text-xs rounded-xl border border-stone-300 transition-all cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#004364]" />
            <span>Add a crew member</span>
          </button>

          <button
            onClick={handleImportClick}
            disabled={isImporting}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-stone-100 text-stone-800 font-medium text-xs rounded-xl border border-stone-300 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            title="Import crew records from JSON file"
          >
            {isImporting ? (
              <span className="w-3.5 h-3.5 border-2 border-[#004364] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5 text-[#004364]" />
            )}
            <span>Import a crew</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={handleDownloadEverything}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-stone-100 text-stone-800 font-medium text-xs rounded-xl border border-stone-300 transition-all cursor-pointer shadow-2xs"
            title="Export all crew data as JSON"
          >
            <Download className="w-3.5 h-3.5 text-[#004364]" />
            <span>Download everything</span>
          </button>
        </div>
      </div>

      {/* Gentle Banner when a member is added or foundation is updated */}
      {showBanner && (
        <div className="bg-[#649940]/10 border border-[#649940]/30 text-[#3b6021] p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-medium shadow-2xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#649940] shrink-0" />
            <span className="leading-relaxed">
              Your foundation just got richer. Generate a fresh crew profile to bring the update to every member.
            </span>
          </div>
          <button
            onClick={() => {
              setShowBanner(false);
              if (onDismissBanner) onDismissBanner();
            }}
            className="text-[#3b6021]/70 hover:text-[#3b6021] p-1 rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3 animate-pulse">
          <div className="w-8 h-8 border-2 border-[#004364] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-stone-500">Loading your saved crew members...</p>
        </div>
      ) : (
        /* Cards Grid */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Saved Crew Members ({crewMembers.length})
            </h3>
          </div>

          {crewMembers.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white border border-stone-200 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-[#004364]">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-[#004364]">No crew members saved yet</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                  You haven't saved any specialists to your crew yet. Click "Add a crew member" to start a guided conversation.
                </p>
              </div>
              <button
                onClick={onAddMember}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#004364] hover:bg-[#00314a] text-white font-medium text-sm rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add a crew member</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {crewMembers.map((member, idx) => {
                const displayName = member.name || member.role || `Specialist #${idx + 1}`;
                const displayRole = member.role || 'Specialist AI Member';
                const displayFocus =
                  member.focus ||
                  (member.specializations && member.specializations.length > 0
                    ? member.specializations.join(', ')
                    : 'Tailored to your working preferences');
                const displayVibe =
                  member.vibe ||
                  member.communicationStyle ||
                  member.archetype ||
                  (member.directives && member.directives.length > 0
                    ? member.directives.slice(0, 2).join(' • ')
                    : null);

                return (
                  <div
                    key={member.id || idx}
                    className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-stone-300 transition-all flex flex-col justify-between shadow-2xs group relative"
                  >
                    {/* Card Content - Identity */}
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-lg font-bold text-[#004364]">
                          {displayName}
                        </h4>
                        <span className="text-xs font-semibold text-[#649940] bg-[#649940]/10 px-2.5 py-0.5 rounded-full inline-block mt-1">
                          {displayRole}
                        </span>
                      </div>

                      <div className="text-xs text-[#1B1B1B]/80 space-y-1">
                        <span className="font-semibold text-stone-500 block">Focus:</span>
                        <p className="leading-relaxed bg-stone-50 p-2.5 rounded-xl border border-stone-100 line-clamp-3">
                          {displayFocus}
                        </p>
                      </div>

                      {displayVibe && (
                        <div className="text-xs text-[#1B1B1B]/80 space-y-1">
                          <span className="font-semibold text-stone-500 block">Vibe:</span>
                          <p className="leading-relaxed bg-stone-50 p-2.5 rounded-xl border border-stone-100 line-clamp-2">
                            {displayVibe}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Card Toolbar - Solo Profile link & Delete icon */}
                    <div className="pt-3 mt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                      <div className="relative group/tooltip inline-block">
                        <button
                          type="button"
                          onClick={() => onSelectMember(member)}
                          className="text-xs font-semibold text-[#004364] hover:text-[#00314a] underline underline-offset-2 transition-colors cursor-pointer py-1"
                          title="For a session with only this member, no switching."
                        >
                          Solo profile
                        </button>
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover/tooltip:block group-focus-within/tooltip:block w-52 p-2 bg-stone-900 text-white text-[11px] font-normal rounded-lg shadow-lg text-center z-20 pointer-events-none">
                          For a session with only this member, no switching.
                          <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-stone-900" />
                        </div>
                      </div>

                      {onDeleteSingleMember && member.id && (
                        <button
                          type="button"
                          onClick={() => setMemberToDelete(member)}
                          className="p-1.5 text-stone-400 hover:text-[#881719] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete this crew member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Footer controls: Privacy link & Delete my crew */}
      <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={() => setShowPrivacyModal(true)}
          className="inline-flex items-center gap-2 text-xs text-stone-600 hover:text-[#3b6021] font-medium transition-colors cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-[#649940]" />
          <span>Your privacy matters. Click to read our privacy commitments.</span>
        </button>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex items-center gap-1.5 text-xs text-[#881719] hover:text-[#6c1214] font-medium transition-colors cursor-pointer px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete my crew</span>
        </button>
      </div>

      {/* Privacy Matters Modal */}
      <PrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />

      {/* Delete Single Member Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-2xs animate-fadeIn font-sans">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-6 relative">
            <button
              onClick={() => setMemberToDelete(null)}
              disabled={isDeletingMember}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors p-1 rounded-lg cursor-pointer disabled:opacity-50"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-[#881719] shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#881719]">
                  Delete "{memberToDelete.name || memberToDelete.role || 'Crew Member'}"?
                </h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Are you sure you want to delete this crew member from your saved database? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                disabled={isDeletingMember}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteMember}
                disabled={isDeletingMember}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#881719] hover:bg-[#6c1214] text-white font-bold text-xs transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeletingMember ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete member</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Delete All) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-2xs animate-fadeIn font-sans">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-6 relative">
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors p-1 rounded-lg cursor-pointer disabled:opacity-50"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-[#881719] shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#881719]">
                  Delete my crew?
                </h3>
                <p className="text-sm text-stone-600 mt-1 leading-relaxed">
                  Are you sure you want to delete your foundation document and all saved crew members? This action cannot be undone.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[#881719] text-xs">
                {deleteError}
              </div>
            )}

            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 flex items-center justify-between gap-3 text-xs">
              <span className="text-stone-600 font-medium">Want a backup copy first?</span>
              <button
                type="button"
                onClick={handleDownloadEverything}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 font-medium rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-[#004364]" />
                <span>Download everything</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-medium text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#881719] hover:bg-[#6c1214] text-white font-bold text-sm transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Yes, delete & sign out</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Foundation Conflict Modal */}
      {foundationConflictData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-2xs animate-fadeIn font-sans">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-6 relative">
            <button
              onClick={() => setFoundationConflictData(null)}
              disabled={isImporting}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors p-1 rounded-lg cursor-pointer disabled:opacity-50"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#004364]/10 flex items-center justify-center text-[#004364] shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#004364]">
                  Foundation Conflict
                </h3>
                <p className="text-xs text-stone-700 mt-2 leading-relaxed">
                  This crew has a different foundation ({foundationConflictData.importedPersonaName}). Replace your saved foundation, merge the two, or import only the crew members and keep your current foundation?
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => executeImport(foundationConflictData, 'add', 'keep')}
                disabled={isImporting}
                className="w-full px-4 py-3 rounded-xl bg-[#004364] hover:bg-[#00314a] text-white font-bold text-xs transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isImporting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <span>Import only the crew members and keep your current foundation</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => executeImport(foundationConflictData, 'add', 'merge')}
                disabled={isImporting}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-all border border-stone-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>Merge the two</span>
              </button>

              <button
                type="button"
                onClick={() => executeImport(foundationConflictData, 'add', 'replace')}
                disabled={isImporting}
                className="w-full px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>Replace your saved foundation</span>
              </button>

              <button
                type="button"
                onClick={() => setFoundationConflictData(null)}
                disabled={isImporting}
                className="w-full px-4 py-2 rounded-xl border border-transparent text-stone-500 hover:text-stone-800 font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Conflict Confirmation Modal */}
      {pendingImportData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-2xs animate-fadeIn font-sans">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-6 relative">
            <button
              onClick={() => setPendingImportData(null)}
              disabled={isImporting}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors p-1 rounded-lg cursor-pointer disabled:opacity-50"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#004364]/10 flex items-center justify-center text-[#004364] shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#004364]">
                  Import Saved Crew
                </h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  You have a saved crew. Replace it with the imported one, or add the imported crew members to it?
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => executeImport(pendingImportData, 'replace')}
                disabled={isImporting}
                className="w-full px-4 py-2.5 rounded-xl bg-[#004364] hover:bg-[#00314a] text-white font-bold text-xs transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isImporting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <span>Replace existing crew</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => executeImport(pendingImportData, 'add')}
                disabled={isImporting}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-all border border-stone-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>Add imported crew members</span>
              </button>

              <button
                type="button"
                onClick={() => setPendingImportData(null)}
                disabled={isImporting}
                className="w-full px-4 py-2.5 rounded-xl border border-transparent text-stone-500 hover:text-stone-800 font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invalid File Error Modal */}
      {importError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-2xs animate-fadeIn font-sans">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-6 relative">
            <button
              onClick={() => setImportError(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors p-1 rounded-lg cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-[#881719] shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#881719]">
                  Invalid Crew File
                </h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  {importError}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setImportError(null)}
                className="px-5 py-2 rounded-xl bg-[#004364] hover:bg-[#00314a] text-white font-bold text-xs transition-all cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


