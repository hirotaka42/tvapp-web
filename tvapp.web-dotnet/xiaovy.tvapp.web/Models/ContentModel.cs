using System;
namespace xiaovy.tvapp.web.Models
{
	public interface ContentModel
	{
        public class Episode
        {
            public string Id { get; set; }
            public int Version { get; set; }
            public string Title { get; set; }
            public string SeriesID { get; set; }
            public long EndAt { get; set; }
            public string BroadcastDateLabel { get; set; }
            public bool IsNHKContent { get; set; }
            public bool IsSubtitle { get; set; }
            public int RibbonID { get; set; }
            public string SeriesTitle { get; set; }
            public bool IsAvailable { get; set; }
            public string BroadcasterName { get; set; }
            public string ProductionProviderName { get; set; }
        }

        public class ContentItem
        {
            public string Type { get; set; }
            public Episode Content { get; set; }
            public int Rank { get; set; }
        }
    }
}

