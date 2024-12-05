export function generateRandomString(length: number): string {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    const randomString = Array.from(array, byte => ('0' + byte.toString(16)).slice(-2)).join('');
    sessionStorage.setItem('code_verifier', randomString);
    return randomString;
}

export async function sha256(plain: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return await window.crypto.subtle.digest('SHA-256', data);
}

export function base64UrlEncode(arrayBuffer: ArrayBuffer): string {
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    bytes.forEach(byte => binary += String.fromCharCode(byte));
    return btoa(binary)
        .replace(/\+/g, '-')  // URL-safe base64
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}