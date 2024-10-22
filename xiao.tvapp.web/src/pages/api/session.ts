// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

type SessionToken = {
  platformUid: string;
  platformToken: string;
};

type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SessionToken | ErrorResponse>
) {
  if (req.method === 'POST') {
    try {
      const response = await axios.post(
        'https://platform-api.tver.jp/v2/api/platform_users/browser/create',
        'device_type=pc',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Origin': 'https://s.tver.jp',
            'Referer': 'https://s.tver.jp/',
          },
        }
      );

      if (response.status !== 200) {
        return res.status(response.status).json({ error: 'sessionTokenの取得に失敗しました。' });
      }

      const jsonResponse = response.data;

      const sessionToken: SessionToken = {
        platformUid: jsonResponse.result.platform_uid,
        platformToken: jsonResponse.result.platform_token,
      };

      return res.status(200).json(sessionToken);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}