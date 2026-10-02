import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Tracker } from 'meteor/tracker';
import { useTracker } from 'meteor/react-meteor-data';
import { isPwa, storage } from 'meteor/poon';
import { Devices } from './db';
import { getPublicKeyAsync } from './device-keys';

export const deviceId = (() => {
	if (Meteor.isDevelopment && '__codexWebMcpModelContext' in window) return 'codex';
	return localStorage.deviceId || (localStorage.deviceId = Random.id());
})();

const findDevice = (fields) => {
	return Devices.findOne(deviceId, {fields}) || storage.device;
};

export const deviceRegistered = new Promise(resolve => {
	Meteor.startup(async () => {
		Meteor.subscribe('Device', {
			deviceId,
			'publicKey': await getPublicKeyAsync(),
			'screenSize': {'width': screen.width, 'height': screen.height},
			'locationUrl': location.href,
			'isStandalone': isPwa,
		}, () => {
			resolve();
			setInterval(async () => {
				try {
					await fetch(`/api/heartbeat/${deviceId}`);
				} catch (err) {}
			}, 10000);
		});
	});
});

let displayScaling = 1;
Tracker.autorun(() => {
	const device = findDevice({displayScaling: 1});
	if (device.displayScaling && device.displayScaling !== displayScaling) {
		const width = Math.round(screen.width / device.displayScaling);
		const viewport = document.querySelector('meta[name="viewport"]');
		viewport.content = `width=${width}, initial-scale=${device.displayScaling}, maximum-scale=${device.displayScaling}, user-scalable=no, viewport-fit=cover`;
		displayScaling = device.displayScaling;
	}
});

Tracker.autorun(() => {
	const device = findDevice({displayTheme: 1});
	if (device) {
		document.documentElement.classList.toggle('theme-light', device.displayTheme === 'light');
		document.documentElement.classList.toggle('theme-dark', device.displayTheme === 'dark');
	}
});

export const deviceReady = new Promise(resolve => {
	if (storage.device) return resolve(storage.device);

	Tracker.autorun(computation => {
		const device = Devices.findOne(deviceId);
		if (device) {
			computation.stop();
			resolve(device);
		}
	});
});

export const useDevice = () => useTracker(() => {
	return findDevice();
}, []);

export { Devices };
export { signAsync } from './device-keys';
