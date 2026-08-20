// import { Meteor } from 'meteor/meteor';
// import { Random } from 'meteor/random';
// import { check } from 'meteor/check';
// import { EventEmitter } from 'node:events';
//
// // This glue code is resposible for relaying the client calls to the client
// const requestsBridge = new EventEmitter();
// Meteor.publish(null, function() {
// 	requestsBridge.on(this.connection.id, msg => {
// 		this.added('RPC', msg._id, msg);
// 	});
// 	this.ready();
// });
//
// // This glue code listens for responses from the client
// const responsesBridge = new EventEmitter();
// Meteor.methods({
// 	'RPC': function(callId, result) {
// 		check(callId, String);
// 		// console.log('received rpc result', callId, result);
// 		responsesBridge.emit(callId, result);
// 	},
// });
//
// // Send a request to the client for it to perform an action
// export const callClientAsync = ({methodName, data}, connection) => new Promise((resolve, reject) => {
// 	const callId = Random.id(); // Durable ID for entire call lifecycle
// 	requestsBridge.emit(connection.id, {'_id': callId, methodName});
// 	responsesBridge.once(callId, resolve);
// });