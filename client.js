import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Tracker } from 'meteor/tracker';
import { useTracker } from 'meteor/react-meteor-data';
import { isStandalone } from 'meteor/poon';
import { deviceQuietFields, Devices } from './db';
import { createCachedDeviceQuery } from './device-cache';

export const deviceId = (() => {
	if (navigator.userAgent.includes('Codex')) return 'codex';
	return localStorage.deviceId || (localStorage.deviceId = Random.id());
})();

const findDevice = createCachedDeviceQuery(deviceId);

Meteor.subscribe('Device', {
	'deviceId': deviceId,
	'screenSize': {'width': screen.width, 'height': screen.height},
	'locationUrl': location.href,
	isStandalone,
}, () => {
	setInterval(async () => {
		try {
			await fetch(`/api/heartbeat/${deviceId}`);
		} catch (err) {}
	}, 10000);
});

// promise for startup services
export const deviceReady = new Promise(resolve => {
	Tracker.autorun(computation => {
		const device = findDevice();
		if (!device) return;

		computation.stop();
		resolve(device);
	});
});

export const useDevice = () => useTracker(() => {
	return findDevice({fields: deviceQuietFields});
}, [deviceId]);

export { Devices, deviceQuietFields };
