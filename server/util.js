export const getIpFromConnection = connection => {
	const headers = connection.httpHeaders;
	const rawIp = headers['cf-connecting-ip'] || headers['x-forwarded-for'] || connection.clientAdress;
	if (rawIp) return rawIp.split(',')[0];
};
