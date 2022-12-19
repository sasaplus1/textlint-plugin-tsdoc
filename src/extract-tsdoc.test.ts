import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import ts from 'typescript';

import { extractJSDocStyleComments } from './extract-tsdoc';

describe(__filename, function() {
  describe('extractJSDocStyleComments', function() {
    it('returns some JSDoc style comments', function() {
      const block1 = [
        '/**',
        ' * このファイルはテストのファイルです。',
        ' */'
      ];

      const block2 = [
        '/**',
        ' * a と b を足して返します。',
        ' */',
        'function sum(a: number, b: number): number {',
        '  return a + b;',
        '}',
      ];

      const block3 = [
        '/** @type {string} */',
        'let s;'
      ];

      const block4 = [
        '/* これは JSDoc スタイルのコメントではありません */'
      ];

      const AST = [block1, block2, block3, block4].map(
        block => block.join('\n')
      ).join('\n');

      assert.deepStrictEqual(
        extractJSDocStyleComments(AST, ts.ScriptTarget.ES2015),
        [
          block1.join('\n'),
          block2.slice(0,3).join('\n'),
          block3.slice(0, 1).join('\n')
        ]
      );
    });
  });
});
