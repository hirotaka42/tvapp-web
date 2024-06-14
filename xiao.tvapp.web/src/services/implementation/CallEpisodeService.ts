import axios from 'axios';

export class CallEpisodeService {
  static async callEpisode(episodeId: string) {
    const url = `http://localhost:5231/api/TVapp/content/episode/${episodeId}`;
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