import { ChangeEvent } from 'react';
import { PasswordInput } from '@/components/atomicDesign/atoms/PasswordInput';
import { Button } from '@/components/atomicDesign/atoms/Button';

interface SignUpFormsProps {
  formData: {
    Email: string;
    Password: string;
    Uid: string;
    PhoneNumber: string;
  };
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
}

const SignUpForms: React.FC<SignUpFormsProps> = ({
  formData,
  handleChange,
  handleSubmit,
  loading = false
}) => {
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
        <div>
          <label htmlFor="Uid" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            ユーザーID
          </label>
          <input
            id="Uid"
            name="Uid"
            type="text"
            value={formData.Uid}
            onChange={handleChange}
            placeholder="user_id"
            required
            className="w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-200"
          />
        </div>

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
          <label htmlFor="PhoneNumber" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            電話番号
          </label>
          <input
            id="PhoneNumber"
            name="PhoneNumber"
            type="tel"
            value={formData.PhoneNumber}
            onChange={handleChange}
            placeholder="080-1234-5678"
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
