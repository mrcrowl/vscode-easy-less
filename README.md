# Overview

Easily work with LESS files in Visual Studio Code.

 "Compile-on-save" for [LESS stylesheets](http://lesscss.org/) without using a build task.  

# Features

 * Generates a `.css` file each time you save a `.less` file.  
   e.g. `styles.less` --> `styles.css`
  
 * The `.css` file is created in the same directory as the source `.less` file.
 
 * Compile errors integrate with the standard _Errors and Warnings_ list.
 
# Usage

 1. Create a `.less` file.
 2. Hit Ctrl/Cmd+S to save your file.
 3. A `.css` file is automatically generated.

Also available from the command palette as "Compile LESS to CSS".

# Limitations

 * `.map` files are _not_ generated.  
 
 * Less options are currently not configurable.
 
 