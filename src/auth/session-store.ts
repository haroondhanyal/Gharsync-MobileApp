import * as SecureStore from "expo-secure-store";
export type TokenPair = { accessToken: string; refreshToken: string };
const ACCESS = "gharsync.access.v1"; const REFRESH = "gharsync.refresh.v1";
export async function readTokens(): Promise<TokenPair | null> { const [accessToken, refreshToken] = await Promise.all([SecureStore.getItemAsync(ACCESS), SecureStore.getItemAsync(REFRESH)]); return accessToken && refreshToken ? { accessToken, refreshToken } : null; }
export async function saveTokens(tokens: TokenPair) { await Promise.all([SecureStore.setItemAsync(ACCESS, tokens.accessToken), SecureStore.setItemAsync(REFRESH, tokens.refreshToken)]); }
export async function clearTokens() { await Promise.all([SecureStore.deleteItemAsync(ACCESS), SecureStore.deleteItemAsync(REFRESH)]); }
