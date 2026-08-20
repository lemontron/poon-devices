import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';
import { api } from 'meteor/poon-api';
import { Devices } from '../db';
import { generateDefaultDeviceName } from './device-name';
import { getIpFromConnection } from './util';

const adminId = 'iyHkiGLXEwhGmfEMn';
const bumpDate = () => new Date(Date.now() + 10000);

// Server job to "offline" every expired heartbeat
Meteor.setInterval(async () => {
	await Devices.updateAsync({
		'isOnline': true, // Currently online
		'heartbeatExpiresOn': {$exists: true, $lt: new Date()},
	}, {
		$set: {'isOnline': false},
	}, {multi: true});
}, 15000);

api.get('/heartbeat/:device', async (req, res) => {
	await Devices.updateAsync({'_id': req.params.device}, {
		$set: {'heartbeatExpiresOn': bumpDate(), 'isOnline': true},
	});
	res.end();
});

Meteor.publish('Device', async function(d) {
	check(d, {deviceId: String, screenSize: Object, locationUrl: String, isStandalone: Boolean});

	if (d.deviceId === 'codex') {
		if (Meteor.isDevelopment) {
			console.log('Codex device connected');
			await this.connection.setUserId(adminId);
			// await callClientAsync({'methodName': 'Impersonate', 'data': adminId}, connection);
		} else {
			throw new Meteor.Error('development', 'Codex device only allowed in development mode');
		}
	}

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
			'heartbeatExpiresOn': bumpDate(),
		},
		$setOnInsert: {
			'addedOn': date,
			'code': Random.id(6).toUpperCase(),
			'name': generateDefaultDeviceName(d),
		},
	});

	return Devices.find({'_id': d.deviceId});
});