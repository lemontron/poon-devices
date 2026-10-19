import { Meteor } from 'meteor/meteor';
import { api } from 'meteor/poon-api';

const timers = {};

Meteor.startup(async () => {
	const onlineDevices = await Mongo.getCollection('Devices').find({
		'isOnline': true,
		'isDevelopment': Meteor.isDevelopment,
		'publicKey': {$exists: true},
	}, {fields: {_id: 1}}).fetchAsync();
	// console.log('init', onlineDevices.map(device => device._id));
	for (let device of onlineDevices) {
		await bumpHeartbeat(device._id, true);
	}
});

api.get('/heartbeat/:device', async (req, res) => {
	await bumpHeartbeat(req.params.device);
	res.end();
});

const setIsOnlineAsync = (deviceId, isOnline) => Mongo.getCollection('Devices').updateAsync({
	'_id': deviceId,
	'isOnline': !isOnline,
}, {$set: {'isOnline': isOnline}});

export const bumpHeartbeat = async (deviceId, isInitial) => {
	clearTimeout(timers[deviceId]);
	if (!isInitial) await setIsOnlineAsync(deviceId, true);
	timers[deviceId] = setTimeout(() => {
		setIsOnlineAsync(deviceId, false);
	}, 15000);
};
