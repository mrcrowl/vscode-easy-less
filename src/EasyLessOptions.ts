
import * as less from 'less';

interface EasyLessOptions extends Less.Options
{
    main?: string;
    out?: string | boolean;
    sourceMap?: any;
    // sourceMapURL?: string;
    // sourceMapBasepath?: string;
    // sourceMapRootpath?: string;
    // outputSourceFiles?: boolean;
    // sourceMapFileInline?: boolean;
    // sourceMapFilename?: string;
}

export = EasyLessOptions;