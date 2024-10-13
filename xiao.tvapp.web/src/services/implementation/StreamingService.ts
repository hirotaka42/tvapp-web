import axios from 'axios';

export class StreamingService {
  static async getVideoUrl(episodeId: string) {
    const url = `../api/callstreaminglink?episodeId=${episodeId}`;
    const response = await axios.get(url);
    //console.log('api/callstreaminglink?episodeId=' + episodeId);
    console.log('response: ' + response);

    if (!response) {
      throw new Error('Network response was not ok');
    }
    console.log(response.data);
    return response.data.video_url;
  }
}