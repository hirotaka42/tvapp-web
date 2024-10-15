'use client'

const Login = () => {
  return (
    <>
      <h1>Loginページ</h1>
      <form>
        <input type="text" placeholder="username" />
        <input type="password" placeholder="password" />
        <button>Login</button>
      </form>
    </>
  );
};

export default Login;