import { jwtVerify, JWTPayload } from "jose";

interface DecodedJwtPayload extends JWTPayload {
  id: string;
  email: string;
  uuid: string;
}

export async function verifyToken(token: string): Promise<DecodedJwtPayload | null> {
    const jwt_secret_key = process.env.JWT_SECRET_KEY;
    if (!jwt_secret_key) {
        throw new Error('JWT_SECRET_KEY is not defined');
    }
    const SECRET_KEY = new TextEncoder().encode(jwt_secret_key);

    try {
        const { payload } = await jwtVerify(token, SECRET_KEY) as { payload: DecodedJwtPayload };
        // トークンが有効であれば、デコードされたペイロードを返す
        return payload;
    } catch (error) {
        // トークンの検証に失敗した場合はnullを返す
        console.error("トークンの検証に失敗しました", error);
        return null;
    }
}