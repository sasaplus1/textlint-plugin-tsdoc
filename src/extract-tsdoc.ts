import ts from 'typescript';

/**
 * extract JSDoc style comments
 *
 * @param sourceText - source
 * @param languageVersionOrOptions - language version or options
 * @param fileName - file name
 * @returns extracted JSDoc style comments
 */
export function extractJSDocStyleComments(sourceText: string, languageVersionOrOptions: ts.ScriptTarget | ts.CreateSourceFileOptions, fileName = '<typescript>') {
  const sourceFile = ts.createSourceFile(fileName, sourceText, languageVersionOrOptions);
  const text = sourceFile.getSourceFile().getFullText();

  const commentRanges: { pos: number, end: number }[] = [];

  sourceFile.forEachChild(function(child) {
    commentRanges.push(
      ...getCommentRanges(child, text).map(
        range => ({ pos: range.pos, end: range.end })
      )
    );
  });

  const jsdocComments = unique(
    commentRanges.map(function(range) {
      const { pos, end } = range;

      return text.slice(pos, end);
    })
  );

  return jsdocComments;
}

/**
 * get comment ranges
 *
 * @param node - node
 * @param text - source
 * @returns comment ranges
 */
export function getCommentRanges(node: ts.Node, text: string) {
  const result = [];

  result.push(...(ts.getTrailingCommentRanges(text, node.pos) || []));
  result.push(...(ts.getLeadingCommentRanges(text, node.pos) || []));

  return result.filter(
    (comment) =>
      text.charCodeAt(comment.pos + 1) === 0x2a &&
      text.charCodeAt(comment.pos + 2) === 0x2a &&
      text.charCodeAt(comment.pos + 3) !== 0x2f
  );
}

/**
 * filter out duplicate values
 *
 * @param array - target
 * @returns filter outed array
 */
export function unique<T>(array: Array<T>) {
  return Array.from(new Set(array));
}
