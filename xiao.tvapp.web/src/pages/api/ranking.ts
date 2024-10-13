// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

type ErrorResponse = {
  error: string;
};

// api/ranking?genre=anime
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string | ErrorResponse>
) {
  const { genre } = req.query;

  if (typeof genre !== 'string' || genre.trim() === '') {
    return res.status(400).json({ error: 'Genre が必須です。' });
  }

  try {
    const response = await axios.get(
      `https://service-api.tver.jp/api/v1/callEpisodeRankingDetail/${genre}`,
      {
        headers: {
          'x-tver-platform-type': 'web',
          'Origin': 'https://tver.jp',
          'Referer': 'https://tver.jp/',
        },
      }
    );

    if (response.status !== 200) {
      return res.status(response.status).json({ error: 'Failed to retrieve ranking details' });
    }

    return res.status(200).send(response.data);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}