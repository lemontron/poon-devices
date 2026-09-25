import { storage } from 'meteor/poon';

const alg = {'name': 'ECDSA', 'namedCurve': 'P-256'};

const keysReady = (async () => {
	if (storage.privateKey && storage.publicKey) return;
	const keys = await crypto.subtle.generateKey(alg, true, ['sign', 'verify']);
	storage.privateKey = await crypto.subtle.exportKey('jwk', keys.privateKey);
	storage.publicKey = await crypto.subtle.exportKey('jwk', keys.publicKey);
})();

export const getPublicKeyAsync = async () => {
	await keysReady;
	return storage.publicKey;
};

export const signAsync = async message => {
	await keysReady;
	const signer = await crypto.subtle.importKey('jwk', storage.privateKey, alg, false, ['sign']);
	const signature = await crypto.subtle.sign({'name': 'ECDSA', 'hash': 'SHA-256'}, signer, new TextEncoder().encode(message));
	return btoa(String.fromCharCode(...new Uint8Array(signature)));
};
