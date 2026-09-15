import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';
import { deviceQuietFields, Devices } from '../db';
import { generateDefaultDeviceName } from './device-name';
import { getIpFromConnection } from './util';
import { bumpHeartbeat } from './heartbeat';

Meteor.publish('Device', async function(d) {
	check(d, {deviceId: String, screenSize: Object, locationUrl: String, isStandalone: Boolean});

	if (d.deviceId === 'codex' && !Meteor.isDevelopment) {
		throw new Meteor.Error('development', 'Codex device only allowed in development mode');
	}
	this.connection.deviceId = d.deviceId;

	const date = new Date();
	await Devices.upsertAsync({'_id': d.deviceId}, {
		$set: {
			'userId': this.userId,
			'updatedOn': date,
			'activeOn': date,
			'isDevelopment': Meteor.isDevelopment,
			'userAgent': this.connection.httpHeaders['user-agent'],
			'screenSize': d.screenSize,
			'locationUrl': d.locationUrl,
			'ip': getIpFromConnection(this.connection),
			'isStandalone': d.isStandalone,
			'isOnline': true,
		},
		$setOnInsert: {
			'addedOn': date,
			'code': Random.id(6).toUpperCase(),
			'name': generateDefaultDeviceName(d),
		},
	});
	await bumpHeartbeat(d.deviceId, true);

	return Devices.find(d.deviceId, {fields: deviceQuietFields});
});
