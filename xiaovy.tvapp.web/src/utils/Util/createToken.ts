import { SignJWT } from "jose";

export async function createToken(userId: string, email: string, uuid: string) {
    const jwt_secret_key = process.env.JWT_SECRET_KEY;
    if (!jwt_secret_key) {
        throw new Error('JWT_SECRET_KEY is not defined');
    }
    const jwt_expirationTime = process.env.JWT_EXPIRATION_TIME;
    if (!jwt_expirationTime) {
        throw new Error('JWT_EXPIRATION_TIME is not defined');
    }
    const SECRET_KEY = new TextEncoder().encode(jwt_secret_key);

    return new SignJWT({ id:userId, email, uuid })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(jwt_expirationTime)
        .sign(SECRET_KEY);
}