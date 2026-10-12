import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckSquare,
  Square,
  Key,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  Lock,
  UserCheck,
  Sparkles,
  ShoppingBag,
  Store,
  Ticket,
  Package,
  QrCode,
  BarChart3,
  RefreshCw,
  History,
  Heart,
  Eye,
  EyeOff,
  UserX,
} from 'lucide-react';
import { User, AppModule } from '../types.ts';
import { api } from '../services/api.ts';
import { UserAvatar, UserRoleBadge } from './common/index.ts';

interface UserManagementViewProps {
  currentUser: User;
}

interface ModuleDefinition {
  id: AppModule;
  label: string;
  description: string;
  category: 'Consumer' | 'Grower' | 'Administration' | 'Core';
  icon: React.FC<{ className?: string }>;
}

const ALL_MODULES: ModuleDefinition[] = [
  {
    id: 'markets_discovery',
    label: 'Mandi Map & Stalls (markets_discovery)',
    description: 'Find Mandi locations, stall numbers & operating schedules',
    category: 'Core',
    icon: Store,
  },
  {
    id: 'produce_catalog',
    label: 'Fresh Produce Catalog (produce_catalog)',
    description: 'Browse fresh vegetables & fruits (Rs. 0 advance online fee)',
    category: 'Consumer',
    icon: ShoppingBag,
  },
  {
    id: 'my_preorders',
    label: 'Pickup Passes & PINs (my_preorders)',
    description: 'Digital 4-digit pickup vouchers & cash amount due at stall',
    category: 'Consumer',
    icon: Ticket,
  },
  {
    id: 'order_history',
    label: 'Order History & Changes (order_history)',
    description: 'Customer pre-order modifications and cancellations',
    category: 'Consumer',
    icon: History,
  },
  {
    id: 'favorites',
    label: 'Saved Stalls & Crops (favorites)',
    description: 'Bookmarked grower stalls and favorite regional crops',
    category: 'Consumer',
    icon: Heart,
  },
  {
    id: 'harvest_inventory',
    label: 'Harvest Stock & Pricing (harvest_inventory)',
    description: 'Manage crop inventory, pricing per unit, and cutoff hours',
    category: 'Grower',
    icon: Package,
  },
  {
    id: 'stall_scanner',
    label: 'Stall PIN Scanner (stall_scanner)',
    description: 'At-stall PIN/QR inspection & cash payment collection',
    category: 'Grower',
    icon: QrCode,
  },
  {
    id: 'agro_copilot',
    label: 'Agro-Copilot AI Assistant (agro_copilot)',
    description: 'Google Gemini Pro with English & Roman Urdu language intelligence',
    category: 'Core',
    icon: Sparkles,
  },
  {
    id: 'user_management',
    label: 'User Management & RBAC (user_management)',
    description: 'Control user credentials, module checklists, and permission assignments',
    category: 'Administration',
    icon: Users,
  },
  {
    id: 'analytics_reports',
    label: 'Market & Fulfillment Reports (analytics_reports)',
    description: 'Stall reservation trends, cash turnover & fulfillment metrics',
    category: 'Administration',
    icon: BarChart3,
  },
];

const PRESETS: { name: string; role: User['role']; role_title: string; modules: AppModule[] }[] = [
  {
    name: 'Customer Standard',
    role: 'customer',
    role_title: 'Verified Customer',
    modules: ['produce_catalog', 'my_preorders', 'order_history', 'favorites', 'markets_discovery', 'agro_copilot'],
  },
  {
    name: 'Farmer / Grower',
    role: 'farmer',
    role_title: 'Organic Grower & Stall Lead',
    modules: ['harvest_inventory', 'stall_scanner', 'markets_discovery', 'agro_copilot'],
  },
  {
    name: 'SuperAdmin Full Access',
    role: 'admin',
    role_title: 'Market Authority Administrator',
    modules: [
      'markets_discovery',
      'produce_catalog',
      'my_preorders',
      'order_history',
      'favorites',
      'harvest_inventory',
      'stall_scanner',
      'agro_copilot',
      'user_management',
      'analytics_reports',
    ],
  },
];

