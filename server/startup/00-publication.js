import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';
import { generateDefaultDeviceName } from '../util-device-name';
import { getIpFromConnection, verifyMessage } from '../util';
import { bumpHeartbeat } from './02-heartbeat';
import { publishScreenViewers } from '../screen-sharing';

Meteor.publish('Device', async function(d) {
	check(d, {
		deviceId: String,
		publicKey: Object,
		screenSize: Object,
		locationUrl: String,
		isStandalone: Boolean,
		signature: String,
	});

	if (d.deviceId === 'codex' && !Meteor.isDevelopment) throw new Meteor.Error('device', 'Device not authorized');

	const date = new Date();
	const Devices = Mongo.getCollection('Devices');

	// Authenticate if device is already registered
	const existing = await Devices.findOneAsync({'_id': d.deviceId});
	if (existing?.publicKey) verifyMessage(existing.publicKey, this.connection.id, d.signature);

	this.connection.deviceId = d.deviceId;
	await Devices.upsertAsync({'_id': d.deviceId}, {
		$set: {
			'userId': this.userId || undefined,
			'updatedOn': date,
			'activeOn': date,
			'isDevelopment': Meteor.isDevelopment,
			'userAgent': this.connection.httpHeaders['user-agent'],
			'screenSize': d.screenSize,
			'locationUrl': d.locationUrl,
			'ip': getIpFromConnection(this.connection),
			'isStandalone': d.isStandalone,
			'isOnline': true,
			'publicKey': existing?.publicKey ? undefined : d.publicKey, // The ONLY legacy code in the repo
		},
		$setOnInsert: {
			'addedOn': date,
			'code': Random.id(5).toUpperCase(),
			'name': generateDefaultDeviceName(d),
		},
	});

	await bumpHeartbeat(d.deviceId, true);
	publishScreenViewers(this, d.deviceId);

	return Devices.find(d.deviceId);
});
