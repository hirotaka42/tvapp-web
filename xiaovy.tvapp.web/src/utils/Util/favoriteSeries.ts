import { seriesInfo } from '@/types/utils/favoriteSeries';

export const createFavoriteSeries = (seriesTitle: string, seriesId: string) => {
    // localstrigeに FavoriteSeries情報を保存
    const addInfo:seriesInfo = {
        seriesTitle,
        seriesId,
    };

    // FavoriteSeries のKeyでlocalStorageに保存されているか確認
    const key = "FavoriteSeries";
    if (key) {
        // 保存されている場合は、localStorageから取得し、新しいFavoriteSeriesを追加
        const existingData = localStorage.getItem(key);
        if (existingData) {
            const parsedData = JSON.parse(existingData);
            const newData = [...parsedData, addInfo];
            localStorage.setItem(key, JSON.stringify(newData));
        }
    } else {
        // 保存されていない場合は、新しいFavoriteSeriesを作成し、localStorageに保存
        localStorage.setItem(key, JSON.stringify([addInfo]));
    }
};


export const readFavoriteSeries = () => {
    // localStorageからFavoriteSeriesを取得
    const key = "FavoriteSeries";
    if (key) {
        const data = localStorage.getItem(key);
        if (data) {
            return JSON.parse(data);
        }
    }
    return [];
};


export const updateFavoriteSeries = (seriesTitle: string, seriesId: string) => {
    // シリーズタイトルにマッチするシリーズIDを更新
    const key = "FavoriteSeries";
    if (key) {
        const existingData = localStorage.getItem(key);
        if (existingData) {
            const parsedData: { seriesTitle: string; seriesId: string }[] = JSON.parse(existingData);
            const newData = parsedData.map((item) => {
                if (item.seriesTitle === seriesTitle) {
                    return {
                        seriesTitle,
                        seriesId,
                    };
                }
                return item;
            });
            localStorage.setItem(key, JSON.stringify(newData));
        }
    }
};

export const deleteFavoriteSeries = (deleteIndex: number) => {
    // シリーズIDではなく、配列の場所を引数で受け取り該当するアイテムを削除
    const key = "FavoriteSeries";
    if (key) {
        const existingData = localStorage.getItem(key);
        if (existingData) {
            const parsedData: { seriesTitle: string; seriesId: string }[] = JSON.parse(existingData);
            const newData = parsedData.filter((_, index: number) => index !== deleteIndex);
            localStorage.setItem(key, JSON.stringify(newData));
        }
    }
};