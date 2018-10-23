# Official desktop client for arztcloud.com.

The auto update implementation is based on https://github.com/iffy/electron-updater-example tag 0.7.1
with a [temporary fix](https://github.com/electron-userland/electron-builder/issues/3367#issuecomment-429696868) due to conflicts with the current electron-updater version.

## Development
### Create releases
#### Preparation
Create a [personal access token](https://github.com/settings/tokens) with permissions for *repo* and *admin:org* (since the repository belongs to an organization).

```bash
export GH_TOKEN="EnterYourAccessToken"
```
#### Create release

```bash
npm run publish
```
