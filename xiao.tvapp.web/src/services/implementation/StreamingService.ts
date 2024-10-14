import axios from 'axios';

export class StreamingService {
  static async getVideoUrl(episodeId: string) {
    const url = `/api/service/streaming/${episodeId}`;
    const response = await axios.get(url);
    if (!response) {
      throw new Error('Network response was not ok');
    }
    console.log(response.data);
    return response.data.video_url;
  }
}