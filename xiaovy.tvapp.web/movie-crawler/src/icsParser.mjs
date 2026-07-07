function unfoldLines(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n[ \t]/g, '')
    .split('\n');
}

function splitProperty(line) {
  const colonIndex = line.indexOf(':');
  if (colonIndex === -1) return null;
  const namePart = line.slice(0, colonIndex);
  const rawValue = line.slice(colonIndex + 1);
  const [name] = namePart.split(';');
  return {
    name: name.toUpperCase(),
    value: decodeIcalText(rawValue),
  };
}

function decodeIcalText(value) {
  return value
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .trim();
}

function dateFromDtstart(value) {
  const match = value.match(/^(\d{4})(\d{2})(\d{2})/);
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]}`;
}

function sourceKeyFromUid(uid) {
  if (!uid) return null;
  const idMatch = uid.match(/(\d{4,})/);
  return idMatch ? `eiga.com_${idMatch[1]}` : uid.trim();
}

function sourceUrlFromDescription(description) {
  const match = description.match(/https?:\/\/\S+/g);
  return match?.at(-1)?.replace(/[)\]。、,]+$/, '') ?? null;
}

export function parseComingIcs(text) {
  const lines = unfoldLines(text);
  const events = [];
  let current = null;

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      current = {};
      continue;
    }
    if (line === 'END:VEVENT') {
      if (current?.SUMMARY) {
        events.push({
          title: current.SUMMARY,
          releaseDate: dateFromDtstart(current.DTSTART ?? ''),
          datePrecision: 'day',
          source: 'eiga_com',
          sourceKey: sourceKeyFromUid(current.UID ?? ''),
          sourceUrl: sourceUrlFromDescription(current.DESCRIPTION ?? ''),
          isStreamingOnly: /配信/.test(current.DESCRIPTION ?? ''),
        });
      }
      current = null;
      continue;
    }
    if (!current) continue;
    const prop = splitProperty(line);
    if (prop) current[prop.name] = prop.value;
  }

  return events;
}
