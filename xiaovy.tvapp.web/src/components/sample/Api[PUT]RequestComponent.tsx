import React, { useState, useEffect } from 'react';

const PutRequestComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const baseEndpoint = '/api/example';
  const url = `${baseEndpoint}`;

  useEffect(() => {
    const updateData = async () => {
      try {
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: 'value', // 更新するデータに適した内容に変更
          }),
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

    updateData();
  }, []);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>エラー: {error}</p>;

  return (
    <div>
      <h1>更新されたAPIデータ</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default PutRequestComponent;