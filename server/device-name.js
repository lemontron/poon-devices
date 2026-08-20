const normalize = (value = '') => value.trim().toLowerCase();

const getPlatformName = (userAgent = '') => {
	const ua = normalize(userAgent);

	if (ua.includes('iphone')) return 'iPhone';
	if (ua.includes('ipad')) return 'iPad';
	if (ua.includes('ipod')) return 'iPod';
	if (ua.includes('android') && ua.includes('mobile')) return 'Android Phone';
	if (ua.includes('android')) return 'Android Tablet';
	if (ua.includes('mac os x') || ua.includes('macintosh')) return 'Mac';
	if (ua.includes('windows')) return 'Windows PC';
	if (ua.includes('linux')) return 'Linux PC';
};

const getBrowserName = (userAgent = '') => {
	const ua = normalize(userAgent);

	if (ua.includes('edg/')) return 'Edge';
	if (ua.includes('chrome/') || ua.includes('crios/')) return 'Chrome';
	if (ua.includes('firefox/') || ua.includes('fxios/')) return 'Firefox';
	if (ua.includes('safari/') && !ua.includes('chrome/') && !ua.includes('crios/')) return 'Safari';
};

const getFormFactor = (screenSize = {}) => {
	const width = Number(screenSize?.width) || 0;
	const height = Number(screenSize?.height) || 0;
	const maxDimension = Math.max(width, height);

	if (!maxDimension) return;
	if (maxDimension >= 1400) return 'Display';
	if (maxDimension >= 900) return 'Tablet';
	return 'Phone';
};

export const generateDefaultDeviceName = ({userAgent, screenSize, locationUrl}) => {
	const platform = getPlatformName(userAgent);
	const browser = getBrowserName(userAgent);
	const formFactor = getFormFactor(screenSize);
	const location = normalize(locationUrl);

	if (location.includes('/display')) return 'Display';
	if (platform === 'iPad') return 'iPad';
	if (platform === 'iPhone') return 'iPhone';
	if (platform?.includes('Android') && formFactor) return formFactor === 'Phone' ? 'Android Phone' : 'Android Tablet';
	if (platform) return platform;
	if (formFactor === 'Tablet') return 'Tablet';
	if (formFactor === 'Phone') return 'Phone';
	if (browser) return browser;
	return 'Unknown';
};
