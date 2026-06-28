Package.describe({
	name: 'poon-devices',
	version: '1.0.0',
	summary: 'Poon device registration',
});

Package.onUse(api => {
	api.use('ecmascript');
	api.use('meteor');
	api.use('modules');
	api.use('mongo');
	api.use('random');
	api.use('accounts-base');
	api.use('check');
	api.use('react-meteor-data', 'client');
	api.use('poon', 'client');
	api.mainModule('client.js', 'client');
	api.mainModule('server.js', 'server');
});
