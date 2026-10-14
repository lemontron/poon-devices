import { websocket } from 'meteor/poon-api';
import { Random } from 'meteor/random';
import { Mongo } from 'meteor/mongo';
import { authorizeSourceAsync, authorizeViewerAsync, closeRelay, screenRelays, stopSource } from '../screen-sharing';

websocket('/api/live/socket', async (peer, params, user) => {
	const role = params.get('role');
	const deviceId = params.get('deviceId');
	const storeId = params.get('storeId');

	const relay = screenRelays.get(deviceId);
	if (!relay) return peer.close();

	if (role !== 'source') {
		if (!user || !authorizeViewerAsync) return peer.close();

		// Get viewer device
		const device = await Mongo.getCollection('Devices').findOneAsync({'_id': deviceId, storeId});
		if (!device) return peer.close();

		await authorizeViewerAsync(user._id, device);

		if (peer.readyState > 1) return;
		if (screenRelays.get(deviceId) !== relay) return peer.close();

		const viewerId = Random.id();
		relay.viewers.set(viewerId, peer);
		peer.send(JSON.stringify({type: 'waiting'}));
		// Restart with a full snapshot for the new viewer.
		stopSource(relay);
		relay.publication.added('ScreenViewers', viewerId, {deviceId, 'userId': user._id});
		peer.onclose = () => {
			relay.viewers.delete(viewerId);
			relay.publication.removed('ScreenViewers', viewerId);
			if (!relay.viewers.size) stopSource(relay);
		};
		return;
	}

	const viewerId = params.get('viewerId');
	if (!relay.viewers.has(viewerId)) return peer.close();

	const previous = relay.source;
	relay.source = peer;
	if (previous) previous.close();

	peer.onmessage = (e) => {
		if (relay.source !== peer) return;
		for (const viewer of relay.viewers.values()) viewer.send(e.data);
	};
	peer.onclose = () => {
		if (relay.source !== peer) return;
		relay.source = undefined;
		// Viewers already reconnect; let them establish a fresh stream.
		closeRelay(relay);
	};
}, {
	authorize: authorizeSourceAsync,
	sameOrigin: true,
	maxLength: 20 * 1024 * 1024,
	ping: 30,
});
