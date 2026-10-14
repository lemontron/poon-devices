import { storage } from 'meteor/poon';

const alg = {'name': 'ECDSA', 'namedCurve': 'P-256'};
let signer;

const cryptoReady = (async () => {
	if (!storage.privateKey) { // initialize keys
		const keys = await crypto.subtle.generateKey(alg, true, ['sign', 'verify']);
		storage.privateKey = await crypto.subtle.exportKey('jwk', keys.privateKey);
		storage.publicKey = await crypto.subtle.exportKey('jwk', keys.publicKey);
	}
	signer = await crypto.subtle.importKey('jwk', storage.privateKey, alg, false, ['sign']);
})();

export const getPublicKeyAsync = async () => {
	await cryptoReady;
	return storage.publicKey;
};

export const signAsync = async message => {
	await cryptoReady;
	const payload = new TextEncoder().encode(message);
	const signature = await crypto.subtle.sign({'name': 'ECDSA', 'hash': 'SHA-256'}, signer, payload);
	return btoa(String.fromCharCode(...new Uint8Array(signature)));
};
