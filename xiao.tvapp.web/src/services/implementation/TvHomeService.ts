import axios from 'axios';

export class TvHomeService {
  static async callHome(platformUid: string, platformToken: string) {
    const host = process.env.NEXT_PUBLIC_IP;
    const response = await axios.get(`http://${host}:5231/api/TVapp/service/callHome`, {
      params: {
        platformUid: platformUid,
        platformToken: platformToken
      },
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