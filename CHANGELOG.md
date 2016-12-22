
1.3.4
=====

## What's New
 - You can now specify the `relativeUrls` option (project-level or per-file):
   - **`true`**: URLs (`url` / `data-uri`) in `@import`'ed files are rewritten relative to the importing file.
   - **`false`**: no rewriting of URLs  (now the default).
   - See README for more details and examples.

## Bug Fixes
   - When compiling a main file `url` was adding an unnecessary level of path prefix to be pre-pended to the URL output. Also, `relativeUrls` was true by default, which caused this behaviour.

1.3.3
=====

## What's New
 - The `out` option can now specify a folder path ([pull request 9](https://github.com/mrcrowl/vscode-easy-less/pull/9)).
 - The `out` and `main` options now support use of the vscode `${workspaceRoot}` variable.

## Bug Fixes
 - When compiling a main file, relative paths (e.g. `@import` statements within the main file) are now resolved relative to the main file's path.