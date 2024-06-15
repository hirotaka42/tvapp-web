import axios from 'axios';

export class StreamingService {
  static async getVideoUrl(episodeId: string) {
    const host = process.env.NEXT_PUBLIC_IP;
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