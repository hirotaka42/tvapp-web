import { seriesInfo } from '@/types/utils/favoriteSeries';

export const createFavoriteSeries = (seriesTitle: string, seriesId: string) => {
    // localstrigeに FavoriteSeries情報を保存
    const key = "FavoriteSeries";
    const addInfo:seriesInfo = {
        seriesTitle,
        seriesId,
    };

    // FavoriteSeries のKeyでlocalStorageに保存されているか確認
    // 保存されている場合は、localStorageから取得し、新しいFavoriteSeriesを追加
    const existingData = localStorage.getItem(key);
    if (existingData) {
        const parsedData = JSON.parse(existingData);
        const newData = [...parsedData, addInfo];
        localStorage.setItem(key, JSON.stringify(newData));
    }else {
        // 保存されていない場合は、新しいFavoriteSeriesを作成し、localStorageに保存
        localStorage.setItem(key, JSON.stringify([addInfo]));
    }
};


export const readFavoriteSeries = () => {
    // localStorageからFavoriteSeriesを取得
    const key = "FavoriteSeries";
    const data = localStorage.getItem(key);
    if (data) {
        return JSON.parse(data);
    }
    return [];
};


export const updateFavoriteSeries = (seriesTitle: string, seriesId: string) => {
    const key = "FavoriteSeries";
    const existingData = localStorage.getItem(key);
    if (existingData) {
        let found = false;
        const parsedData: seriesInfo[] = JSON.parse(existingData);
        const newData = parsedData.map(item => {
            if (item.seriesTitle === seriesTitle) {
                found = true;
                return { seriesTitle, seriesId };
            }
            return item;
        });

        // シリーズが見つからない場合は、新しい情報を追加
        if (!found) newData.push({ seriesTitle, seriesId });

        localStorage.setItem(key, JSON.stringify(newData));
    } else {
        // 保存されていない場合は、新しいFavoriteSeriesを作成し、localStorageに保存
        createFavoriteSeries(seriesTitle, seriesId);
    }
};

export const deleteFavoriteSeriesByIndex = (deleteIndex: number) => {
    // シリーズIDではなく、配列の場所を引数で受け取り該当するアイテムを削除
    const key = "FavoriteSeries";
    const existingData = localStorage.getItem(key);
    if (existingData) {
        const parsedData: { seriesTitle: string; seriesId: string }[] = JSON.parse(existingData);
        const newData = parsedData.filter((_, index: number) => index !== deleteIndex);
        localStorage.setItem(key, JSON.stringify(newData));
    }
};

export const deleteFavoriteSeriesBySeriesId = (seriesIdToDelete: string) => {
    // シリーズIDで該当するアイテムを削除
    const key = "FavoriteSeries";
    const existingData = localStorage.getItem(key);
    if (existingData) {
        const parsedData: { seriesTitle: string; seriesId: string }[] = JSON.parse(existingData);
        const newData = parsedData.filter(item => item.seriesId !== seriesIdToDelete);
        localStorage.setItem(key, JSON.stringify(newData));
    }
};

export const isFavoriteSeriesExists = (seriesIdToCheck: string): boolean => {
    const key = "FavoriteSeries";
    const existingData = localStorage.getItem(key);
    if (existingData) {
        const parsedData: { seriesTitle: string; seriesId: string }[] = JSON.parse(existingData);
        return parsedData.some(item => item.seriesId === seriesIdToCheck);
    }
    return false;
};