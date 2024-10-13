// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

type ErrorResponse = {
  error: string;
};

// api/callstreaminglink?episodeId=xxx
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string | ErrorResponse>
) {
  const { episodeId } = req.query;
  const function_host = process.env.AZURE_FUNCTION_STREEAMING;
  const key = process.env.AZURE_FUNCTION_STREEAMING_CODE_KEY;

  if (
    typeof episodeId !== 'string' || episodeId.trim() === ''
  ) {
    return res.status(400).json({ error: 'episodeId are required' });
  }

  try {
    const response = await axios.get(
      `${function_host}/api/http_trigger?code=${key}&url=https://tver.jp/episodes/${episodeId}`,
      {
        headers: {
          'x-tver-platform-type': 'web',
          'Origin': 'https://tver.jp',
          'Referer': 'https://tver.jp/',
        },
      }
    );

    if (response.status !== 200) {
      res.status(response.status).json({ error: 'Failed to retrieve callEpisode results' });
    }

    return res.status(200).send(response.data);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}