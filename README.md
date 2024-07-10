# Overview

Easily work with LESS files in Visual Studio Code.

"Compile-on-save" for [LESS stylesheets](http://lesscss.org/) without using a build task.

---

# Features

- Generates a `.css` file each time you save a `.less` file.  
  e.g. `styles.less` --> `styles.css`

- Compile errors integrate with the standard _Errors and Warnings_ list.

- Has reasonable [default settings](#default-settings), but...

- Configurable, as needed:

  - Configurable at user, workspace and per-file level (see [Advanced Usage](#advanced-usage) below)
  - _Main_ file support
  - Alternative output file
  - Output suppression
  - Compression

- [autoprefixer](https://github.com/postcss/autoprefixer) plugin included.

# Default Settings

- Compile on save occurs for every `.less` file in the project.
- The `.css` file is output to the same directory as the source `.less` file.
- Source maps (`.css.map` files) are _not_ output.
- Compression is disabled.
- Auto-prefixer is disabled.

# Basic Usage

1.  Create a `.less` file.
2.  Hit Ctrl/Cmd+S to save your file.
3.  A `.css` file is automatically generated.
4.  You should see a temporary "Less compiled in _**X**_ ms" message in the status bar.

N.B. Also available from the command palette as "Compile LESS to CSS".

# Advanced Usage

## Project-Wide & Global Configuration

- Project-wide settings are configured using the standard `settings.json` file (i.e. _Workspace Settings_).
- `settings.json` must exist in the `.vscode` directory at the root level of your project.
- Alternatively, settings can go in _User Settings_ for global defaults.
- Use the `"less.compile"` key.
- Example `settings.json` file:
  ```json
  {
    "less.compile": {
      "compress": true, // true => remove surplus whitespace
      "sourceMap": true, // true => generate source maps (.css.map files)
      "out": false // false => DON'T output .css files (overridable per-file, see below)
    }
  }
  ```

## Per-File Configuration

- Settings can also be specified per `.less` file as a comment on the _first_ line.
- Settings are comma-separated and strings are _not_ "quoted".
- Example:

  ```less
  // out: "../dist/app.css", compress: true, sourceMap: false

  body,
  html {
    ...;
  }
  ```

## Settings

`main: { filepath: string | string[] }`

- Compiles a different less file _instead_ of this one.
- All other settings are ignored.
- Filepath is relative to the current file.
- Multiple main files can be specified (see [FAQ](#faq)).

`out: { boolean | filepath: string | folderpath: string }`

- Redirects the css output to a different file or suppresses output.
- If `filepath` is used, but no file extension is specified, it will append `.css`
- If `folderpath` is used, the less filename will be used, but with the `.css` extension
- _NOTE_: A folder path must end with a `/` (or `\` for Windows), e.g. `../css/` not `../css` (the latter is always interpreted as an extensionless filename).
- Filepath is relative to the current file, so relative paths can be used, e.g. `../../styles.css`
- The following replacements are available:
  - `${workspaceFolder}` — the root folder for the VS Code project containing the `.less` file.
  - `$1` — the "base" name of the `.less` file, e.g. for `styles.css`, `$1` would be `style`.
  - `$2` — the extension of the css file, usually `.css` unless `outExt` is used.
- Example: `${workspaceFolder}/dist/css/final-$1$2`
- `out: false` = don't output.
- This setting can be used to override a project-wide `"out": false` setting, where you only want certain `.less` files to be generated.

`outExt: { string }`

- The default output extension is `.css`.
- This allows you to specify an alternative output file extension (e.g. `.wxss` instead of `.css`)
- This applies to the `.map` file also (e.g. `.wxss.map`)

`sourceMap: { boolean }`

- Enables generation of source map files.
- When enabled, a `.css.map` file will be output in the same direction as the `.css` file (except when `sourceMapFileInline` is set, see below).
- The `out` setting is respected.

`sourceMapFileInline: { boolean }`

- Inline the source map within the css.
- When enabled, the `.css` file outputted will contain an inline source-map.

`compress: { boolean }`

- Compresses the css output by removing surplus white-space.

`relativeUrls: { boolean }`

- Specifies whether URLs in `@import`'ed should be rewritten relative to the importing file.
- Has no effect on the `out` parameter.
- Example of `true` option&mdash;given this folder structure:<br/>
  `/main.less`<br/>
  `/css/feature/feature.less`<br/>
  `/css/feature/background.png`

  <hr/>

  /main.less:

  ```less
  // relativeUrls: true
  @import 'css/feature/feature.less';
  ```

  /css/feature/features.less:

  ```less
  // main: "../../main.less"
  .feature {
    background-image: url(background.png);
  }
  ```

  /main.css: (output)

  ```less
  .feature {
    background-image: url('css/feature/background.png');
  }
  ```

`autoprefixer: { string | string[] }`

- When present, this enables the [autoprefixer plugin for less](https://github.com/postcss/autoprefixer) (included).
- This plugin automatically adds/removes vendor-prefixes needed to support a set of browsers which you specify.
- The `autoprefixer` option _is_ the comma-separated list of `browsers` for autoprefixer to use (or alternatively a string array of them).
- Example of `autoprefixer` within `.vscode/settings.json`:

  ```json
  {
    "less.compile": {
      "autoprefixer": "> 5%, last 2 Chrome versions, not ie 6-9"
    }
  }
  ```

- See [browserslist](https://github.com/ai/browserslist#queries) documentation for further examples of browser queries.
- **NOTE**: If used with the per-file configuration, the browsers listed _must_ be semi-colon separated (because comma is already the directive separator): e.g.<br/>
  `// autoprefixer: "> 5%; last 2 Chrome versions; not ie 6-9", sourceMap: true, out: "../css/style.css"`

`ieCompat: { boolean }`

- IE8 compatibility mode (defaults to `true`).
- When `true`: prevents inlining of `data-uri`s that exceed 32KB.
- When `false`: removes restriction on `data-uri` size.

`javascriptEnabled: { boolean }`

- Enables inline javascript within less files (defaults to `false`).
- Inline JavaScript occurs for any text within backticks, e.g. `` font-weight: `10+10`px'; ``

`math: { "parens-division" | "parens" | "always" | "strict" | "strict-legacy" }`

- Controls the `math` option [used by the less compiler](http://lesscss.org/usage/#less-options-math).
- The default changed to `"parens-division"` in [less v4.0.0](https://github.com/less/less.js/releases/tag/v4.0.0) (and consequently in Easy LESS v1.7.0)
- The default for Easy LESS matches upstream, which is `"parens-division"`.
- To restore the less v3.x behaviour, use:
  ```json
  {
    "less.compile": {
      "math": "always"
    }
  }
  ```
  ... or, using a per-file directive:
  ```less
  // math: "always"
  ```
  Alternatively, you can wrap your expression in parentheses:
  ```less
  .w-third {
    width: (100% / 3);
  }
  ```

## Settings Cascade Order

Settings are read and applied in the following order:

1.  User Settings
2.  Project-wide `settings.json` (aka Workspace Settings)
3.  Per-file Settings

# FAQ

1.  How do I redirect the output to a separate file?

    > Add the following line to the head of your less file:
    >
    > ```javascript
    > // out: "new-file.css"
    > ```

2.  How do I redirect all css output to a specific folder?

    > Specify the out parameter in the `settings.json` file, as a relative or absolute path,
    > with a trailing slash (`/` or `\\`).
    >
    > Tip: You can use the environment variable
    > `${workspaceRoot}` to specify paths relative to the workspace:
    >
    > `.vscode/settings.json`:
    >
    > ```json
    > {
    >   "less.compile": {
    >     "out": "${workspaceRoot}\\css\\"
    >   }
    > }
    > ```

3.  How do I suppress compiling this less file / compile a _different_ less file than the one being edited?

    > Add a reference to the master.less file to the head of the imported less file:
    >
    > ```javascript
    > // main: "master.less"
    > ```

4.  How do I suppress the compilation of a single less file?

    > Set `out` to false (or null) in a comment at the top of the .less file:
    >
    > ```less
    > // out: false
    > ```

5.  How do I compile only _some_ of the .less files in my project?

    > a. Default `"out"` setting to false in `settings.json`  
    > b. Override `out` for each `.less` file that you want to compile:
    >
    > `.vscode/settings.json`:
    >
    > ```json
    > {
    >   "less.compile": {
    >     "out": false
    >   }
    > }
    > ```
    >
    > `style.less`: (will be compiled to `style.css`)
    >
    > ```less
    > // out: true
    >
    > @import 'mixins.less';
    >
    > body,
    > html {
    >   ...;
    > }
    > ```
    >
    > `mixins.less`: (no comment line, will not be compiled)
    >
    > ```less
    > .border-radius(@radius) {
    >   -webkit-border-radius: @radius;
    >   -moz-border-radius: @radius;
    >   -ms-border-radius: @radius;
    >   border-radius: @radius;
    > }
    > ```

6.  Is it possible to have multiple "main" .less files?

    > Yes, multiple main files can be specified in these ways:
    >
    > - In _settings.json_, using a string array:
    >
    >   `.vscode/settings.json`:
    >
    >   ```json
    >   {
    >     "less.compile": {
    >       "main": ["main-one.less", "main-two.less"]
    >     }
    >   }
    >   ```
    >
    > - _Per file_: by specifying the `main` setting key more than once:
    >
    >   ```less
    >   // main: "main-one.less", main: "main-two.less"
    >   ```
    >
    > When there is more than one `main` setting, they are guaranteed to be
    > output in the order listed (from left to right). For the example shown above, the output from `main-one.less` will be saved to disk before `main-two.less` is processed (assuming they are both configured to output). This can be used to control dependency chains.

7.  Can I specify paths relative to the _workspace_, instead of relative to the _less_ file?

    > Yes, the variable `${workspaceFolder}` can be used within the `main` or `out` parameters:
    >
    > `.vscode/settings.json`:
    >
    > ```json
    > {
    >   "less.compile": {
    >     "main": ["${workspaceFolder}/css/main.less"]
    >   }
    > }
    > ```

8.  How do I generate sourcemap (`*.css.map`) files?

    > `.vscode/settings.json`:
    >
    > ```json
    > {
    >   "less.compile": {
    >     "sourceMap": true
    >   }
    > }
    > ```

9.  How do I resolve the error `"Inline JavaScript is not enabled. Is it set in your options?"`?

    > Inline JavaScript is a feature of LESS that used to be enabled by default. It was disabled by default in v3.0.0 of LESS for security reasons. You can use the `javascriptEnabled` setting to override this behaviour by setting the value to `true`.
    >
    > If you receive this error unintentionally, there are most likely one or more backticks (``) in your .less file.

10. Can I add custom pre-processing to my less files before they are converted to CSS?

    > Yes! This extension is itself extensible.
    >
    > It provides a very basic API that can be used by another VS Code extension to > add any custom preprocessing that is required. The input to the preprocessor
    > is the `.less` file contents (as a `string`).
    > The expected output is also a `string` of less syntax.
    >
    > ### Example:
    >
    > ```typescript
    > // Within your own VS Code extension...
    >
    > import { extensions } from 'vscode';
    >
    > // API type definitions.
    > type EasyLessAPI = { registerPreprocessor: (processor: PreprocessorFn): void };
    > type PreprocessorFn = (less: string, ctx: Map<string, any>) => Promise<string> | string;
    >
    > // Overly-simplified preprocessor to convert "em" to "rem".
    > const emToRem: PreprocessorFn = async (less: string) => {
    >   return context.replace(/(?<=[\d\s])em\b/g, 'rem');
    > };
    >
    > // Activation function for your extension.
    > export function activate(context: vscode.ExtensionContext) {
    >   // Get reference to EasyLESS extension.
    >   const extension = extensions.getExtension('mrcrowl.easy-less');
    >   if (!api) {
    >     console.error('EasyLESS is not installed or available.');
    >   }
    >
    >   // Register emToRem as a less preprocessor.
    >   const api: EasyLessAPI = extension.exports;
    >   api.exports.registerPreprocessor(emToRem);
    > }
    > }
    > ```
    >
    > Preprocessor functions can also return either a plain `string` or a `Promise<string>` depending on if any async processing is required.
    >
    > ### Extension Activation
    >
    > In order for your custom extension to activate, it is important that the following activation event is declared the in extension manifest (the `package.json` file for the extension):
    >
    > ```jsonc
    >   "activationEvents": [
    >      "onLanguage:less"
    >   ],
    > ```
    >
    > This ensures that your extension is appropriately activated by VS Code.
    >
    > ### References
    >
    > Learn more about VS Code extensions and how they can be made extensibile by other extensions:
    >
    > - [Overview of VS Code Extensions](https://code.visualstudio.com/api)
    > - [API reference — Extensibility](https://code.visualstudio.com/api/references/vscode-api#extensions)
    > - [`extensions.getExtension()` api](https://code.visualstudio.com/api/references/vscode-api#extensions.getExtension)
    > - [`Extension<T>` type](https://code.visualstudio.com/api/references/vscode-api#Extension<T>)
    >
    > ***
    >
    > 🎩 _HT to [northwang-lucky](https://github.com/northwang-lucky) for introducing this extensibility feature._

# Acknowledgements

- Configuration concepts borrowed from [Jonathan Diehl's](#https://github.com/jdiehl) [brackets-less-autocompile](https://github.com/jdiehl/brackets-less-autocompile).
- Contributors: [CnSimonChan](https://github.com/CnSimonChan), [gprasanth](https://github.com/gprasanth), [elvis-macak](https://github.com/elvis-macak), [northwang-lucky](https://github.com/northwang-lucky)
- Feedback/ideas: [thecosss](https://github.com/thecosss), [pnkr](https://github.com/pnkr), [ep-mark](https://github.com/ep-mark),
  [icefrog](https://github.com/NateLing), , [yunfeizuo](https://github.com/yunfeizuo), [Tobyee](https://github.com/Tobyee), [sagive](https://github.com/sagive), [DifficultNick](https://github.com/DifficultNick), Alejandro L and Kenneth Davila, [linxz](https://github.com/linxz) & [docguytraining](https://github.com/docguytraining), [kranack](https://github.com/kranack)
