# Contributing to WilhelmSK

## Prerequisites

- **Xcode 15 or later.** The project uses the `Wilhelm.xcworkspace` — always open the workspace, not `Wilhelm.xcodeproj`.
- **WilhelmSKLibrary sibling.** Clone [WilhelmSKLibrary](https://github.com/sbender9/WilhelmSKLibrary) next to this repo:
  ```
  ~/github/
    Wilhelm/          ← this repo
    WilhelmSKLibrary/ ← must be on main branch
  ```
  The workspace references it via a relative path (`../WilhelmSKLibrary`). Builds will fail if it is missing or on the wrong branch.
- **git-lfs.** Run `git lfs install` globally before cloning or checking out branches. Some refs in the history carry LFS objects.
- **CocoaPods.** Dependencies are already installed on the `development` branch. If you switch branches or pull new commits that modify `Podfile.lock`, run `pod install` to update `Pods/`.

## Building

```bash
xcodebuild \
  -workspace Wilhelm.xcworkspace \
  -scheme Wilhelm \
  -destination 'generic/platform=iOS Simulator' \
  -configuration Debug \
  build
```

SPM dependencies (KeychainAccess, GPXKit, swift-algorithms, swift-numerics) are resolved automatically by Xcode on first build.

Code signing is not required for simulator builds. For device builds, configure your Team and provisioning profiles per-target in Xcode's Signing & Capabilities panel.

## Branching Model

1. **Base off `development`**, not `master`:
   ```bash
   git checkout development
   git pull
   git checkout -b your-feature-name
   ```
2. Make your changes and commit (see below).
3. Open a PR against **`sbender9/Wilhelm`** targeting **`development`**.

`master` is the legacy default branch on GitHub; `development` is where active work lands.

## Commit Conventions

- Write the subject line in the imperative mood: "Fix depth gauge flicker" not "Fixed" or "Fixes".
- Keep the subject under 72 characters.
- If the change needs explanation, add a blank line after the subject and a short paragraph describing *why*, not just *what*.
- Reference the Signal K Discord thread or a GitHub issue number when relevant.

## Where to Discuss

The best place to ask questions, propose features, or coordinate with the maintainer (Scott Bender) is the **[Signal K Discord](https://discord.gg/uuZrwz4dCS)** — look for the `#wilhelmsk` channel.

Bug reports and feature requests can also be filed as [GitHub Issues](https://github.com/sbender9/Wilhelm/issues).
