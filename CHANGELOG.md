# Changelog

## v1.7.4

- Added support for optional quotes around string inline options (`main`, `out`, `math` and `autoprefixer`), so that they look more JSON-ey e.g.
  ```javascript
  // out: "../styles.css"
  ```
- Added test suite.
- Modernise code.

## [v1.7.2-v1.7.3]

- New: math setting is now supported as a per-file directive, and is explicitly available in the settings.json configuration.

## v1.7.1

- Fix: Reverted change in 1.7.0 that caused `@import "../../style.css";` imports to stop being exported.

## v1.7.0

- Updated less to [v4.1.0](https://github.com/less/less.js/blob/master/CHANGELOG.md)
- 💔 **Breaking change**: The less compiler changed the default `math` mode to `parens-division` in v4.x. To restore the v3.x behaviour you will either need to:
  - Set the `math` mode to `"always"`.
  - Wrap the expression with () to force the division, i.e. `width: (100% / 3)`
  - For more information, see http://lesscss.org/usage/#less-options-math and https://github.com/mrcrowl/vscode-easy-less/#project-wide--global-configuration.

## v1.6.0-v1.6.3

- Added support for settings in workspaces with multiple projects—[#50](https://github.com/mrcrowl/vscode-easy-less/issues/50)
- Added a new variable `${workspaceFolder}` which can be used to interpolate the folder root path into an `out` or `main` setting.
- Fix: Compiler stalling when less error exists in file other than being saved—[#55](https://github.com/mrcrowl/vscode-easy-less/issues/55)
- Fix: palette command "Compile LESS to CSS" not triggering in newer versions of VS code.—[#46](https://github.com/mrcrowl/vscode-easy-less/issues/46)
- Fix: for `sourceMapURL` not matching generated file when using `main` and `out` settings together.—[#43](https://github.com/mrcrowl/vscode-easy-less/issues/43)

## v1.5.0-v1.5.1

- Updated less to v3.9.0
- Updated less-plugin-autoprefix to v2.0.0
- Inline Javascript must now be explictly enabled using the javascriptEnabled option (either per-file or via settings). This regressed in v1.5.0 [#54](https://github.com/mrcrowl/vscode-easy-less/issues/54), due to security changes introduced by LESS v3.0.0.

## <v1.4.5

- For earlier release notes, see https://github.com/mrcrowl/vscode-easy-less/blob/v1.4.5/CHANGELOG.md
