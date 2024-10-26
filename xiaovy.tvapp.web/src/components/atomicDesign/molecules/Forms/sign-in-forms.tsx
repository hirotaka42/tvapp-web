import { ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import InputField from '@/components/InputField';
import { BetaLoginButton } from '@/components/atomicDesign/atoms/BetaLoginButton';

interface SignInFormsProps {
  formData: {
    Email: string;
    Password: string;
  };
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  router: ReturnType<typeof useRouter>
}

const SignInForms: React.FC<SignInFormsProps> = ({ formData, handleChange, handleSubmit, router }) => {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Your Company"
          src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
              Email address
            </label>
            <div className="mt-2">
              <InputField 
                key="Email"
                name="Email"
                value={formData['Email']}
                type="Email"
                onChange={handleChange}
                placeholder="Email"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                Password
              </label>
              <div className="text-sm">
                <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                  Forgot password?
                </a>
              </div>
            </div>
            <div className="mt-2">
              <InputField 
                key="Password"
                name="Password"
                value={formData['Password']}
                type="Password"
                onChange={handleChange}
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign in
            </button>
          </div>
          <BetaLoginButton router={router}  />
        </form>

        <p className="mt-10 text-center text-sm text-gray-500 dark:text-slate-300">
          Not a member?{' '}
          <a href="/user/register" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
            Sign up now
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignInForms;