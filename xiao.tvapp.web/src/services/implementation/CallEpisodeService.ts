import axios from 'axios';

export class CallEpisodeService {
  static async callEpisode(episodeId: string) {
    const host = process.env.BFF_SERVER || 'localhost';
    const url = `http://${host}:5231/api/TVapp/content/episode/${episodeId}`;
    const response = await axios.get(url, {
      headers: {
        'accept': '*/*'
      }
    });

    if (!response) {
      throw new Error('Network response was not ok');
    }
    console.log(response.data);
    return response.data;
  }
}