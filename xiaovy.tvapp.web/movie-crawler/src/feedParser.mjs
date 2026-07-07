import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
});

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function textValue(value) {
  if (typeof value === 'string') return value;
  if (typeof value?.['#text'] === 'string') return value['#text'];
  if (typeof value?.['@_href'] === 'string') return value['@_href'];
  return '';
}

function atomLink(entry) {
  const links = asArray(entry.link);
  const alternate = links.find((link) => !link['@_rel'] || link['@_rel'] === 'alternate');
  return alternate?.['@_href'] ?? textValue(entry.link);
}

function enclosureUrl(item) {
  const enclosure = Array.isArray(item.enclosure) ? item.enclosure[0] : item.enclosure;
  return enclosure?.['@_url'] ?? null;
}

export function parseFeed(xml, source) {
  const parsed = parser.parse(xml);

  if (parsed.feed?.entry) {
    return asArray(parsed.feed.entry).map((entry) => ({
      guid: textValue(entry.id) || atomLink(entry),
      source,
      title: textValue(entry.title),
      url: atomLink(entry),
      summary: textValue(entry.summary) || textValue(entry.content),
      publishedAt: textValue(entry.published) || textValue(entry.updated),
      tags: asArray(entry.category).map((category) => category['@_term'] ?? textValue(category)).filter(Boolean),
      thumbnailUrl: entry.thumbnail?.['@_url'] ?? null,
    }));
  }

  const channel = parsed.rss?.channel;
  return asArray(channel?.item).map((item) => ({
    guid: textValue(item.guid) || textValue(item.link),
    source,
    title: textValue(item.title),
    url: textValue(item.link),
    summary: textValue(item.description) || textValue(item['content:encoded']),
    publishedAt: new Date(textValue(item.pubDate) || Date.now()).toISOString(),
    tags: asArray(item.category).map(textValue).filter(Boolean),
    thumbnailUrl: enclosureUrl(item),
  }));
}
