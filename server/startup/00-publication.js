import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';
import { generateDefaultDeviceName } from '../util-device-name';
import { getIpFromConnection, hashToken } from '../util';
import { bumpHeartbeat } from './02-heartbeat';
import { publishScreenViewers } from '../screen-sharing';

const waitForDeviceAsync = (con) => {
	if (con.deviceId) return con.deviceId;
	return new Promise(resolve => {
		con.setDeviceId = deviceId => {
			con.deviceId = deviceId;
			resolve(deviceId);
			bumpHeartbeat(deviceId, true);
		};
	});
};

Meteor.publish(null, async function() {
	const deviceId = await waitForDeviceAsync(this.connection);
	publishScreenViewers(this, deviceId);
	return Mongo.getCollection('Devices').find(deviceId);
});

Meteor.methods({
	'AuthenticateDevice': async function(d) {
		check(d, {
			deviceId: String,
			screenSize: Object,
			locationUrl: String,
			isStandalone: Boolean,
			resumeToken: String,
		});

		if (d.deviceId === 'codex' && !Meteor.isDevelopment) throw new Meteor.Error('device', 'Device not authorized');

		const date = new Date();
		const doc = {
			'updatedOn': date,
			'activeOn': date,
			'isOnline': true,
			'screenSize': d.screenSize,
			'locationUrl': d.locationUrl,
			'isStandalone': d.isStandalone,
			'userAgent': this.connection.httpHeaders['user-agent'],
			'ip': getIpFromConnection(this.connection),
			'isDevelopment': Meteor.isDevelopment,
		};

		await Mongo.getCollection('Devices').upsertAsync({
			'_id': d.deviceId,
			'resumeTokenHash': hashToken(d.resumeToken),
		}, {
			$set: doc,
			$setOnInsert: {
				'userId': this.userId || undefined,
				'addedOn': date,
				'code': Random.id(5).toUpperCase(),
				'name': generateDefaultDeviceName(doc),
			},
		}).catch(err => {
			if (err.code === 11000) throw new Meteor.Error('device', 'Invalid device token');
			throw err;
		});
		this.connection.setDeviceId(d.deviceId);
	},
});
