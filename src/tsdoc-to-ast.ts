import type { DocNode } from '@microsoft/tsdoc';
import type { AnyTxtNode } from '@textlint/ast-node-types';

import { ASTNodeTypes } from '@textlint/ast-node-types';
import { DocExcerpt, TSDocParser } from '@microsoft/tsdoc';

/**
 * parse JSDoc style comment
 *
 * @param docCommentText - JSDoc style comment string
 * @returns AST for textlint
 */
export function parse(docCommentText: string): AnyTxtNode {
  const tsdocParser = new TSDocParser();
  const ParserContext = tsdocParser.parseString(docCommentText);
  const docComment = ParserContext.docComment;

  const children = docComment
    .getChildNodes()
    .map(traverse)
    .filter(isNonNullable);

  const headChild = children.at(0);
  const tailChild = children.at(-1);

  const documentNode = {
    type: ASTNodeTypes.Document,
    children,
    raw: children.map(child => child.raw).join('')
  } as AnyTxtNode;

  if (headChild && tailChild) {
    documentNode.loc = {
      start: headChild.loc.start,
      end: tailChild.loc.end
    };

    const headRange = headChild.range.at(0);
    const tailRange = tailChild.range.at(-1);

    if (headRange && tailRange) {
      documentNode.range = [
        headRange,
        tailRange
      ];
    }
  }

  return documentNode;
}

/**
 * traverse docNode children
 *
 * @param docNode - node of tsdoc
 * @returns node for textlint or null
 */
export function traverse(docNode: DocNode): AnyTxtNode | null {
  const children = docNode
    .getChildNodes()
    .map(traverse)
    .filter(isNonNullable);

  const result = {} as AnyTxtNode;

  result.type = docNode.kind;

  if (docNode instanceof DocExcerpt) {
    if (docNode.excerptKind === 'PlainText') {
      result.type = ASTNodeTypes.Str;
    }

    const tokens = docNode.content.tokens;

    result.value = tokens.map(
      token => token.toString()
    ).join('');
    result.raw = result.value;

    // sometimes
    if (result.value === '') {
      return null;
    }

    const headToken = tokens.at(0);
    const tailToken = tokens.at(-1);

    if (headToken && tailToken) {
      const headLocation = headToken.range.getLocation(headToken.range.end);
      const tailLocation = tailToken.range.getLocation(tailToken.range.end);

      result.loc = {
        start: {
          line: headLocation.line,
          column: headLocation.column - 1
        },
        end: {
          line: tailLocation.line,
          column: tailLocation.column - 1
        }
      };
      result.range = [
        headToken.range.pos,
        tailToken.range.end
      ];
    }
  }

  if (children.length > 0) {
    result.children = children;

    const headChild = children.at(0);
    const tailChild = children.at(-1);

    if (headChild && tailChild) {
      result.loc = {
        start: headChild.loc.start,
        end: tailChild.loc.end
      };

      const headRange = headChild.range.at(0);
      const tailRange = tailChild.range.at(-1);

      if (headRange && tailRange) {
        result.range = [
          headRange,
          tailRange
        ];
      }
    }

    result.raw = children.map(
      child => child.value || child.raw
    ).join('');
  }

  return result;
}

/**
 * filter out nullable
 *
 * @param value - any value
 * @returns return true if value is not null or undefined
 */
export function isNonNullable<T>(
  value: T | null | undefined
): value is NonNullable<T> {
  return value !== null && value !== undefined;
}
