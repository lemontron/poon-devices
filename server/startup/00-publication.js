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

		const Devices = Mongo.getCollection('Devices');

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

		const existing = await Devices.findOneAsync(d.deviceId);
		if (existing && existing.hashedResumeToken) { // Authenticate Resume Token
			if (existing.hashedResumeToken !== hashToken(d.resumeToken)) {
				throw new Meteor.Error('device', 'Invalid resume token');
			}
			await Devices.updateAsync(existing._id, {$set: doc});
		} else if (existing) { // Migration
			await Devices.updateAsync(existing._id, {
				$set: {...doc, 'hashedResumeToken': hashToken(d.resumeToken)},
			});
		} else {
			await Devices.insertAsync({
				'_id': d.deviceId,
				...doc,
				'userId': this.userId || undefined,
				'hashedResumeToken': hashToken(d.resumeToken),
				'addedOn': date,
				'code': Random.id(5).toUpperCase(),
				'name': generateDefaultDeviceName(doc),
			});
		}
		this.connection.setDeviceId(d.deviceId);
	},
});
