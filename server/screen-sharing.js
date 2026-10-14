import { Mongo } from 'meteor/mongo';
import { verifyMessage } from './util';

export const screenRelays = new Map();

export let authorizeViewerAsync;
export const registerScreenViewerAuthorizer = handler => {
	authorizeViewerAsync = handler;
};

export const stopSource = relay => {
	const source = relay.source;
	relay.source = undefined;
	if (source) source.close();
};

export const closeRelay = relay => {
	stopSource(relay);
	for (const viewer of relay.viewers.values()) viewer.close();
};

export const publishScreenViewers = (publication, deviceId) => {
	const previous = screenRelays.get(deviceId);
	if (previous) closeRelay(previous);

	const relay = {publication, 'viewers': new Map()};

	screenRelays.set(deviceId, relay);
	publication.onStop(() => {
		if (screenRelays.get(deviceId) !== relay) return;
		screenRelays.delete(deviceId);
		closeRelay(relay);
	});
};

export const authorizeSourceAsync = async params => {
	if (params.get('role') !== 'source') return true;
	const deviceId = params.get('deviceId');
	const viewerId = params.get('viewerId');
	const relay = screenRelays.get(deviceId);
	if (!relay || !relay.viewers.has(viewerId)) return false;
	const device = await Mongo.getCollection('Devices').findOneAsync(deviceId);
	verifyMessage(device.publicKey, viewerId, params.get('signature'));
	return true;
};
