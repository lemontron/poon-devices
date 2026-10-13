import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Tracker } from 'meteor/tracker';
import { useTracker } from 'meteor/react-meteor-data';
import { isPwa, storage } from 'meteor/poon';
import { getPublicKeyAsync } from './device-keys';
import { Mongo } from 'meteor/mongo';

export const deviceId = (() => {
	if (Meteor.isDevelopment && '__codexWebMcpModelContext' in window) return 'codex';
	return localStorage.deviceId || (localStorage.deviceId = Random.id());
})();

Meteor.startup(async () => { // hack
	Meteor.subscribe('Device', {
		'deviceId': deviceId,
		'publicKey': await getPublicKeyAsync(),
		'screenSize': {'width': screen.width, 'height': screen.height},
		'locationUrl': location.href,
		'isStandalone': isPwa,
	}, () => {
		setInterval(async () => {
			try {
				await fetch(`/api/heartbeat/${deviceId}`);
			} catch (err) {}
		}, 10000);
	});
});

export const deviceReady = new Promise(resolve => {
	Meteor.startup(() => { // hack
		Tracker.autorun(handle => {
			const device = Mongo.getCollection('Devices').findOne(deviceId);
			if (device) {
				handle.stop();
				resolve(device);
			}
		});
	});
});

export const useDevice = () => useTracker(() => {
	return Mongo.getCollection('Devices').findOne(deviceId) || storage.device;
}, []);

export { signAsync } from './device-keys';
