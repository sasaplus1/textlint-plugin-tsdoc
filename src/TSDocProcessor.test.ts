import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { test, isTxtAST } from '@textlint/ast-tester';

import { TSDocProcessor } from './TSDocProcessor';

describe(__filename, function () {
  describe('TSDocProcessor', function () {
    describe('processor', function () {
      describe('preProcess', function () {
        it('returns valid textlint AST', function () {
          const tsdocProcessor = new TSDocProcessor();
          const processor = tsdocProcessor.processor();

          const result = processor.preProcess(
            [
              '/**',
              ' * ファイルの概要です。',
              ' */',
              '',
              '/**',
              ' * a と b を足して返します。',
              ' *',
              ' * @internal',
              ' * @param a - 値 a です',
              ' * @param b - 値 b です',
              ' * @returns a と b を足した値を返します。',
              ' *',
              ' * @remarks',
              ' * ここは remarks です。',
              ' */',
              'function sum(a: number, b: number): number {',
              '  return a + b;',
              '}'
            ].join('\n'),
            '<typescript>'
          );

          assert(isTxtAST(result));

          assert.doesNotThrow(function () {
            test(result);
          });
        });
      });
    });
  });
});
