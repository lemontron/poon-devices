import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { useTracker } from 'meteor/react-meteor-data';
import { isStandalone } from 'meteor/poon';
import { Devices } from '../db';

export const deviceId = (() => {
	if (navigator.userAgent.includes('Codex')) return 'codex';
	return localStorage.deviceId || (localStorage.deviceId = Random.id());
})();

Meteor.subscribe('Device', {
	'deviceId': deviceId,
	'screenSize': {'width': screen.width, 'height': screen.height},
	'locationUrl': location.href,
	isStandalone,
}, () => {
	setInterval(async () => {
		await fetch(`/api/heartbeat/${deviceId}`);
	}, 10000);
});

export const useDevice = () => useTracker(() => {
	return Devices.findOne(deviceId, {
		fields: {'heartbeatExpiresOn': 0},
	});
}, [deviceId]);
