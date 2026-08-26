import { Mongo } from 'meteor/mongo';

export const Devices = new Mongo.Collection('Devices');

export const deviceQuietFields = {
	'userId': 1,
	'isDevelopment': 1,
	'ip': 1,
	'addedOn': 1,
	'code': 1,
	'name': 1,
	'lanId': 1,
	'isHub': 1,
};