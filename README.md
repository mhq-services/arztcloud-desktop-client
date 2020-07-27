# Official desktop client for arztcloud.com.

## Updates
Updates implemented with [electron-updater](https://www.electron.build/auto-update.html).

### Channels
The auto update with provider GitHub currently only [distinguishes between prerelease version and normal release](https://github.com/electron-userland/electron-builder/issues/1722).
If the version name has a suffix e.g. "0.1.0-beta" it allows updates to pre-releases, if not is only updates to normal releases (see AutoUpdaters property "allowAutoupdate" in its  [API documentation](https://www.electron.build/auto-update#api)).

## Development

### Create releases
#### Preparation
On macOs: Install [wine](https://www.winehq.org/) to be able to create Windows .exe files.

Create a [personal access token](https://github.com/settings/tokens) with permissions for *repo* and *admin:org* (since the repository belongs to an organization).

```bash
export GH_TOKEN="EnterYourAccessToken"
```
#### Run build and create GitHub release

```bash
npm run publish
```

### Optional
Ignore certificate errors for testing local
```bash
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');
app.commandLine.appendSwitch('allow-insecure-localhost', 'true');
```