export const UserManagementView: React.FC<UserManagementViewProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [userToDelete, setUserToDelete] = useState<{ id: number; name: string } | null>(null);

  // Form Fields
  const [formName, setFormName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formPassword, setFormPassword] = useState<string>('');
  const [showFormPassword, setShowFormPassword] = useState<boolean>(false);
  const [formRole, setFormRole] = useState<User['role']>('customer');
  const [formRoleTitle, setFormRoleTitle] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formOrg, setFormOrg] = useState<string>('');
  const [formModules, setFormModules] = useState<AppModule[]>([
    'produce_catalog',
    'my_preorders',
    'markets_discovery',
  ]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to load user accounts',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setEditingUserId(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('customer');
    setFormRoleTitle('Market Member');
    setFormPhone('+92 300 1234567');
    setFormOrg('Community Member');
    setFormModules(['produce_catalog', 'my_preorders', 'markets_discovery', 'agro_copilot']);
    setIsModalOpen(true);
  };

  const openEditModal = (targetUser: User) => {
    setEditingUserId(targetUser.id);
    setFormName(targetUser.name);
    setFormEmail(targetUser.email);
    setFormPassword('');
    setFormRole(targetUser.role);
    setFormRoleTitle(targetUser.role_title || '');
    setFormPhone(targetUser.phone || '');
    setFormOrg(targetUser.organization || '');
    setFormModules(targetUser.modules || []);
    setIsModalOpen(true);
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setFormRole(preset.role);
    setFormRoleTitle(preset.role_title);
    setFormModules([...preset.modules]);
  };

  const toggleModule = (moduleId: AppModule) => {
    if (formModules.includes(moduleId)) {
      setFormModules(formModules.filter((m) => m !== moduleId));
    } else {
      setFormModules([...formModules, moduleId]);
    }
  };

  const selectAllModules = () => {
    setFormModules(ALL_MODULES.map((m) => m.id));
  };

  const clearAllModules = () => {
    setFormModules([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || (!editingUserId && !formPassword.trim())) {
      setFeedback({ type: 'error', message: 'Name, email, and password are required.' });
      return;
    }

    if (formModules.length === 0) {
      setFeedback({ type: 'error', message: 'Please select at least one module for this user.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      if (editingUserId) {
        const res = await api.updateUser(editingUserId, {
          name: formName.trim(),
          role: formRole,
          role_title: formRoleTitle.trim(),
          phone: formPhone.trim(),
          organization: formOrg.trim(),
          modules: formModules,
          ...(formPassword.trim() ? { password: formPassword.trim() } : {}),
        });
        setFeedback({ type: 'success', message: `${res.user.name}'s permissions updated successfully.` });
      } else {
        const res = await api.createUser({
          name: formName.trim(),
          email: formEmail.trim(),
          password: formPassword.trim(),
          role: formRole,
          role_title: formRoleTitle.trim(),
          phone: formPhone.trim(),
          organization: formOrg.trim(),
          modules: formModules,
        });
        setFeedback({
          type: 'success',
          message: `User ${res.user.name} created! They can now log in with ${res.user.email}.`,
        });
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Operation failed.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    const { id, name } = userToDelete;

    if (id === 1) {
      setFeedback({ type: 'error', message: 'Cannot delete primary SuperAdmin account.' });
      setUserToDelete(null);
      return;
    }
    if (id === currentUser.id) {
      setFeedback({ type: 'error', message: 'Cannot delete your own logged-in account.' });
      setUserToDelete(null);
      return;
    }

    try {
      await api.deleteUser(id);
      setFeedback({ type: 'success', message: `User "${name}" deleted successfully.` });
      setUserToDelete(null);
      fetchUsers();
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to delete user.',
      });
      setUserToDelete(null);
    }
  };

  const handleToggleSuspend = async (u: User) => {
    if (u.id === 1 || u.id === currentUser.id) {
      setFeedback({ type: 'error', message: 'Cannot suspend primary SuperAdmin account.' });
      return;
    }
    const isSuspended = u.isSuspended || (u as any).status === 'suspended';
    try {
      if (isSuspended) {
        const res = await api.activateUser(u.id);
        setFeedback({ type: 'success', message: res.message || `Account for "${u.name}" reactivated.` });
      } else {
        const res = await api.suspendUser(u.id);
        setFeedback({ type: 'error', message: res.message || `Account for "${u.name}" suspended.` });
      }
      fetchUsers();
    } catch (err: unknown) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Action failed.' });
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto w-full">
      {/* Module Title & Hero */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#e2e8e5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#ecfdf5] text-[#064e3b] font-medium text-[10px] uppercase border border-emerald-200">
              Dynamic RBAC Engine
            </span>
            <span className="text-xs text-[#64748b] font-medium">8 Configurable Modules</span>
          </div>
          <h2 className="text-2xl font-serif font-normal text-[#10231d] tracking-tight">
            Settings &amp; User Management
          </h2>
          <p className="text-xs text-[#64748b] mt-1 max-w-2xl leading-relaxed">
            Create user accounts and assign granular module permissions. When a user logs in, MarketLink parses their assigned checklist and strictly renders only their permitted sidebar navigation links and routes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-[#e2e8e5] text-[#10231d] hover:bg-[#eef2ec] transition-all cursor-pointer"
            title="Refresh user accounts"
          >
            <RefreshCw className={`w-4 h-4 text-[#064e3b] ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#064e3b] hover:bg-[#043d2e] text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-emerald-300" />
            <span>Create New User</span>
          </button>
        </div>
      </div>

      {/* Notifications / Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-xs ${
            feedback.type === 'success'
              ? 'bg-[#ecfdf5] border border-emerald-200 text-[#064e3b]'
              : 'bg-rose-50 border border-rose-200 text-[#b3261e]'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#064e3b] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#b3261e] shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="cursor-pointer text-[#64748b] hover:text-[#10231d] font-bold">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-[#e2e8e5] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#e2e8e5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#064e3b]" />
            <h3 className="font-serif font-normal text-base text-[#10231d]">Registered Accounts &amp; Module Matrix</h3>
          </div>
          <span className="text-xs text-[#64748b] font-medium">Total: {users.length} Users</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8f7f2] border-b border-[#e2e8e5] text-[#064e3b] font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-6">User</th>
                <th className="py-3.5 px-6">Role &amp; Title</th>
                <th className="py-3.5 px-6">Assigned Modules</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8e5] text-[#10231d]">
              {users.map((u) => {
                const assigned = u.modules || [];
                const isSuperAdmin = u.id === 1;

                return (
                  <tr key={u.id} className="hover:bg-[#ecfdf5]/30 transition-colors">
                    {/* User profile */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={u.name}
                          avatarUrl={u.avatar_url}
                          size="sm"
                          role={u.role}
                        />
                        <div>
                          <div className="font-semibold text-[#10231d] flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {isSuperAdmin && (
                              <span className="bg-[#ecfdf5] text-[#064e3b] border border-emerald-200 text-[9px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded">
                                Root Admin
                              </span>
                            )}
                          </div>
                          <div className="text-[#64748b] text-xs font-mono">{u.email}</div>
                          {u.organization && (
                            <div className="text-[10px] text-[#64748b] font-medium">{u.organization}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Role & Title */}
                    <td className="py-4 px-6">
                      <div className="mb-1">
                        <UserRoleBadge role={u.role} />
                      </div>
                      <p className="text-xs font-medium text-[#64748b]">
                        {u.role_title || 'Community Member'}
                      </p>
                    </td>

                    {/* Modules checklist pills */}
                    <td className="py-4 px-6 max-w-md">
                      <div className="flex flex-wrap gap-1">
                        {assigned.map((mod) => (
                          <span
                            key={mod}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#ecfdf5] text-[#064e3b] text-[10px] font-medium border border-emerald-200"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                            {mod}
                          </span>
                        ))}
                        {assigned.length === 0 && (
                          <span className="text-[10px] text-[#b3261e] italic">No modules assigned</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg bg-[#eef2ec] hover:bg-[#eae8df] text-[#064e3b] transition-all cursor-pointer"
                          title="Edit Permissions & Modules"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {!isSuperAdmin && u.id !== currentUser.id && (
                          <>
                            <button
                              onClick={() => handleToggleSuspend(u)}
                              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                u.isSuspended || (u as any).status === 'suspended'
                                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                              }`}
                              title={u.isSuspended || (u as any).status === 'suspended' ? 'Reactivate User' : 'Suspend User'}
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setUserToDelete({ id: u.id, name: u.name })}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#b3261e] transition-all cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* In-App Confirmation Modal (Replaces window.confirm/window.alert) */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10231d]/60 backdrop-blur-md">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e2e8e5] space-y-4">
            <h3 className="font-serif font-normal text-[#10231d] text-lg">Delete User Account</h3>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Are you sure you want to permanently delete user &quot;<strong>{userToDelete.name}</strong>&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-lg border border-[#e2e8e5] text-[#10231d] text-xs font-semibold hover:bg-[#eef2ec] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-[#b3261e] text-white text-xs font-semibold hover:bg-[#8f1e17] cursor-pointer shadow-xs"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10231d]/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#e2e8e5] overflow-hidden my-8 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-white border-b border-[#e2e8e5] text-[#10231d] p-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#064e3b]" />
                  <h3 className="font-serif font-normal text-lg text-[#10231d]">
                    {editingUserId ? 'Edit User Permissions & Modules' : 'Create New User with Dynamic RBAC'}
                  </h3>
                </div>
                <p className="text-xs text-[#64748b] mt-1">
                  Select permitted modules. Only selected modules will appear in this user&apos;s sidebar.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#64748b] hover:text-[#10231d] hover:bg-[#eef2ec] p-1.5 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 bg-[#f8f7f2] max-h-[80vh] overflow-y-auto">
              {/* Presets Row */}
              <div className="bg-white p-4 rounded-xl border border-[#e2e8e5] shadow-2xs">
                <span className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wider block mb-2">
                  Quick Role Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="px-3 py-1.5 rounded-lg border border-[#e2e8e5] bg-[#f8f7f2] hover:bg-[#ecfdf5] hover:border-emerald-300 text-xs font-medium text-[#10231d] transition-all cursor-pointer"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[#10231d] block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Tariq Mehmood"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#e2e8e5] text-xs text-[#10231d] focus:outline-hidden focus:border-[#10b981]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#10231d] block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    disabled={Boolean(editingUserId)}
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="tariq@farm.pk"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#e2e8e5] text-xs text-[#10231d] focus:outline-hidden focus:border-[#10b981] disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#10231d] block mb-1">
                    {editingUserId ? 'Change Password (Leave blank to keep)' : 'Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showFormPassword ? 'text' : 'password'}
                      required={!editingUserId}
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder={editingUserId ? '••••••••' : 'Minimum 6 characters'}
                      className="w-full pl-3 pr-9 py-2 rounded-lg bg-white border border-[#e2e8e5] text-xs text-[#10231d] focus:outline-hidden focus:border-[#10b981]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowFormPassword(!showFormPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#64748b] hover:text-[#10231d] cursor-pointer"
                      title={showFormPassword ? 'Hide password' : 'Show password'}
                    >
                      {showFormPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#10231d] block mb-1">Role Type</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as User['role'])}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#e2e8e5] text-xs text-[#10231d] focus:outline-hidden focus:border-[#10b981]"
                  >
                    <option value="customer">Customer</option>
                    <option value="farmer">Farmer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              {/* Module Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#10231d] uppercase tracking-wider">
                    Permitted Modules Checklist:
                  </span>
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={selectAllModules}
                      className="text-[#064e3b] font-medium hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={clearAllModules}
                      className="text-[#64748b] font-medium hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ALL_MODULES.map((mod) => {
                    const isChecked = formModules.includes(mod.id);
                    const Icon = mod.icon;
                    return (
                      <div
                        key={mod.id}
                        onClick={() => toggleModule(mod.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                          isChecked
                            ? 'bg-[#ecfdf5] border-emerald-300 ring-1 ring-[#10b981]'
                            : 'bg-white border-[#e2e8e5] hover:bg-[#f8f7f2]'
                        }`}
                      >
                        <div className="mt-0.5">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#064e3b]" />
                          ) : (
                            <Square className="w-4 h-4 text-[#64748b]/40" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-[#10231d] flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 text-[#64748b]" />
                            <span>{mod.label}</span>
                          </div>
                          <p className="text-[11px] text-[#64748b] mt-0.5">{mod.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#e2e8e5] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-[#e2e8e5] text-[#10231d] text-xs font-semibold hover:bg-[#eef2ec] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-lg bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingUserId ? 'Save Permissions' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
