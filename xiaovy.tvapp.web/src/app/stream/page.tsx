'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

interface Channel {
  title: string;
  url: string;
  logo: string;
  group: string;
}

const Stream = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selected, setSelected] = useState<Channel | null>(null);
  const [isActivated, setIsActivated] = useState(false);
  
  const streamM3uUrl = '/api/service/stream/fetchM3u';
  const router = useRouter();
  const correctPassword = process.env.NEXT_PUBLIC_STREAM_PASSWORD || '';

  // パスワードが localStorage に正しく保存されているかチェック
  useEffect(() => {
    const stored = localStorage.getItem('streamPassword');
    if (stored !== correctPassword) {
      router.push('/user/activate');
    }else {
      setIsActivated(true);
    }
  }, [router, correctPassword]);

  useEffect(() => {
    const token = localStorage.getItem('IdToken');
    fetch(streamM3uUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.text())
      .then(text => {
        const lines = text.split('\n');
        const channels: Channel[] = [];
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.startsWith('#EXTINF:')) {
            const info = line;
            // タイトルは最後のカンマ以降
            const commaIndex = info.lastIndexOf(',');
            const title = info.substring(commaIndex + 1).trim();

            // group-title と tvg-logo を正規表現で抽出
            let group = '';
            let logo = '';
            const groupMatch = info.match(/group-title="([^"]+)"/);
            if (groupMatch) {
              group = groupMatch[1];
            }
            const logoMatch = info.match(/tvg-logo="([^"]+)"/);
            if (logoMatch) {
              logo = logoMatch[1];
            }

            // 次の行がURL
            const url = lines[i + 1]?.trim();
            if (url) {
              channels.push({ title, url, logo, group });
            }
          }
        }
        // "Information" グループのチャンネルを除外するフィルタ
        const filtered = channels.filter(channel => channel.group !== 'Information');
        setChannels(filtered);
        if (filtered.length > 0) {
          setSelected(filtered[0]);
        }
      })
      .catch(err => console.error('Error fetching m3u:', err));
  }, []);

  // Activate検証が完了していなければ何も表示しない
  if (!isActivated) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* プレイヤー（固定） */}
      <div style={{ padding: '0', flexShrink: 0 }}>
        {selected ? (
          <ReactPlayer 
            url={selected.url} 
            controls 
            playing 
            width="100%" 
            height="auto"
            config={{
              file: {
                attributes: {
                  playsInline: true
                }
              }
            }}
          />
        ) : (
          <p>チャンネルを選択してください</p>
        )}
      </div>
      {/* 番組選択（スクロール可能、スクロールバー非表示） */}
      <div className="no-scroll" style={{ flex: 1, borderTop: '1px solid #ccc', overflowY: 'auto' }}>
        {channels.map((channel, idx) => (
          <div
            key={idx}
            onClick={() => setSelected(channel)}
            style={{
              padding: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: selected?.url === channel.url ? '#eee' : 'transparent'
            }}
          >
            {channel.logo && (
              <img src={channel.logo} alt={channel.title} style={{ width: '50px', marginRight: '10px' }} />
            )}
            <div>
              <div>{channel.title}</div>
              {channel.group && <small>{channel.group}</small>}
            </div>
          </div>
        ))}
      </div>
      <style jsx global>{`
        /* Chrome, Safari, Opera 用 */
        .no-scroll::-webkit-scrollbar {
          display: none;
        }
        /* IE, Edge 用 */
        .no-scroll {
          -ms-overflow-style: none;
        }
        /* Firefox 用 */
        .no-scroll {
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Stream;