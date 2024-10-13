import axios from 'axios';

export class CallEpisodeService {
  static async callEpisode(episodeId: string) {
    const host = process.env.NEXT_PUBLIC_IP;
    //const url = `http://${host}:5231/api/TVapp/content/episode/${episodeId}`;
    const url = `../api/content/episode/${episodeId}`;
    const response = await axios.get(url);
    console.log('constent: ' + response);

    if (!response) {
      throw new Error('Network response was not ok');
    }
    console.log(response.data);
    return response.data;
  }
}