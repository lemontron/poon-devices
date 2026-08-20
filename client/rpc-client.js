// import { Mongo } from 'meteor/mongo';
// import { Meteor } from 'meteor/meteor';
// import { toast } from 'meteor/poon';
//
// const RPC = new Mongo.Collection('RPC');
//
// export const defineRpcMethod = (methodName, fn) => {
// 	RPC.find({'methodName': methodName}).observe({
// 		added: async (call) => {
// 			const res = await fn();
// 			//console.log(`Responding to [${methodName}]`, 'call=', call._id, 'res=', res);
// 			Meteor.call('RPC', call._id, res, (err, res) => {
// 				if (err) return toast(err.reason);
// 			});
// 		},
// 	});
// };