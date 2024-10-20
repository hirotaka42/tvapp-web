import { Main as EpisodeResponseType } from '@/types/EpisodeResponse';
import { IEpisodeService } from '@/services/IEpisodeService';

export class EpisodeService implements IEpisodeService {
    async callEpisodeInfo(episodeId: string): Promise<EpisodeResponseType> {
        try {
            const url = `/api/content/episode/${episodeId}`;
            const response = await fetch(url, {
                headers: {
                'accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('インターネット接続がありません');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error:", error);
            throw new Error('Internal Server Error');
        }
    }
}

// {
//     "data": {
//       "id": "epf2lcrt80",
//       "version": 9,
//       "video": {
//         "videoRefID": "F802k085z_pwf",
//         "accountID": "6191645753001",
//         "playerID": "0PynxWG1A",
//         "channelID": "cx"
//       },
//       "title": "第1話 大切な宝物を守るために、わたしは悪女になった",
//       "seriesID": "srv8ag2ljl",
//       "seasonID": "sslok8j7nd",
//       "description": "中学生時代の色あせない楽しかった記憶・・・。そんな過去とは裏腹に、神崎美羽（松本若菜）はやりきれない現実を生きていた。外面は良いが、乱暴な言葉をぶつけてくる夫の神崎宏樹（田中圭）と冷えきった夫婦生活を送り、いつの間にか偽物の笑顔を振りまく自分自身に嫌気が差していた。\nそんな中、親友の小森真琴（恒松祐里）とその息子・幸太（岩本樹起）を家に招いていた美羽は、二人を見て、子供ができれば現状を変えられるかもしれないと考える。翌朝、宏樹に恐る恐るそのことを話すが、自然に任せればいいと一刀両断され、いらだちを露（あら）わにされてしまう。\nそんなある日、空高くそびえ立つ給水塔を見て、中学生時代、その給水塔の下で心の底から笑顔でいられた幼なじみとの日々を思い出す。そして思い出をたどりながら、導かれるように昔よく通っていた図書館へ足を踏み入れると、突然声をかけられる。そこには、幼なじみ・冬月稜（深澤辰哉）の姿が。中学生ぶりの再会に驚きながらも、あの頃に戻ったかのように無邪気に会話が弾む二人。\n久々の再会に心躍った二人だったが、美羽は既に結婚していることを伝えると、どこか残念そうな冬月。そして冬月もまた、もう少ししたら仕事でアフリカに行くことを告げる。\n「もうすぐ日本を離れる。その前に神様がくれたプレゼントだね―」\nその冬月の言葉を最後に、もう二度と会えないのだと感じる二人だったが・・・。",
//       "no": 10,
//       "broadcastProviderLabel": "フジテレビ",
//       "productionProviderLabel": "フジテレビ",
//       "broadcastDateLabel": "10月17日(木)放送分",
//       "broadcastProviderID": "cx",
//       "isSubtitle": true,
//       "copyright": "（C）フジテレビ",
//       "viewStatus": {
//         "startAt": 1729174140,
//         "endAt": 1735657140
//       },
//       "isAllowCast": true,
//       "share": {
//         "text": "わたしの宝物\n#TVer",
//         "url": "https://tver.jp/episodes/epf2lcrt80"
//       },
//       "tags": {},
//       "isNHKContent": false,
//       "svod": [
//         {
//           "name": "FOD",
//           "url": "https://fod.fujitv.co.jp/title/202i?waad=qarLII2S&ugad=qarLII2S"
//         }
//       ]
//     }
//   }