import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaLock, FaKey, FaTimes, FaCheckCircle, FaCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import baseUrl from '../../api/api';

const ResetPasswordModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Password validation checks
  const hasMinLength = newPassword.length >= 6;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber    = /[0-9]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber;
  const isPasswordMatch = confirmPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your current password.');
      return;
    }
    if (!hasMinLength) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (!hasUppercase) {
      toast.error('New password must contain at least one uppercase letter (A-Z).');
      return;
    }
    if (!hasNumber) {
      toast.error('New password must contain at least one number (0-9).');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl.baseUrl}api/admin/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      });

      const data = await res.json();
      if (res.ok && data.success !== false) {
        toast.success(data.message || 'Password updated successfully! Please log in again.');
        
        // Log out & Redirect to Login Page
        localStorage.removeItem('token');
        dispatch(logout());
        handleClose();

        setTimeout(() => {
          window.location.href = '/login';
        }, 500);
      } else {
        toast.error(data.message || 'Failed to update password. Please check your current password.');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transform transition-all duration-200 scale-100"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'modalPopIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <FaKey className="text-base" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">Reset Password</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Update your login credentials</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaLock size={14} />
              </div>
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full pl-9 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showCurrent ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaKey size={14} />
              </div>
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full pl-9 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showNew ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>

            {/* Password Validation Requirements */}
            <div className="mt-2.5 p-2.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800 space-y-1">
              <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">Password must contain:</p>
              
              <div className="flex items-center gap-1.5 text-[11px]">
                {hasMinLength ? (
                  <FaCheckCircle className="text-emerald-500 flex-shrink-0" size={12} />
                ) : (
                  <FaCircle className="text-gray-300 dark:text-gray-600 flex-shrink-0" size={8} />
                )}
                <span className={hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-500 dark:text-gray-400'}>
                  At least 6 characters
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px]">
                {hasUppercase ? (
                  <FaCheckCircle className="text-emerald-500 flex-shrink-0" size={12} />
                ) : (
                  <FaCircle className="text-gray-300 dark:text-gray-600 flex-shrink-0" size={8} />
                )}
                <span className={hasUppercase ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-500 dark:text-gray-400'}>
                  At least 1 uppercase letter (A-Z)
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px]">
                {hasNumber ? (
                  <FaCheckCircle className="text-emerald-500 flex-shrink-0" size={12} />
                ) : (
                  <FaCircle className="text-gray-300 dark:text-gray-600 flex-shrink-0" size={8} />
                )}
                <span className={hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-500 dark:text-gray-400'}>
                  At least 1 number (0-9)
                </span>
              </div>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaKey size={14} />
              </div>
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full pl-9 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showConfirm ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
            {confirmPassword.length > 0 && (
              <p className={`text-[11px] mt-1 flex items-center gap-1 ${isPasswordMatch ? 'text-emerald-600' : 'text-red-500'}`}>
                {isPasswordMatch ? <FaCheckCircle size={10} /> : '✖'}
                {isPasswordMatch ? 'Passwords match' : 'Passwords do not match'}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !currentPassword || !isPasswordValid || !isPasswordMatch}
              className="px-5 py-2 text-xs font-semibold text-white bg-gray-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes modalPopIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ResetPasswordModal;
