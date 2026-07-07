import { ChangeEvent } from 'react';
import Link from 'next/link';
import { PasswordInput } from '@/components/atomicDesign/atoms/PasswordInput';
import { Button } from '@/components/atomicDesign/atoms/Button';

interface SignInFormsProps {
  formData: {
    Email: string;
    Password: string;
  };
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  onGoogleSignIn: () => void;
  onSendEmailLink: () => void;
  loading?: boolean;
  googleLoading?: boolean;
  emailLinkSent?: boolean;
  error?: string;
}

const SignInForms: React.FC<SignInFormsProps> = ({
  formData,
  handleChange,
  handleSubmit,
  onGoogleSignIn,
  onSendEmailLink,
  loading = false,
  googleLoading = false,
  emailLinkSent = false,
  error,
}) => {
  const isFormValid = formData.Email.trim() !== '' && formData.Password.trim() !== '';
  const isEmailValid = formData.Email.trim() !== '';

  return (
    <div className="w-full max-w-md mx-auto p-8 lg:p-10 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl">
      <div className="mb-8 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 36 24"
          fill="currentColor"
          className="h-10 w-auto mx-auto mb-6 text-blue-600 dark:text-blue-400"
        >
          <path d="M18.724 1.714c-4.538 0-7.376 2.286-8.51 6.857 1.702-2.285 3.687-3.143 5.957-2.57 1.296.325 2.22 1.271 3.245 2.318 1.668 1.706 3.6 3.681 7.819 3.681 4.539 0 7.376-2.286 8.51-6.857-1.701 2.286-3.687 3.143-5.957 2.571-1.294-.325-2.22-1.272-3.245-2.32-1.668-1.705-3.6-3.68-7.819-3.68zM10.214 12c-4.539 0-7.376 2.286-8.51 6.857 1.701-2.286 3.687-3.143 5.957-2.571 1.294.325 2.22 1.272 3.245 2.32 1.668 1.705 3.6 3.68 7.818 3.68 4.54 0 7.377-2.286 8.511-6.857-1.702 2.286-3.688 3.143-5.957 2.571-1.295-.326-2.22-1.272-3.245-2.32-1.669-1.705-3.6-3.68-7.82-3.68z"></path>
        </svg>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">ログイン</h2>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Google ログイン */}
      <button
        type="button"
        onClick={onGoogleSignIn}
        disabled={googleLoading}
        className="w-full h-12 flex items-center justify-center gap-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white font-medium transition hover:bg-gray-50 dark:hover:bg-slate-600 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
        </svg>
        {googleLoading ? '処理中…' : 'Google でログイン'}
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400">
            またはメールアドレスで
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="Email" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            メールアドレス
          </label>
          <input
            id="Email"
            name="Email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={formData.Email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            className="w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-200"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="Password" className="block text-sm font-medium text-gray-900 dark:text-white">
              パスワード
            </label>
            <Link href="/user/reset-password" className="text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400">
              お忘れですか？
            </Link>
          </div>
          <PasswordInput name="Password" value={formData.Password} onChange={handleChange} placeholder="パスワードを入力" />
        </div>

        <div className="pt-1">
          <Button type="submit" variant="primary" size="md" fullWidth loading={loading} disabled={!isFormValid || loading}>
            ログイン
          </Button>
        </div>
      </form>

      {/* パスワードなし(メールリンク) */}
      <div className="mt-4 text-center">
        {emailLinkSent ? (
          <p className="text-sm text-green-600 dark:text-green-400">
            ログイン用リンクをメールで送信しました。メールをご確認ください。
          </p>
        ) : (
          <button
            type="button"
            onClick={onSendEmailLink}
            disabled={!isEmailValid}
            className="text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 disabled:opacity-50"
          >
            パスワードなしでログイン（メールにリンクを送信）
          </button>
        )}
      </div>

      <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        アカウントをお持ちでない方？{' '}
        <Link href="/user/register" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400">
          今すぐ登録
        </Link>
      </p>
    </div>
  );
};

export default SignInForms;
