import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Tracker } from 'meteor/tracker';
import { useTracker } from 'meteor/react-meteor-data';
import { isStandalone } from 'meteor/poon';
import { deviceQuietFields, Devices } from './db';

export const deviceId = (() => {
	if (navigator.userAgent.includes('Codex')) return 'codex';
	return localStorage.deviceId || (localStorage.deviceId = Random.id());
})();

const sub = Meteor.subscribe('Device', {
	'deviceId': deviceId,
	'screenSize': {'width': screen.width, 'height': screen.height},
	'locationUrl': location.href,
	isStandalone,
}, () => {
	setInterval(async () => {
		await fetch(`/api/heartbeat/${deviceId}`);
	}, 10000);
});

// promise for startup services
export const deviceReady = new Promise(resolve => {
	const computation = Tracker.autorun(() => {
		const device = Devices.findOne(deviceId);
		if (!sub.ready() || !device) return;

		computation.stop();
		resolve(device);
	});
});

export const useDevice = () => useTracker(() => {
	return Devices.findOne(deviceId, {
		fields: deviceQuietFields,
	});
}, [deviceId]);

export { Devices };