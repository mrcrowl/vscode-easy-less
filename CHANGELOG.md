
1.3.2
=====

## What's new
 - The `out` option can now specify a folder path ([pull request 9](https://github.com/mrcrowl/vscode-easy-less/pull/9)).
 - The `out` and `main` options now support use of the vscode `${workspaceRoot}` variable.

## Bug Fixes
 - Bug fix: when compiling a main file, relative paths (e.g. `@import` statements within the main file) are now resolved relative to the main file's path.