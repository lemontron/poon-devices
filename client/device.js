import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Mongo } from 'meteor/mongo';
import { useTracker } from 'meteor/react-meteor-data';
import { Storage } from 'meteor/poon';

export const deviceId = (() => {
	Storage.resumeToken ||= Random.secret();
	if (Meteor.isDevelopment && '__codexWebMcpModelContext' in window) return 'codex';
	return Storage.deviceId ||= Random.id();
})();

let device; // Makes device slightly more durable to survive reconnects

export const deviceReady = new Promise(resolve => {
	Meteor.startup(() => {
		Mongo.getCollection('Devices').find(deviceId).observe({
			added: doc => {
				device = doc;
				resolve(device);
			},
			changed: doc => device = doc,
		});
	});
});

export const useDevice = () => useTracker(() => {
	return Mongo.getCollection('Devices').findOne(deviceId) || device;
}, [deviceId, device]);
