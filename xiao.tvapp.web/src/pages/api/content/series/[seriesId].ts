// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

type Data = {
  data?: any;
  error?: string;
}

// api/content/series/[seriesId]
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { seriesId } = req.query;

  if (!seriesId || typeof seriesId !== 'string') {
    return res.status(400).json({ error: 'seriesId は必須です。' });
  }

  try {
    const response = await axios.get(`https://statics.tver.jp/content/series/${seriesId}.json`, {
      headers: {
        'x-tver-platform-type': 'web',
        'Origin': 'https://tver.jp',
        'Referer': 'https://tver.jp/',
      }
    });

    if (response.status !== 200) {
      return res.status(response.status).json({ error: 'Failed to retrieve content results' });
    }

    return res.status(200).json({ data: response.data });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}