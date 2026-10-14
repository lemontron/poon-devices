import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Tracker } from 'meteor/tracker';
import { loadScript } from 'meteor/poon';
import { deviceId } from '../device';
import { signAsync } from '../crypto';

const ScreenViewers = new Mongo.Collection('ScreenViewers');

let socket;
let stopRecording;
let generation = 0;

const stop = () => {
	generation++;
	const previous = socket;
	socket = undefined;
	if (previous) {
		previous.onopen = null;
		previous.close();
	}
	if (stopRecording) stopRecording();
	stopRecording = undefined;
};

const start = async viewerId => {
	stop();
	const currentGeneration = generation;
	const [{record}, signature] = await Promise.all([
		loadScript('https://cdn.jsdelivr.net/npm/@rrweb/record', 'rrwebRecord'),
		signAsync(viewerId),
	]);
	if (currentGeneration !== generation) return;

	const url = new URL(Meteor.absoluteUrl('api/live/socket'));
	url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
	url.searchParams.set('deviceId', deviceId);
	url.searchParams.set('role', 'source');
	url.searchParams.set('viewerId', viewerId);
	url.searchParams.set('signature', signature);
	const connection = new WebSocket(url);
	socket = connection;
	connection.onopen = () => {
		connection.send(JSON.stringify({'type': 'reset'}));
		stopRecording = record({
			'blockClass': 'dnt',
			'inlineImages': false,
			'collectFonts': false,
			'emit': event => {
				connection.send(JSON.stringify({'type': 'event', event}));
			},
		});
	};

	connection.onerror = () => connection.close();
	connection.onclose = () => {
		if (socket === connection) stop();
	};
};

const cursor = ScreenViewers.find({deviceId});
cursor.observeChanges({
	'added': viewerId => start(viewerId).catch(error => console.warn('[screen-share]', error)),
	'removed': () => {
		if (!cursor.count()) stop();
	},
});

Tracker.autorun(() => {
	if (!Meteor.status().connected) stop();
});
