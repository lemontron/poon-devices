import { storage } from 'meteor/poon';
import { Devices } from './db';

const saveToStorage = device => storage.device = device;

export const createCachedDeviceQuery = deviceId => {
	const cached = storage.device;
	Devices.find(deviceId).observe({
		'added': saveToStorage,
		'changed': saveToStorage,
	});
	return options => {
		return Devices.findOne(deviceId, options) || cached;
	};
};
