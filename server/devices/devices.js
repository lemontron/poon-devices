import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { check, Match } from 'meteor/check';
import { createHash } from 'node:crypto';
import { Devices } from '../../db';
import { generateDefaultDeviceName } from './device-name';

const hashCredential = credential => credential && createHash('sha256').update(credential).digest('hex');

Meteor.methods({
	'Device': async function(d) {
		check(d, {
			deviceId: String,
			screenSize: Object,
			locationUrl: String,
			isStandalone: Boolean,
			nativeCredential: Match.Maybe(String),
		});
		const nativeCredentialHash = hashCredential(d.nativeCredential);
		const existing = await Devices.findOneAsync(d.deviceId);
		if (existing?.nativeCredentialHash && existing.nativeCredentialHash !== nativeCredentialHash) {
			throw new Meteor.Error('device-auth', 'Native device credential does not match');
		}

		if (d.deviceId === 'codex') {
			if (Meteor.isDevelopment) {
				console.log('Codex device connected');
				const admin = await Meteor.users.findOneAsync({'roles': 'admin'});
				await this.setUserId(admin._id);
			} else {
				throw new Meteor.Error('development', 'Codex device only allowed in development mode');
			}
		}

		const date = new Date();
		const name = generateDefaultDeviceName(d);
		await Devices.upsertAsync({'_id': d.deviceId}, {
			$set: {
				'userId': this.userId,
				'updatedOn': date,
				'activeOn': date,
				'isDevelopment': Meteor.isDevelopment,
				'userAgent': this.connection.httpHeaders['user-agent'],
				'screenSize': d.screenSize,
				'locationUrl': d.locationUrl,
				'code': Random.id(4).toUpperCase(),
				'ip': getIpFromConnection(this.connection),
				'isOnline': true,
				nativeCredentialHash,
			},
			$inc: {'totalConnections': 1},
			$setOnInsert: {
				'addedOn': date,
				'purpose': 'client',
				'name': name,
			},
		});

		return {
			'deviceId': d.deviceId,
			'userId': this.userId,
		};
	},
});

const getIpFromConnection = connection => {
	const headers = connection.httpHeaders;
	const rawIp = headers['cf-connecting-ip'] || headers['x-forwarded-for'] || connection.clientAdress;
	if (rawIp) return rawIp.split(',')[0];
};

Meteor.publish('Device', async function(deviceId) {
	check(deviceId, String);

	await Devices.updateAsync({'_id': deviceId}, {
		$set: {'activeOn': new Date(), 'isOnline': true},
	});

	this.onStop(async () => {
		await Devices.updateAsync({'_id': deviceId}, {
			$set: {'activeOn': new Date(), 'isOnline': false},
		});
	});

	return Devices.find({'_id': deviceId});
});
