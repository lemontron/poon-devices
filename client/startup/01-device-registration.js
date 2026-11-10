import { Meteor } from 'meteor/meteor';
import { DDP } from 'meteor/ddp-client';
import { Storage, isPwa, toast, memoize } from 'meteor/poon';
import { deviceId } from '../device';

const startHeartbeat = memoize(() => {
	setInterval(async () => {
		try {
			await fetch(`/api/heartbeat/${deviceId}`);
		} catch (err) {}
	}, 10000);
});

DDP.onReconnect(connection => {
	if (connection !== Meteor.connection) return;
	Meteor.call('AuthenticateDevice', {
		'deviceId': deviceId,
		'screenSize': {'width': screen.width, 'height': screen.height},
		'locationUrl': location.href,
		'isStandalone': isPwa,
		'resumeToken': Storage.resumeToken,
	}, (err) => {
		if (err) return toast(err.reason);
		startHeartbeat();
	});
});
