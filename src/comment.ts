import type { TxtParentNode } from '@textlint/ast-node-types';

import ts from 'typescript';
import { ASTNodeTypes } from '@textlint/ast-node-types';

type JSDocCommentRange = Pick<ts.CommentRange, 'pos' | 'end'>;

/**
 * create document node for textlint
 *
 * @param sourceFile - ts.SourceFile
 * @returns TxtParentNode
 */
export function createDocumentNode(sourceFile: ts.SourceFile): TxtParentNode {
  const startPosition = ts.getLineAndCharacterOfPosition(
    sourceFile,
    sourceFile.pos
  );
  const endPosition = ts.getLineAndCharacterOfPosition(
    sourceFile,
    sourceFile.end
  );

  const result: TxtParentNode = {
    type: ASTNodeTypes.Document,
    children: [],
    loc: {
      start: {
        line: startPosition.line + 1,
        column: startPosition.character
      },
      end: {
        line: endPosition.line + 1,
        column: endPosition.character
      }
    },
    range: [sourceFile.pos, sourceFile.end],
    raw: sourceFile.getFullText()
  };

  return result;
}

/**
 * extract JSDoc style comments
 *
 * @param sourceFile - ts.SourceFile
 * @param jsdocRanges - JSDoc comment ranges
 * @returns TxtParentNode
 */
export function extractJSDocComments(
  sourceFile: ts.SourceFile,
  jsdocRanges: JSDocCommentRange[]
): TxtParentNode[] {
  const text = sourceFile.getSourceFile().getFullText();

  const result = jsdocRanges.map<TxtParentNode>(function (range) {
    const { pos, end } = range;

    const startPosition = ts.getLineAndCharacterOfPosition(sourceFile, pos);
    const endPosition = ts.getLineAndCharacterOfPosition(sourceFile, end);

    return {
      type: ASTNodeTypes.Paragraph,
      children: [],
      loc: {
        start: {
          line: startPosition.line + 1,
          column: startPosition.character
        },
        end: {
          line: endPosition.line + 1,
          column: endPosition.character
        }
      },
      range: [pos, end],
      raw: text.slice(pos, end)
    };
  });

  return result;
}

/**
 * get JSDoc style comment ranges
 *
 * @param sourceFile - ts.SourceFile
 * @returns JSDoc style comment ranges
 */
export function getJSDocRanges(sourceFile: ts.SourceFile): JSDocCommentRange[] {
  const text = sourceFile.getSourceFile().getFullText();

  const result: JSDocCommentRange[] = [];

  sourceFile.forEachChild(function (child) {
    const commentRanges = getCommentRanges(child, text)
      .filter(function (comment) {
        const { pos } = comment;

        // filter JSDoc style comments
        return (
          text[pos + 1] === '*' &&
          text[pos + 2] === '*' &&
          text[pos + 3] !== '/'
        );
      })
      .map((range) => ({
        pos: range.pos,
        end: range.end
      }));

    result.push(...commentRanges);
  });

  return result;
}

/**
 * get comment ranges
 *
 * @param node - node
 * @param text - source
 * @returns comment ranges
 */
function getCommentRanges(node: ts.Node, text: string): ts.CommentRange[] {
  const ranges: ts.CommentRange[] = [];

  ranges.push(
    ...(ts.getLeadingCommentRanges(text, node.pos) || []),
    ...(ts.getTrailingCommentRanges(text, node.pos) || [])
  );

  // filter out duplicated values
  const result = ranges.reduce<ts.CommentRange[]>(function (acc, range) {
    const isDuplicate = acc.some(
      (r) => r.pos === range.pos && r.end === range.end
    );

    if (!isDuplicate) {
      acc.push(range);
    }

    return acc;
  }, []);

  return result;
}
