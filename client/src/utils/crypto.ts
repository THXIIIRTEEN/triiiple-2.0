export async function generateKeyPair(): Promise<{privateKey: CryptoKey, publicKey: CryptoKey}> {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048, 
        publicExponent: new Uint8Array([1, 0, 1]), 
        hash: "SHA-256",
      },
      true, 
      ["encrypt", "decrypt"] 
    );
    const privateKey = keyPair.privateKey;
    const publicKey = keyPair.publicKey;
  
    return { privateKey, publicKey };
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
    const binary = String.fromCharCode(...new Uint8Array(buffer));
    return window.btoa(binary);
}
  
export async function exportPublicKey(publicKey: CryptoKey) {
    const exportedKey = await window.crypto.subtle.exportKey("spki", publicKey);
    const publicKeyBase64 = arrayBufferToBase64(exportedKey);
    return publicKeyBase64 as string;
}
  
