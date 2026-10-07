import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export let Devices;

Meteor.startup(() => {
	Devices = Mongo.getCollection('Devices');
});
