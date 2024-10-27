using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using xiaovy.tvapp.web.Models;

namespace xiaovy.tvapp.web.Controllers
{
    public class HelloController : Controller
    {
        public IActionResult Index()
        {
            ViewData["Message"] = "サンプルメッセージ";

            string jsonData = @"{
                'contents': [
                    {
                        'type': 'episode',
                        'content': {
                            'id': 'epjnuys5x5',
                            'version': 16,
                            'title': '　',
                            'seriesID': 'srkq2shp9d',
                            'endAt': 1729989000,
                            'broadcastDateLabel': '10月20日(日)放送分',
                            'isNHKContent': false,
                            'isSubtitle': false,
                            'ribbonID': 0,
                            'seriesTitle': 'ONE PIECE FAN LETTER',
                            'isAvailable': true,
                            'broadcasterName': 'フジテレビ',
                            'productionProviderName': 'フジテレビ'
                        },
                        'rank': 1
                    },
                    {
                        'type': 'episode',
                        'content': {
                            'id': 'ep7aijfhey',
                            'version': 6,
                            'title': '第2話 グロリオ',
                            'seriesID': 'srg9lxbziz',
                            'endAt': 1730129340,
                            'broadcastDateLabel': '10月18日(金)放送分',
                            'isNHKContent': false,
                            'isSubtitle': false,
                            'ribbonID': 0,
                            'seriesTitle': 'ドラゴンボールDAIMA',
                            'isAvailable': true,
                            'broadcasterName': 'フジテレビ',
                            'productionProviderName': 'フジテレビ'
                        },
                        'rank': 2
                    },
                    {
                        'type': 'episode',
                        'content': {
                            'id': 'epvvuaba94',
                            'version': 9,
                            'title': '#1139「意地悪な弟に困る姉」',
                            'seriesID': 'srtxft431v',
                            'endAt': 1729933140,
                            'broadcastDateLabel': '10月19日(土)放送分',
                            'isNHKContent': false,
                            'isSubtitle': true,
                            'ribbonID': 0,
                            'seriesTitle': '名探偵コナン',
                            'isAvailable': true,
                            'broadcasterName': '読売テレビ',
                            'productionProviderName': '読売テレビ'
                        },
                        'rank': 3
                    }
                ]
            }";

            var contentItems = JsonConvert.DeserializeObject<Dictionary<string, List<ContentModel.ContentItem>>>(jsonData);
            ViewData["Ranking"] = contentItems["contents"];
            return View();
        }
    }
}