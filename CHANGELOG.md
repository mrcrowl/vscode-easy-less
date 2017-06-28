
**v1.4.4-1.4.5** (<small>June 2017</small>)
=============================================

## What's New
 - New hook used for detecting file saves.  This now allows you to compile when a file is not dirty, e.g. when only `@imports` have changed.
 - Invoking `Compile Less to CSS` from the command palette now saves the file before compiling.

## Bug Fixes
 - Fix for broken `sourceMap` behaviours reported in: [#23](https://github.com/mrcrowl/vscode-easy-less/issues/23), [#26](https://github.com/mrcrowl/vscode-easy-less/issues/26)
 - Fix for regression of [#20](https://github.com/mrcrowl/vscode-easy-less/issues/20)

## Notice
 - HT to [@CnSimonChan](https://github.com/CnSimonChan) for all of this month's work. 

**v1.4.1-1.4.3** (<small>April 2017</small>)
=============================================

## What's New
 - Added settings:
   - **`outExt`**: allows an alternative output file extension to be used (e.g. `.wxss` instead of `.css`).  [v1.4.1]

## Bug Fixes
 - When there is more than one `main` setting, these are now guaranteed to be output in order&mdash;[#20](https://github.com/mrcrowl/vscode-easy-less/issues/20) [v1.4.3]
 - Fixed "This command only works for .less files" bug when saving .less file not in active editor&mdash;[#17](https://github.com/mrcrowl/vscode-easy-less/issues/17) [v1.4.3]
 - The paths output in .map files should now be output as relative paths&mdash;[#16](https://github.com/mrcrowl/vscode-easy-less/issues/16) [v1.4.2]

**v1.3.5-1.4.0** (<small>March 2017</small>)
=============================================

## What's New
 - Added settings:
   - **`autoprefixer`**: adds support for [postcss/autoprefixer plugin](https://github.com/postcss/autoprefixer).  [v1.4.0]
   - **`sourceMapFileInline`**: allows source maps to be output as part of the .css file.  [v1.3.7]
   - **`ieCompat`**: allows disabling the restriction that prevents inlining images >32KB.  [v1.3.7]
   - See README for more details [v1.3.7]

## Bug Fixes
   - The `sources` output in a .css.map file (or in an inline source-map) is now relative to the .less file it references (i.e. when `out` has been used to redirect the .css output and `sourceMap` is enabled) [v1.3.9]
   - When the `sourceMap` option is `true`, the appropriate sourceMappingURL comment is now output
     at the bottom of the .css file [v1.3.8]

## Apologies!
 - If you were unlucky enough to install v1.3.6 it would have been very broken. Sorry about that.

**v1.3.4** (<small>January 2017</small>)
=============================================

## What's New
 - You can now specify the `relativeUrls` option (project-level or per-file):
   - **`true`**: URLs (`url` / `data-uri`) in `@import`'ed files are rewritten relative to the importing file.
   - **`false`**: no rewriting of URLs  (now the default).
   - See README for more details and examples.

## Bug Fixes
   - When compiling a main file `url` was adding an unnecessary level of path prefix to be pre-pended to the URL output. Also, `relativeUrls` was true by default, which caused this behaviour.

**v1.3.3:** (<small>December 2017</small>)
=============================================

## What's New
 - The `out` option can now specify a folder path ([pull request 9](https://github.com/mrcrowl/vscode-easy-less/pull/9)).
 - The `out` and `main` options now support use of the vscode `${workspaceRoot}` variable.

## Bug Fixes
 - When compiling a main file, relative paths (e.g. `@import` statements within the main file) are now resolved relative to the main file's path.