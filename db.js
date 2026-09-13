import { Mongo } from 'meteor/mongo';

export const Devices = new Mongo.Collection('Devices');

export const deviceQuietFields = {
	'type': 1,
	'userId': 1,
	'isDevelopment': 1,
	'ip': 1,
	'addedOn': 1,
	'code': 1,
	'name': 1,
	'networkId': 1,
	'storeId': 1,
	'isHub': 1,
	'imageId': 1,
	'stripeReader': 1,
};
