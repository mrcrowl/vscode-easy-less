import * as path from "path";

import * as vscode from 'vscode';
import * as less from "less";

export class LessDocumentResolverPlugin implements Less.Plugin
{
    install(less: LessStatic, pluginManager: Less.PluginManager)
    {
        pluginManager.addPreProcessor(new LessDocumentResolver());
    }
}

class LessDocumentResolver implements Less.PreProcessor
{
    process(src: string, extra: Less.PreProcessorExtraInfo)
    {
        const file = path.normalize(path.resolve(extra.fileInfo.entryPath, extra.fileInfo.filename));
        const document = vscode.workspace.textDocuments.find(document => document.fileName == file);
        if (document !== undefined)
            return document.getText();
        return src;
    }
}
