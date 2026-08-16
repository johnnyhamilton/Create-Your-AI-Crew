import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  Users,
  Sparkles,
  UserCheck,
  Search,
  ArrowLeft,
  RefreshCw,
  X,
  Check,
  AlertCircle,
  Clock,
} from 'lucide-react';
import {
  ADMIN_EMAIL,
  AdminUserRecord,
  fetchAllUsersForAdmin,
  updateUserPlanByAdmin,
} from '../lib/firebase';

interface AdminStateProps {
  user: User | null;
  onGoDashboard: () => void;
  onRefreshCrew?: () => Promise<void>;
}

export const AdminState: React.FC<AdminStateProps> = ({
  user,
  onGoDashboard,
  onRefreshCrew,
}) => {
  // Server/Client Guard: If not signed in or email doesn't match ADMIN_EMAIL, render nothing.
  const isAdmin = Boolean(
    user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );

  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadAdminData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const data = await fetchAllUsersForAdmin();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load admin user records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [user]);

  if (!user || !isAdmin) {
    return null;
  }

  // Filter users by email or display name
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = u.displayName ? u.displayName.toLowerCase().includes(q) : false;
    const emailMatch = u.email ? u.email.toLowerCase().includes(q) : false;
    return nameMatch || emailMatch;
  });

  // Calculate top summary counts
  const totalAccounts = users.length;
  const paidAccounts = users.filter((u) => u.plan === 'paid').length;
  const totalCrewMembers = users.reduce((acc, curr) => acc + (curr.crewCount || 0), 0);

  const handleTogglePlan = async (targetUser: AdminUserRecord) => {
    const nextPlan: 'free' | 'paid' = targetUser.plan === 'paid' ? 'free' : 'paid';
    setUpdatingUid(targetUser.uid);
    setStatusMessage(null);

    // Optimistic UI update
    setUsers((prev) =>
      prev.map((u) => (u.uid === targetUser.uid ? { ...u, plan: nextPlan } : u))
    );

    const success = await updateUserPlanByAdmin(targetUser.uid, nextPlan);

    if (success) {
      setStatusMessage(`Updated plan for ${targetUser.email || targetUser.displayName} to "${nextPlan}".`);
      if (onRefreshCrew && targetUser.uid === user.uid) {
        await onRefreshCrew();
      }
    } else {
      // Revert if failed
      setUsers((prev) =>
        prev.map((u) => (u.uid === targetUser.uid ? { ...u, plan: targetUser.plan } : u))
      );
      setStatusMessage(`Failed to update plan for ${targetUser.email || targetUser.displayName}.`);
    }

    setUpdatingUid(null);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (_) {
      return '—';
    }
  };

  const formatLastActive = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch (_) {
      return '—';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 font-sans space-y-6 animate-fadeIn">
      {/* Navigation link back to dashboard */}
      <div>
        <button
          onClick={onGoDashboard}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#004364] hover:text-[#002f47] transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-stone-100 border border-stone-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to my crew</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1B1B1B] tracking-tight">Admin</h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Manage customer accounts and plans.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-lg border border-stone-200 transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
          title="Refresh table"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 3 Simple Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-stone-100 text-[#004364]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#1B1B1B]">{totalAccounts}</div>
            <div className="text-xs text-stone-500 font-medium">Total Accounts</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-[#649940]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#1B1B1B]">{paidAccounts}</div>
            <div className="text-xs text-stone-500 font-medium">Paid Accounts</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-50 text-[#004364]">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#1B1B1B]">{totalCrewMembers}</div>
            <div className="text-xs text-stone-500 font-medium">Total Crew Members</div>
          </div>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div className="p-3 bg-stone-100 border border-stone-200 rounded-xl text-xs text-stone-700 flex items-center justify-between gap-2">
          <span>{statusMessage}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-stone-400 hover:text-stone-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search Filter Box */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search accounts by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-9 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#004364]/20 transition-all shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#004364]" />
            <span>Loading user accounts...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-500 space-y-1">
            <p className="font-semibold text-stone-700">No matching accounts found</p>
            <p>Try adjusting your search filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Display Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Plan</th>
                  <th className="py-3.5 px-4 text-center">Crew Count</th>
                  <th className="py-3.5 px-4">Created</th>
                  <th className="py-3.5 px-4">Last Active</th>
                  <th className="py-3.5 px-4 text-right">Plan Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {filteredUsers.map((u) => {
                  const isUserPaid = u.plan === 'paid';
                  const isSelf = u.uid === user.uid;

                  return (
                    <tr key={u.uid} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-stone-900">
                        {u.displayName || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-stone-600 select-all">
                        {u.email || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            isUserPaid
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-stone-100 text-stone-700 border-stone-200'
                          }`}
                        >
                          {isUserPaid ? (
                            <>
                              <Sparkles className="w-3 h-3 text-[#649940]" />
                              <span>Paid</span>
                            </>
                          ) : (
                            <span>Free</span>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-stone-700">
                        {u.crewCount ?? 0}
                      </td>
                      <td className="py-3.5 px-4 text-stone-500">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-stone-500">
                        <div className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>{formatLastActive(u.updatedAt)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleTogglePlan(u)}
                          disabled={updatingUid === u.uid}
                          className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer border shadow-2xs ${
                            isUserPaid
                              ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                              : 'bg-[#649940] hover:bg-[#527d34] text-white border-[#649940]'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {updatingUid === u.uid
                            ? 'Updating...'
                            : isUserPaid
                            ? 'Set to Free'
                            : 'Set to Paid'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
