import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../services/auth';
import type { FirebaseError } from 'firebase/app';

type AuthMode = 'login' | 'register';

/**
 * Maps Firebase Auth error codes to user-friendly Russian messages.
 */
function getErrorMessage(error: unknown): string {
  const code = (error as FirebaseError)?.code ?? '';

  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password' ||
    code === 'auth/invalid-email'
  ) {
    return 'Неверный email или пароль';
  }

  if (code === 'auth/user-not-found') {
    return 'Аккаунт не найден';
  }

  if (
    code === 'auth/network-request-failed' ||
    code === 'auth/timeout'
  ) {
    return 'Нет подключения к интернету';
  }

  if (code === 'auth/email-already-in-use') {
    return 'Этот email уже зарегистрирован';
  }

  if (code === 'auth/weak-password') {
    return 'Пароль слишком короткий (минимум 6 символов)';
  }

  if (code === 'auth/too-many-requests') {
    return 'Слишком много попыток. Подождите и попробуйте снова';
  }

  return 'Произошла ошибка. Попробуйте снова';
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!displayName.trim()) {
        setError('Введите ваше имя');
        return;
      }
      if (password !== confirmPassword) {
        setError('Пароли не совпадают');
        return;
      }
      if (password.length < 6) {
        setError('Пароль слишком короткий (минимум 6 символов)');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, displayName.trim());
      }
      navigate('/map');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/map');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Dispatch: Career Path
          </h1>
          <p className="text-gray-300 text-base">
            {mode === 'login'
              ? 'Войдите, чтобы продолжить обучение'
              : 'Создайте аккаунт для начала обучения'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-700">
          {/* Mode Toggle */}
          <div className="flex mb-6 bg-gray-700 rounded-xl p-1">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all min-h-[44px] ${
                mode === 'login'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Войти
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all min-h-[44px] ${
                mode === 'register'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Регистрация
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              className="mb-4 p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm"
            >
              {error}
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name (register only) */}
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="displayName"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Имя
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ваше имя"
                  className="w-full px-4 py-3 min-h-[44px] bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  disabled={loading}
                  autoComplete="name"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 min-h-[44px] bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Пароль
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 min-h-[44px] bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                disabled={loading}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {/* Confirm Password (register only) */}
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Повторите пароль
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 min-h-[44px] bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 min-h-[44px] bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-base transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Загрузка...
                </span>
              ) : mode === 'login' ? (
                'Войти'
              ) : (
                'Создать аккаунт'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-600" />
            <span className="px-3 text-sm text-gray-400">или</span>
            <div className="flex-1 border-t border-gray-600" />
          </div>

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 min-h-[44px] bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed border border-gray-600 text-white font-medium rounded-lg text-base transition-all flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Войти через Google
          </button>

          {/* Toggle Mode Link */}
          <p className="mt-6 text-center text-sm text-gray-400">
            {mode === 'login' ? (
              <>
                Нет аккаунта?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  Зарегистрироваться
                </button>
              </>
            ) : (
              <>
                Уже есть аккаунт?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  Войти
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
