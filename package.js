Package.describe({
	name: 'poon-devices',
	version: '1.0.0',
	summary: 'Poon device registration',
});

Package.onUse(api => {
	api.use('ecmascript');
	api.use('ejson', 'client');
	api.use('meteor');
	api.use('modules');
	api.use('mongo');
	api.use('random');
	api.use('accounts-base');
	api.use('check');
	api.use('tracker');
	api.use('react-meteor-data', 'client');
	api.use('poon', 'client');
	api.use('poon-api', 'server');
	api.mainModule('client.js', 'client');
	api.mainModule('server/index.js', 'server');
});
