
# Overview

Easily work with LESS files in Visual Studio Code.

 "Compile-on-save" for [LESS stylesheets](http://lesscss.org/) without using a build task.  

# Features

 * Generates a `.css` file each time you save a `.less` file.  
   e.g. `styles.less` --> `styles.css`
 
 * Compile errors integrate with the standard _Errors and Warnings_ list.
 
 * Has reasonable [default settings](#default-settings), but...
 
 * Configurable, as needed:
    * Configurable at user, workspace and per-file level (see [Advanced Usage](#advanced-usage) below)
    * _Main_ file support
    * Alternative output file
    * Output suppression
    * Compression

 * [autoprefixer](https://github.com/postcss/autoprefixer) plugin included.
 
# Default Settings

 * Compile on save occurs for every `.less` file in the project.
 * The `.css` file is output to the same directory as the source `.less` file.
 * Source maps (`.css.map` files) are _not_ output.
 * Compression is disabled.
 * Auto-prefixer is disabled.
 
# Basic Usage

 1. Create a `.less` file.
 2. Hit Ctrl/Cmd+S to save your file.
 3. A `.css` file is automatically generated.
 4. You should see a temporary "Less compiled in _**X**_ ms" message in the status bar.

N.B. Also available from the command palette as "Compile LESS to CSS".

# Advanced Usage

## Project-Wide & Global Configuration

 * Project-wide settings are configured using the standard `settings.json` file  (i.e. _Workspace Settings_).
 * `settings.json` must exist in the `.vscode` directory at the root level of your project.
 * Alternatively, settings can go in _User Settings_ for global defaults.
 * Use the `"less.compile"` key.
 * Example `settings.json` file: 
    
    ```json
    {    
        "less.compile": {
            "compress":  true,  // true => remove surplus whitespace
            "sourceMap": true,  // true => generate source maps (.css.map files)
            "out":       false, // false => DON'T output .css files (overridable per-file, see below)
        }
    }
    ```   

## Per-File Configuration

 * Settings can also be specified per `.less` file as a comment on the _first_ line.
 * Settings are comma-separated and strings are _not_ "quoted".
 * Example:
 
    ```less
    // out: ../dist/app.css, compress: true, sourceMap: false
    
    body, html {
        ...
    }
    ```

## Settings
   
`main: { filepath: string | string[] }`
 * Compiles a different less file _instead_ of this one.
 * All other settings are ignored.
 * Filepath is relative to the current file.
 * Multiple main files can be specified (see [FAQ](#faq)).
 
`out: { boolean | filepath: string | folderpath: string }`
 * Redirects the css output to a different file.  
 * This setting can be used to override a project-wide `"out": false` setting, where you only want certain `.less` files to be generated.    
 * If filepath is used, but no file extension is specified, it will append `.css`
 * If folderpath is used, the less filename will be used, but with the `.css` extension
 * Filepath is relative to the current file.

 `outExt: { string }`
 * The default output extension is `.css`.
 * This allows you to specify an alternative output file extension (e.g. `.wxss` instead of `.css`)
 * This applies to the `.map` file also (e.g. `.wxss.map`)

`sourceMap: { boolean }`
 * Enables generation of source map files.
 * When enabled, a `.css.map` file will be output in the same direction as the `.css` file (except when `sourceMapFileInline` is set, see below).
 * The `out` setting is respected.
 
`sourceMapFileInline: { boolean }`
 * Inline the source map within the css.
 * When enabled, the `.css` file outputted will contain an inline source-map.

`compress: { boolean }` 
 * Compresses the css output by removing surplus white-space.

`relativeUrls: { boolean }`
 * Specifies whether URLs in `@import`'ed should be rewritten relative to the importing file.
 * Has no effect on the `out` parameter.
 * Example of `true` option&mdash;given this folder structure:<br/>
   `/main.less`<br/>
   `/css/feature/feature.less`<br/>
   `/css/feature/background.png`
   
   <hr/>

   /main.less:
   ```less
   // relativeUrls: true
   @import "css/feature/feature.less";
   ```

   /css/feature/features.less:
   ```less
   // main: ../../main.less
   .feature {
       background-image: url(background.png)
   }
   ```

   /main.css: (output)
   ```less
   .feature {
       background-image: url('css/feature/background.png')
   }
   ```

`autoprefixer: { string | string[] }` 
 * When present, this enables the [autoprefixer plugin for less](https://github.com/postcss/autoprefixer) (included).  
 * This plugin automatically adds/removes vendor-prefixes needed to support a set of browsers which you specify.
 * The `autoprefixer` option _is_ the comma-separated list of `browsers` for autoprefixer to use (or alternatively a string array of them).
 * Example of `autoprefixer` within `.vscode/settings.json`: 

    ```json
    {    
        "less.compile": {
            "autoprefixer": "> 5%, last 2 Chrome versions, not ie 6-9"
        }
    }
    ```
 * See [browserslist](https://github.com/ai/browserslist#queries) documentation for further examples of browser queries.
 * **NOTE**: If used with the per-file configuration, the browsers listed _must_ be unquoted and semi-colon separated (because comma is already the directive separator): e.g.<br/>
   `// autoprefixer: > 5%; last 2 Chrome versions; not ie 6-9, sourceMap: true, out: ../css/style.css`

`ieCompat: { boolean }`
 * IE8 compatibility mode (defaults to `true`).
 * When `true`: prevents inlining of `data-uri`s that exceed 32KB.
 * When `false`: removes restriction on `data-uri` size.

## Settings Cascade Order

Settings are read and applied in the following order:

 1. User Settings
 2. Project-wide `settings.json` (aka Workspace Settings)
 3. Per-file Settings
 
# FAQ

 1. How do I redirect the output to a separate file?  
    
    > Add the following line to the head of your less file:
    >
    > ```javascript
    > // out: new-file.css
    > ```
  
 2. How do I redirect all css output to a specific folder?  
    
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
    >     "less.compile": {
    >         "out": "${workspaceRoot}\\css\\"
    >     }
    > }
    > ```
    
 3. How do I suppress compiling this less file / compile a _different_ less file than the one being edited?  
    
    > Add a reference to the master.less file to the head of the imported less file:
    >
    > ```javascript
    > // main: master.less
    > ```

 4. How do I suppress the compilation of a single less file?

    > Set `out` to false (or null) in a comment at the top of the .less file:
    >
    > ```less
    > // out: false
    > ```

 5. How do I compile only _some_ of the .less files in my project?
 
    > a. Default `"out"` setting to false in `settings.json`  
    > b. Override `out` for each `.less` file that you want to compile:  
    > 
    > `.vscode/settings.json`: 
    >
    > ```json
    > {    
    >     "less.compile": {
    >         "out": false
    >     }
    > }
    > ```
    >
    > `style.less`: (will be compiled to `style.css`)
    >
    > ```less
    > // out: true
    >
    > @import "mixins.less";
    >
    > body, html {    
    >   ...     
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
    
 6. Is it possible to have multiple "main" .less files?
 
    > Yes, multiple main files can be specified in these ways:
    > 
    > * In _settings.json_, using a string array:
    >
    >   `.vscode/settings.json`: 
    >
    >   ```json
    >   {    
    >       "less.compile": {
    >           "main": ["main-one.less", "main-two.less"]
    >       }
    >   }
    >   ```   
    >
    > * _Per file_: by specifying the `main` setting key more than once:
    >
    >   ```less
    >   // main: main-one.less, main: main-two.less
    >   ```
    >
    > When there is more than one `main` setting, they are guaranteed to be 
    > output in the order listed (from left to right). For the example shown above, the output from `main-one.less` will be saved to disk before `main-two.less` is processed (assuming they are both configured to output). This can be used to control dependency chains.

 7. Can I specify paths relative to the _workspace_, instead of relative to the _less_ file?

    > Yes, the variable `${workspaceRoot}` can be used within the `main` or `out` parameters:
    >
    > `.vscode/settings.json`: 
    >
    > ```json
    > {    
    >     "less.compile": {
    >         "main": ["${workspaceRoot}\\css\\main.less"]
    >     }
    > }
    > ```

 8. How do I generate sourcemap (`*.css.map`) files?

    > `.vscode/settings.json`: 
    >
    > ```json
    > {    
    >     "less.compile": {
    >         "sourceMap": true
    >     }
    > }
    > ```
   
    
# Acknowledgements

 * Configuration concepts borrowed from [Jonathan Diehl's](#https://github.com/jdiehl) [brackets-less-autocompile](https://github.com/jdiehl/brackets-less-autocompile).
 * Contributors: [CnSimonChan](https://github.com/CnSimonChan), [gprasanth](https://github.com/gprasanth), [elvis-macak](https://github.com/elvis-macak)
 * Feedback/ideas: [thecosss](https://github.com/thecosss), [pnkr](https://github.com/pnkr), [ep-mark](https://github.com/ep-mark), 
   [icefrog](https://github.com/NateLing), , [yunfeizuo](https://github.com/yunfeizuo), [Tobyee](https://github.com/Tobyee), [sagive](https://github.com/sagive), [DifficultNick](https://github.com/DifficultNick), Alejandro L and Kenneth Davila 