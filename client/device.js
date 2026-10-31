import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Mongo } from 'meteor/mongo';
import { useTracker } from 'meteor/react-meteor-data';

export const deviceId = (() => {
	if (Meteor.isDevelopment && '__codexWebMcpModelContext' in window) return 'codex';
	const storedId = Meteor._localStorage.getItem('deviceId');
	if (storedId) return storedId;
	const id = Random.id();
	Meteor._localStorage.setItem('deviceId', id);
	return id;
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
