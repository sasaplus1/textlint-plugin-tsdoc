import {
  type AnyTxtNode,
  type TxtParentNode,
  type TxtTextNode
} from '@textlint/ast-node-types';

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

/***/
export function isTxtParentNode(value: AnyTxtNode): value is TxtParentNode {
  return 'children' in value && Array.isArray(value.children);
}

/***/
export function isTxtTextNode(value: AnyTxtNode): value is TxtTextNode {
  return 'value' in value && typeof value.value === 'string';
}
