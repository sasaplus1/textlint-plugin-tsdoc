import type { DocNode } from '@microsoft/tsdoc';
import type { AnyTxtNode, TxtParentNode } from '@textlint/ast-node-types';

import { ASTNodeTypes } from '@textlint/ast-node-types';
import { DocExcerpt, TSDocParser } from '@microsoft/tsdoc';

import { isNonNullable } from './utility';

/**
 * parse comment as TSDoc
 *
 * @param node - comment node
 * @returns AST for textlint
 */
export function parse(node: TxtParentNode): AnyTxtNode {
  const tsdocParser = new TSDocParser();
  const ParserContext = tsdocParser.parseString(node.raw);
  const docComment = ParserContext.docComment;

  const children = docComment
    .getChildNodes()
    .map((childNode) => traverse(childNode, node))
    .filter(isNonNullable);

  const result = {
    type: ASTNodeTypes.Paragraph,
    children,
    raw: children.map((child) => child.raw).join('')
  } as AnyTxtNode;

  const headChild = children.at(0);
  const tailChild = children.at(-1);

  if (headChild && tailChild) {
    const baseLine = node.loc.start.line;

    result.loc = {
      start: {
        // adjast line
        line: baseLine + headChild.loc.start.line,
        column: headChild.loc.start.column
      },
      end: {
        // adjast line
        line: baseLine + tailChild.loc.end.line,
        column: tailChild.loc.end.column
      }
    };

    const baseRange = node.range.at(0);

    const headRange = headChild.range.at(0);
    const tailRange = tailChild.range.at(-1);

    if (
      typeof baseRange === 'number' &&
      typeof headRange === 'number' &&
      typeof tailRange === 'number'
    ) {
      // adjast range
      result.range = [baseRange + headRange, baseRange + tailRange];
    }
  }

  return result;
}

/**
 * traverse docNode children
 *
 * @param docNode - node of tsdoc
 * @param baseNode - base node
 * @returns node for textlint or null
 */
function traverse(docNode: DocNode, baseNode: AnyTxtNode): AnyTxtNode | null {
  const children = docNode
    .getChildNodes()
    .map((childNode) => traverse(childNode, baseNode))
    .filter(isNonNullable);

  const result = {} as AnyTxtNode;

  result.type = docNode.kind;

  if (docNode instanceof DocExcerpt) {
    const tokens = docNode.content.tokens;

    result.raw = tokens.map((token) => token.toString()).join('');

    // sometimes raw is empty
    if (result.raw === '') {
      return null;
    }

    if (docNode.excerptKind === 'PlainText') {
      /*
       * TODO: I want to parse section as Markdown,
       * but markdown parser is cannot parse TSDoc syntax. (e.g. {@link ...})
       *
       * ```ts
       * import { parse as parseMarkdown } from '@textlint/markdown-to-ast';
       * ```
       */
      Object.assign(result /*, parseMarkdown(result.raw) */, {
        type: ASTNodeTypes.Str,
        // below line is unwanted if use parseMarkdown()
        value: result.raw
      });
    }

    const headToken = tokens.at(0);
    const tailToken = tokens.at(-1);

    if (headToken && tailToken) {
      const headLocation = headToken.range.getLocation(headToken.range.pos);
      const tailLocation = tailToken.range.getLocation(tailToken.range.end);

      result.loc = {
        start: {
          // adjast line
          line: baseNode.loc.start.line - 1 + headLocation.line,
          column: headLocation.column - 1
        },
        end: {
          // adjast line
          line: baseNode.loc.start.line - 1 + tailLocation.line,
          column: tailLocation.column - 1
        }
      };

      const baseRange = baseNode.range.at(0);

      if (typeof baseRange === 'number') {
        result.range = [
          // adjast range
          baseRange + headToken.range.pos,
          baseRange + tailToken.range.end
        ];
      }
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

      if (typeof headRange === 'number' && typeof tailRange === 'number') {
        result.range = [headRange, tailRange];
      }
    }

    result.raw = children.map((child) => child.value || child.raw).join('');
  }

  return result;
}
