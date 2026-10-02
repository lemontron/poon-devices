import './devices';
import { createPublicKey, verify } from 'crypto';

export { Devices } from '../db';

// Server verify message is authentic
export const verifyMessage = (publicKey, message, signature) => {
	const ok = verify('sha256',
		Buffer.from(message),
		{'key': createPublicKey({'key': publicKey, 'format': 'jwk'}), 'dsaEncoding': 'ieee-p1363'},
		Buffer.from(signature, 'base64'),
	);
	if (!ok) throw new Meteor.Error('peer', 'Invalid signature');
};
