import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { test, isTxtAST } from '@textlint/ast-tester';

import { parse } from './tsdoc-to-ast';

describe(__filename, function() {
  describe('parse', function() {
    it('return valid AST', function() {
      const AST = parse(`
        /**
         * a と b を足して返します。
         *
         * @internal
         * @param a - 値 a です
         * @param b - 値 b です
         * @returns a と b を足した値を返します。
         *
         * @remarks
         * 簡単な関数なので特筆すべきことはありません。
         * テストなのでいろいろと書いています。
         * remarks は 3 行書いて見ています。
         *
         * @privateRemarks
         * 簡単な関数なので特筆すべきことはありません。
         * テストなのでいろいろと書いています。
         *
         * ここでは Markdown を書いてみます。
         * **ここは強調です。**
         *
         * \`\`\`html
         * <p>ここはコードブロックです。</p>
         * \`\`\`
         *
         * <i>HTMLタグも書いてみます。</i>
         */
        function sum(a: number, b: number): number {
          return a + b;
        }
      `.trim());

      assert(isTxtAST(AST));
      assert.doesNotThrow(function() {
        test(AST);
      });
    });
  });
});
