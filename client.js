import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Tracker } from 'meteor/tracker';
import { useTracker } from 'meteor/react-meteor-data';
import { isPwa } from 'meteor/poon';
import { deviceQuietFields, Devices } from './db';
import { createCachedDeviceQuery } from './device-cache';
import { getPublicKeyAsync } from './device-keys';

export const deviceId = (() => {
	if (Meteor.isDevelopment && '__codexWebMcpModelContext' in window) return 'codex';
	return localStorage.deviceId || (localStorage.deviceId = Random.id());
})();

const findDevice = createCachedDeviceQuery(deviceId);

Meteor.startup(async () => {
	Meteor.subscribe('Device', {
		deviceId,
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
export { signAsync } from './device-keys';
