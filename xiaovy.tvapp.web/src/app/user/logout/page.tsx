'use client'

const Logout = () => {
  return (
    <>
      <h1>Logoutページ</h1>
      <form>
        <input type="text" placeholder="username" />
        <input type="password" placeholder="password" />
        <button>Logout</button>
      </form>
    </>
  );
};

export default Logout;