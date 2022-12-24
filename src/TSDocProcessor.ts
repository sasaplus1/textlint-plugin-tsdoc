import type { TextlintPluginOptions } from '@textlint/types';

import ts from 'typescript';

import {
  createDocumentNode,
  extractJSDocComments,
  getJSDocRanges
} from './comment';
import { parse } from './tsdoc-to-ast';

export class TSDocProcessor {
  config: TextlintPluginOptions;
  extensions: string[];
  tsconfig: ts.ScriptTarget | ts.CreateSourceFileOptions;

  constructor(config = {}) {
    this.config = config;
    this.extensions = this.config['extensions'] || [];
    this.tsconfig = this.config['tsconfig'] || ts.ScriptTarget.ES3;
  }

  availableExtensions() {
    return [...this.extensions, '.ts', '.cts', '.mts', '.tsx'];
  }

  processor(/* ext: string */) {
    const { tsconfig } = this;

    return {
      preProcess(text: string, filePath: string) {
        const sourceFile = ts.createSourceFile(
          filePath || '<typescript>',
          text,
          tsconfig || ts.ScriptTarget.ES3
        );

        const documentNode = createDocumentNode(sourceFile);
        const jsdocRanges = getJSDocRanges(sourceFile);
        const jsdocNodes = extractJSDocComments(sourceFile, jsdocRanges);

        const children = jsdocNodes.map(parse);

        documentNode.children = children;

        return documentNode;
      },
      postProcess(messages: unknown[], filePath?: string) {
        return {
          messages,
          filePath: filePath || '<typescript>'
        };
      }
    };
  }
}
