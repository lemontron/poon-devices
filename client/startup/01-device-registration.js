import { Meteor } from 'meteor/meteor';
import { DDP } from 'meteor/ddp-client';
import { isPwa, toast, memoize } from 'meteor/poon';
import { getPublicKeyAsync, signAsync } from '../crypto';
import { deviceId } from '../device';

let deviceSubscription;

const startHeartbeat = memoize(() => {
	setInterval(async () => {
		try {
			await fetch(`/api/heartbeat/${deviceId}`);
		} catch (err) {}
	}, 10000);
});

DDP.onReconnect(connection => {
	if (connection !== Meteor.connection) return;
	if (deviceSubscription) deviceSubscription.stop();
	deviceSubscription = undefined;
});

Meteor.connection.options.onConnected = async () => {
	deviceSubscription = Meteor.subscribe('Device', {
		'deviceId': deviceId,
		'publicKey': await getPublicKeyAsync(),
		'screenSize': {'width': screen.width, 'height': screen.height},
		'locationUrl': location.href,
		'isStandalone': isPwa,
		'signature': await signAsync(Meteor.connection._lastSessionId),
	}, {
		'onReady': startHeartbeat,
		'onStop': err => {
			if (err) return toast(err.reason);
		},
	});
};