import { Main as HomeResponseTypes, Component, ComponentContent } from '@/types/HomeResponse';

interface ConvertedContentItem {
  content: {
    id: string;
    title: string;
    seriesID: string;
    endAt: number;
    seriesTitle: string;
    broadcasterName: string;
    productionProviderName: string;
    broadcastDateLabel: string;
    rank: number;
  };
}

interface ContentsByLabel {
  label: string;
  contents: ConvertedContentItem[];
}

// 汎用コンバート関数
export function convertContent(content: ComponentContent): ConvertedContentItem {
  return {
    content: {
      id: content.content.id,
      title: content.content.title || '',
      seriesID: content.content.seriesID || '',
      endAt: content.content.endAt || 0,
      seriesTitle: content.content.seriesTitle || '',
      broadcasterName: content.content.broadcasterName || '',
      productionProviderName: content.content.productionProviderName || '',
      broadcastDateLabel: content.content.broadcastDateLabel || '',
      rank: content.rank || 0,
    }
  };
}

// 特定のラベルのコンテンツリストを取得
export function getContentsByLabel(response: HomeResponseTypes, targetLabel: string): ContentsByLabel {
  if (!response || !response.data || !response.data.result || !response.data.result.components) {
    return { label: '', contents: [] };
  }

  const targetComponent = response.data.result.components.find(
    (component: Component) => component.label === targetLabel
  );

  return targetComponent
    ? {
        label: targetComponent.label,
        contents: targetComponent.contents.map(convertContent),
      }
    : { label: '', contents: [] };
}

// 全てのラベルを取得
export function getAllLabels(response: HomeResponseTypes): string[] {
  if (!response || !response.data || !response.data.result || !response.data.result.components) {
    return [];
  }

  return response.data.result.components.map((component: Component) => component.label);
}

// 各ラベルのコンテンツ数を取得
export function getLabelContentCounts(response: HomeResponseTypes): Record<string, number> {
  if (!response || !response.data || !response.data.result || !response.data.result.components) {
    return {};
  }

  return response.data.result.components.reduce((counts: Record<string, number>, component: Component) => {
    counts[component.label] = component.contents.length;
    return counts;
  }, {});
}

export default {
  getContentsByLabel,
  getAllLabels,
  getLabelContentCounts,
};
