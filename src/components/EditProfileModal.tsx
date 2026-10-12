import React, { useState, useRef } from 'react';
import {
  User as UserIcon,
  Phone,
  Mail,
  Shield,
  Building,
  MapPin,
  Lock,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Camera,
  Sprout,
  Store,
  Eye,
  EyeOff,
  Upload,
} from 'lucide-react';
import { User } from '../types.ts';
import { api } from '../services/api.ts';
import { UserAvatar } from './common/UserAvatar.tsx';
import { useLanguage } from '../i18n/LanguageContext.tsx';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onProfileUpdated: (updatedUser: User) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80',
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const [name, setName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [cnic, setCnic] = useState(currentUser.cnic || '');
  const [organization, setOrganization] = useState(currentUser.organization || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar_url || AVATAR_PRESETS[0]);
  const [country, setCountry] = useState(currentUser.country || 'Pakistan');
  const [province, setProvince] = useState(currentUser.province || '');
  const [city, setCity] = useState(currentUser.city || '');

  // Farmer specific fields
  const [farmName, setFarmName] = useState(currentUser.farm_name || '');
  const [stallNumber, setStallNumber] = useState(currentUser.stall_number || '');
  const [bio, setBio] = useState('');

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size should be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAvatarUrl(result);
        setErrorMessage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    if (newPassword && newPassword.length < 4) {
      setErrorMessage('New password must be at least 4 characters long.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMessage('New password and confirm password do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.updateUserProfile({
        name: name.trim(),
        phone: phone.trim(),
        cnic: cnic.trim(),
        organization: organization.trim(),
        avatar_url: avatarUrl.trim(),
        country,
        province,
        city,
        ...(currentUser.role === 'farmer'
          ? {
              farm_name: farmName.trim(),
              stall_number: stallNumber.trim(),
              bio: bio.trim() || undefined,
            }
          : {}),
        ...(newPassword.trim() ? { newPassword: newPassword.trim() } : {}),
      });

      setSuccessMessage('Profile saved successfully!');
      onProfileUpdated(res.user);
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10231d]/50 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-[#e2e8e5] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-[#064e3b] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white">
              <UserIcon className="w-5 h-5 text-[#ecfdf5]" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-normal text-white">
                Edit Account Profile
              </h2>
              <p className="text-xs text-emerald-100">
                Update your contact details, stall credentials, and account settings
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-[#b3261e] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#b3261e] shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-[#064e3b] flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-[#064e3b] shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {/* Profile Picture & Presets */}
          <div className="p-4 rounded-xl bg-[#f8f7f2] border border-[#e2e8e5] flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="relative group shrink-0">
              <UserAvatar
                name={name || currentUser.name}
                avatarUrl={avatarUrl}
                size="lg"
                role={currentUser.role}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#064e3b] hover:bg-[#043d2e] text-white shadow-xs cursor-pointer transition-transform hover:scale-110"
                title="Upload image from computer/device"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfileImageUpload}
                className="hidden"
              />
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-semibold text-[#10231d] block">
                  Profile Photo &amp; Avatar
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#e2e8e5] hover:border-[#064e3b] text-xs font-semibold text-[#064e3b] hover:bg-[#eef2ec] shadow-2xs transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload from Device</span>
                </button>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                {AVATAR_PRESETS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      avatarUrl === url
                        ? 'border-[#064e3b] ring-2 ring-[#10b981]/30 scale-105'
                        : 'border-[#e2e8e5] hover:border-[#064e3b]/50'
                    }`}
                  >
                    <img src={url} alt={`Preset ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <input
                type="url"
                value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder={avatarUrl.startsWith('data:') ? 'Custom image uploaded from device' : 'Or paste custom image URL...'}
                className="w-full text-xs px-3 py-1.5 rounded-lg bg-white border border-[#e2e8e5] text-[#10231d] focus:outline-hidden focus:border-[#064e3b]"
              />
            </div>
          </div>

          {/* Core Personal Details */}
          <div className="space-y-4">
            <div className="border-b border-[#e2e8e5] pb-1.5 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-[#064e3b]" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#064e3b]">
                Personal &amp; Contact Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#64748b] block mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-[#f8f7f2] border border-[#e2e8e5] rounded-xl text-[#10231d] focus:outline-hidden focus:border-[#064e3b] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#64748b] block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full h-10 pl-3 pr-8 text-xs bg-stone-100 border border-[#e2e8e5] rounded-xl text-[#64748b] cursor-not-allowed"
                  />
                  <Mail className="w-4 h-4 text-[#64748b] absolute right-2.5 top-3" />
                </div>
                <span className="text-[10px] text-[#64748b]">Email cannot be changed (account ID)</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#64748b] block mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 3XX XXXXXXX"
                    className="w-full h-10 pl-3 pr-8 text-xs bg-[#f8f7f2] border border-[#e2e8e5] rounded-xl text-[#10231d] focus:outline-hidden focus:border-[#064e3b] focus:bg-white"
                  />
                  <Phone className="w-4 h-4 text-[#64748b] absolute right-2.5 top-3" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#64748b] block mb-1">
                  CNIC / National Identity ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cnic}
                    onChange={(e) => setCnic(e.target.value)}
                    placeholder="42101-XXXXXXX-X"
                    className="w-full h-10 pl-3 pr-8 text-xs bg-[#f8f7f2] border border-[#e2e8e5] rounded-xl text-[#10231d] focus:outline-hidden focus:border-[#064e3b] focus:bg-white"
                  />
                  <Shield className="w-4 h-4 text-[#064e3b] absolute right-2.5 top-3" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#64748b] block mb-1">
                Organization / Household Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Household Kitchen Patron / Organic Kitchen Supply"
                  className="w-full h-10 pl-3 pr-8 text-xs bg-[#f8f7f2] border border-[#e2e8e5] rounded-xl text-[#10231d] focus:outline-hidden focus:border-[#064e3b] focus:bg-white"
                />
                <Building className="w-4 h-4 text-[#64748b] absolute right-2.5 top-3" />
              </div>
            </div>
          </div>

          {/* Regional Geography */}
          <div className="space-y-4">
            <div className="border-b border-[#e2e8e5] pb-1.5 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#064e3b]" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#064e3b]">
                Location &amp; Province
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#64748b] block mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-[#f8f7f2] border border-[#e2e8e5] rounded-xl text-[#10231d] focus:outline-hidden focus:border-[#064e3b] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#64748b] block mb-1">Province / State</label>
                <input
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="e.g. Sindh / Punjab"
                  className="w-full h-10 px-3 text-xs bg-[#f8f7f2] border border-[#e2e8e5] rounded-xl text-[#10231d] focus:outline-hidden focus:border-[#064e3b] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#64748b] block mb-1">City / Tehsil</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Karachi / Hyderabad / Lahore"
                  className="w-full h-10 px-3 text-xs bg-[#f8f7f2] border border-[#e2e8e5] rounded-xl text-[#10231d] focus:outline-hidden focus:border-[#064e3b] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Farmer Specific Credentials (if farmer) */}
          {currentUser.role === 'farmer' && (
            <div className="space-y-4 p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
              <div className="border-b border-emerald-200 pb-1.5 flex items-center gap-2">
                <Sprout className="w-4 h-4 text-[#064e3b]" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#064e3b]">
                  Farmer &amp; Stall Credentials
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#064e3b] block mb-1">
                    Farm / Orchard Name
                  </label>
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="e.g. Shanti Organic Green Farms"
                    className="w-full h-10 px-3 text-xs bg-white border border-[#e2e8e5] rounded-xl text-[#10231d] focus:outline-hidden focus:border-[#064e3b]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#064e3b] block mb-1">
                    Stall Bay Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={stallNumber}
                      onChange={(e) => setStallNumber(e.target.value)}
                      placeholder="e.g. Stall #S-09 (Sindh Section)"
                      className="w-full h-10 pl-3 pr-8 text-xs bg-white border border-[#e2e8e5] rounded-xl text-[#10231d] focus:outline-hidden focus:border-[#064e3b]"
                    />
                    <Store className="w-4 h-4 text-[#064e3b] absolute right-2.5 top-3" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#064e3b] block mb-1">
                  Farm Bio &amp; Specialty
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell buyers about your crops, organic methods, and harvest timing..."
                  className="w-full p-2.5 text-xs bg-white border border-[#e2e8e5] rounded-xl text-[#10231d] focus:outline-hidden focus:border-[#064e3b]"
                />
              </div>
            </div>
          )}

          {/* Change Password (Optional) */}
          <div className="space-y-4 pt-2">
            <div className="border-b border-[#e2e8e5] pb-1.5 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#64748b]" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748b]">
                Change Password (Optional)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#64748b] block mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave empty to keep current"
                    className="w-full h-10 pl-3 pr-9 text-xs bg-[#f8f7f2] border border-[#e2e8e5] rounded-xl text-[#10231d] focus:outline-hidden focus:border-[#064e3b] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#64748b] hover:text-[#10231d] cursor-pointer"
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#64748b] block mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full h-10 pl-3 pr-9 text-xs bg-[#f8f7f2] border border-[#e2e8e5] rounded-xl text-[#10231d] focus:outline-hidden focus:border-[#064e3b] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#64748b] hover:text-[#10231d] cursor-pointer"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#e2e8e5] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl border border-[#e2e8e5] text-xs font-semibold text-[#64748b] hover:text-[#10231d] hover:bg-[#eef2ec] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-6 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
