# iOS signing secrets

These files are not in Git. Place them here when sharing an archive for local/Xcode builds.

## Required files

| File | Purpose |
| --- | --- |
| `distribution.p12` | Apple Distribution certificate export |
| `AppStore_com.planandeat.courier.mobileprovision` | App Store provisioning profile for `com.planandeat.courier` |
| `credentials.txt` (optional) | Password for the `.p12`, notes |

## Project constants

- Bundle ID: `com.planandeat.courier`
- Apple Team ID: `SWFBAUD446`

## Mac setup

1. Double-click / import `distribution.p12` into Keychain Access (enter the export password).
2. Double-click the `.mobileprovision` file to install it.
3. Open the iOS workspace in Xcode (`pnpm xcode`) and archive with that team / profile.

Automatic signing also works if the Mac user is a member of team `SWFBAUD446` in Apple Developer.
