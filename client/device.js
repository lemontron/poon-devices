import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Mongo } from 'meteor/mongo';
import { storage } from 'meteor/poon';
import { useTracker } from 'meteor/react-meteor-data';

export const deviceId = (() => {
	if (Meteor.isDevelopment && '__codexWebMcpModelContext' in window) return 'codex';
	return localStorage.deviceId || (localStorage.deviceId = Random.id());
})();

export const deviceReady = new Promise(resolve => {
	Meteor.startup(() => { // hack
		Tracker.autorun(handle => {
			const device = Mongo.getCollection('Devices').findOne(deviceId);
			if (device) {
				handle.stop();
				resolve(device);
			}
		});
	});
});

export const useDevice = () => useTracker(() => {
	return Mongo.getCollection('Devices').findOne(deviceId) || storage.device;
}, []);
