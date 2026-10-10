import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, ShieldCheck, KeyRound, Mail, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, requestActivation, verifyActivation } = useAuth();
  const [tab, setTab] = useState<'login' | 'activate'>(initialMode === 'register' ? 'activate' : 'login');

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Activation multi-step state
  const [activationStep, setActivationStep] = useState<1 | 2>(1);
  const [prn, setPrn] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [residenceHall, setResidenceHall] = useState('Sahyadri Boys Hostel (Block A)');
  const [activationInfo, setActivationInfo] = useState<{
    maskedEmail?: string;
    department?: string;
    fullName?: string;
    evaluatorNotice?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!identifier.trim() || !password) {
      setErrorMessage('Please enter both your PRN/Email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(identifier.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setErrorMessage(result.error || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleActivationRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!prn.trim()) {
      setErrorMessage('Please enter your SGU Permanent Registration Number (PRN).');
      return;
    }

    setIsSubmitting(true);
    const result = await requestActivation(prn.trim());
    setIsSubmitting(false);

    if (result.success) {
      setActivationInfo({
        maskedEmail: result.maskedEmail,
        department: result.department,
        fullName: result.fullName,
        evaluatorNotice: result.evaluatorNotice,
      });
      setActivationStep(2);
      setSuccessMessage(`Verification code sent to registered university email: ${result.maskedEmail}`);
    } else {
      setErrorMessage(result.error || 'Unable to verify PRN against official roster.');
    }
  };

  const handleActivationVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!verificationCode.trim() || !newPassword) {
      setErrorMessage('Please enter the 6-digit code and create a password.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    const result = await verifyActivation(prn.trim(), verificationCode.trim(), newPassword, residenceHall);
    setIsSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setErrorMessage(result.error || 'Activation failed. Please check your code.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-card-border rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 mb-2 text-primary font-semibold text-xs tracking-wider uppercase px-2.5 py-1 rounded-full bg-pastel-mint text-on-pastel-mint border border-emerald-200/50">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SGU Secured Authentication</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-headline text-on-surface">
            {tab === 'login' ? 'Sign In to EcoTrack' : 'Activate Student Account'}
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Official Sanjay Ghodawat University credentials. Telemetry telemetry, eco-challenges, and audited Green Passport.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-card-border mb-5">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              tab === 'login'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Sign In with PRN / Email
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('activate');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              tab === 'activate'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            First-Time PRN Activation
          </button>
        </div>

        {/* Alert Messages */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TAB 1: LOGIN */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Student PRN or Official Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 252161006 or rahul.deshmukh@sguk.ac.in"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-surface text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your account password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-surface text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="text-[11px] text-on-surface-variant bg-surface-container-low p-2.5 rounded-xl border border-card-border">
              <span className="font-semibold text-on-surface">SGU Student Activation:</span>
              <p className="mt-1 text-[10px]">
                New students: use the <span className="font-semibold text-primary">First-Time PRN Activation</span> tab to verify your PRN against the official university roster and set your password.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying Credentials...' : 'Sign In with Secure Session'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* TAB 2: ACTIVATION */}
        {tab === 'activate' && activationStep === 1 && (
          <form onSubmit={handleActivationRequest} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                University PRN (Permanent Registration Number)
              </label>
              <input
                type="text"
                required
                value={prn}
                onChange={(e) => setPrn(e.target.value)}
                placeholder="Enter 7 to 10 digit PRN (e.g. 252161006)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-surface text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
              />
              <p className="text-[11px] text-on-surface-variant mt-1.5">
                We validate your PRN directly against the official SGU active student roster.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Validating against SGU Roster...' : 'Verify PRN & Send Code'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {tab === 'activate' && activationStep === 2 && (
          <form onSubmit={handleActivationVerify} className="space-y-4">
            {activationInfo && (
              <div className="p-3 rounded-xl bg-pastel-mint/30 border border-emerald-200 text-xs text-on-surface">
                <p className="font-semibold text-primary">{activationInfo.fullName}</p>
                <p className="text-[11px] text-on-surface-variant">{activationInfo.department}</p>
                {activationInfo.evaluatorNotice && (
                  <p className="mt-1 text-[10px] font-mono text-emerald-800 bg-white/70 p-1.5 rounded">
                    {activationInfo.evaluatorNotice}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="e.g. 123456"
                className="w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-surface text-center tracking-widest text-base font-mono font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Create Account Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 chars with letters & numbers"
                className="w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Campus Residence / Hostel (Optional)
              </label>
              <select
                value={residenceHall}
                onChange={(e) => setResidenceHall(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-surface text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="Sahyadri Boys Hostel (Block A)">Sahyadri Boys Hostel (Block A)</option>
                <option value="Sahyadri Boys Hostel (Block B)">Sahyadri Boys Hostel (Block B)</option>
                <option value="Kaveri Girls Hostel (Block A)">Kaveri Girls Hostel (Block A)</option>
                <option value="Day Scholar (Kolhapur/Sangli Commute)">Day Scholar (Kolhapur/Sangli Commute)</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActivationStep(1)}
                className="w-1/3 py-2.5 px-3 rounded-xl border border-card-border bg-surface text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-2/3 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Activating...' : 'Activate & Enter'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
