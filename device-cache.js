import { EJSON } from 'meteor/ejson';
import { Devices } from './db';

const getFromStorage = () => {
	const saved = localStorage.device;
	if (saved) return EJSON.parse(saved);
};

const saveToStorage = (device) => {
	localStorage['device'] = EJSON.stringify(device);
};

export const createCachedDeviceQuery = deviceId => {
	const cached = getFromStorage();
	Devices.find(deviceId).observe({
		'added': saveToStorage,
		'changed': saveToStorage,
	});
	return options => {
		return Devices.findOne(deviceId, options) || cached;
	};
};
