import { ChangeEvent } from 'react';
import { PasswordInput } from '@/components/atomicDesign/atoms/PasswordInput';
import { Button } from '@/components/atomicDesign/atoms/Button';

interface SignUpFormsProps {
  formData: {
    Email: string;
    Password: string;
    ConfirmPassword: string;
  };
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  error?: string;
}

const SignUpForms: React.FC<SignUpFormsProps> = ({
  formData,
  handleChange,
  handleSubmit,
  loading = false,
  error
}) => {
  const isFormValid =
    formData.Email.trim() !== '' &&
    formData.Password.trim() !== '' &&
    formData.ConfirmPassword.trim() !== '' &&
    formData.Password === formData.ConfirmPassword;

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
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          アカウントを作成
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          無料でアカウントを作成して視聴を開始
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          </div>
        )}

        <div>
          <label htmlFor="Email" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            メールアドレス
          </label>
          <input
            id="Email"
            name="Email"
            type="email"
            value={formData.Email}
            onChange={handleChange}
            placeholder="user@example.com"
            required
            className="w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-200"
          />
        </div>

        <div>
          <label htmlFor="Password" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            パスワード
          </label>
          <PasswordInput
            name="Password"
            value={formData.Password}
            onChange={handleChange}
            placeholder="8文字以上のパスワード"
          />
        </div>

        <div>
          <label htmlFor="ConfirmPassword" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            パスワード（確認用）
          </label>
          <PasswordInput
            name="ConfirmPassword"
            value={formData.ConfirmPassword}
            onChange={handleChange}
            placeholder="パスワードを再入力"
          />
          {formData.ConfirmPassword && formData.Password !== formData.ConfirmPassword && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              パスワードが一致しません
            </p>
          )}
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>アカウントを作成することで、以下に同意したものとみなされます：</p>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>利用規約</li>
            <li>プライバシーポリシー</li>
          </ul>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            loading={loading}
            disabled={!isFormValid || loading}
          >
            アカウントを作成
          </Button>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        すでにアカウントをお持ちですか？{' '}
        <a href="/user/login" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400">
          ログイン
        </a>
      </p>
    </div>
  );
};

export default SignUpForms;
