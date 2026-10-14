import './client/startup/01-device-registration';
import './client/startup/02-screen-sharing';
import { deviceId, deviceReady, useDevice } from './client/device';
import { signAsync } from './client/crypto';

export { deviceId, deviceReady, useDevice, signAsync };