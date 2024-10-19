import React, { useState, useEffect } from 'react';

const DeleteRequestWithQueryComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 削除対象のIDをクエリに含めます
  const idToDelete = '123';
  const baseEndpoint = '/api/example';
  const url = `${baseEndpoint}/?id=${idToDelete}`;

  useEffect(() => {
    const deleteData = async () => {
      try {
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('ネットワーク応答が不正です');
        }

        const result = await response.json();
        setData(result);
      } catch (error) {
        if (error instanceof Error) {
          console.error('エラーが発生しました:', error.message);
          setError(error.message);
        } else {
          console.error('予期しないエラー:', error);
          setError('予期しないエラーが発生しました');
        }
      } finally {
        setLoading(false);
      }
    };

    deleteData();
  }, []);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>エラー: {error}</p>;

  return (
    <div>
      <h1>削除結果</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default DeleteRequestWithQueryComponent;