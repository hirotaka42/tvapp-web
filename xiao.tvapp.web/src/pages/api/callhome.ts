// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

type ErrorResponse = {
  error: string;
};

// api/callhome?platformUid=xxx&platformToken=xxx
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string | ErrorResponse>
) {
  const { platformUid, platformToken } = req.query;

  if (
    typeof platformUid !== 'string' || platformUid.trim() === '' ||
    typeof platformToken !== 'string' || platformToken.trim() === ''
  ) {
    return res.status(400).json({ error: 'platformUid, platformToken が必須です。' });
  }

  try {
    const response = await axios.get(
      `https://platform-api.tver.jp/service/api/v1/callHome?platform_uid=${platformUid}&platform_token=${platformToken}`,
      {
        headers: {
          'x-tver-platform-type': 'web',
          'Origin': 'https://tver.jp',
          'Referer': 'https://tver.jp/',
        },
      }
    );

    if (response.status !== 200) {
      return res.status(response.status).json({ error: 'Failed to retrieve call results' });
    }

    return res.status(200).send(response.data);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}