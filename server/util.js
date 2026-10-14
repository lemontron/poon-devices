import { Meteor } from 'meteor/meteor';
import { createPublicKey, verify } from 'crypto';

export const getIpFromConnection = connection => {
	const headers = connection.httpHeaders;
	const rawIp = headers['cf-connecting-ip'] || headers['x-forwarded-for'] || connection.clientAdress;
	if (rawIp) return rawIp.split(',')[0];
};

export const verifyMessage = (publicKey, message, signature) => {
	const ok = verify('sha256', Buffer.from(message),
		{'key': createPublicKey({'key': publicKey, 'format': 'jwk'}), 'dsaEncoding': 'ieee-p1363'},
		Buffer.from(signature, 'base64'),
	);
	if (!ok) throw new Meteor.Error('peer', 'Invalid signature');
};
