import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Accounts } from 'meteor/accounts-base';
import { useFind } from 'meteor/react-meteor-data';
import { Devices } from '../db';
import { isStandalone, toast } from 'meteor/poon';

export const deviceId = (() => {
	if (navigator.userAgent.includes('Codex')) return 'codex';
	return localStorage.deviceId || (localStorage.deviceId = Random.id());
})();

Meteor.startup(async () => {
	const nativeCredential = window.GohanoTerminal && await window.GohanoTerminal.credential();
	Meteor.call('Device', {
		'deviceId': deviceId,
		'screenSize': {'width': screen.width, 'height': screen.height},
		'locationUrl': location.href,
		isStandalone,
		nativeCredential,
	}, (err, res) => {
		if (err) return toast(err.reason);
		if (res.deviceId === 'codex' && res.userId) Accounts.connection.setUserId(res.userId);
		Meteor.subscribe('Device', res.deviceId);
	});
});

export const useDevice = () => {
	const [device] = useFind(() => Devices.find(deviceId), [deviceId]);
	return device;
};
