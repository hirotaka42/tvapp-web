import axios from 'axios';

export class StreamingService {
  static async getVideoUrl(episodeId: string) {
    const host = process.env.BFF_SERVER || '192.168.10.11';
    const url = `http://${host}:5231/api/TVapp/streaming/${episodeId}`;
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