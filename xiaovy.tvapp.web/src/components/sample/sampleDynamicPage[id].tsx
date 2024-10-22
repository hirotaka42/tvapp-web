import React from 'react';
import { useRouter } from 'next/router';

const DynamicPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div>
      <h1>Dynamic Page: {id}</h1>
    </div>
  );
};

export default DynamicPage;