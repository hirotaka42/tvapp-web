
export const removeIdToken = () => {
    const TokenName = process.env.NEXT_PUBLIC_TOKEN_NAME;
    if (!TokenName) {
        console.log(TokenName);
        throw new Error("環境変数:IDTOKEN_NAMEが設定されていません。");
    }
    const existingToken = localStorage.getItem(TokenName);
    if (existingToken) localStorage.removeItem(TokenName);
};