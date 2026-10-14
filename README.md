# Poon Devices

Device registration utilities for Poon Meteor apps.

## Usage

```bash
meteor add poon-devices
```

```javascript
import { deviceId } from 'meteor/poon-devices';
```

Screen sharing uses `/api/live/socket` and publishes one `ScreenViewers` document
per viewer through the authenticated `Device` subscription. The device opens a
signed recording socket only while viewers are present; new viewers receive a
fresh snapshot, and the last departure stops sharing.

Server code must register its permission check with
`registerScreenViewerAuthorizer(handler)`. The handler receives the viewer's user
ID and target device document and should throw when access is denied. Viewer
connections are rejected until an authorizer is registered. The package owns the
relay, source authentication, recording client, and publication cleanup.

Root `client.js` and `server.js` are the runtime barrels. Runtime code lives in
`client/` and `server/`, with `both/` reserved for shared code. Numbered modules in `client/startup/` and
`server/startup/` are imported explicitly in load order by their runtime barrel.
Startup modules may export values used by the package's public API.
