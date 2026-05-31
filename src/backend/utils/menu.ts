import { EntityId } from '../database/types.js';
import { PageNavigationData } from '../models/page.js';
import PageOrder from '../models/pageOrder.js';

export interface MenuPage {
  _id: EntityId;
  title: string;
  uri?: string;
  children: MenuPage[];
}

/**
 * Process one-level pages list to parent-children list
 *
 * @param parentPageId - parent page id
 * @param pages - list of all available pages
 * @param pagesOrder - list of pages order
 * @param level - max level recursion
 */
export function createMenuTree(parentPageId: EntityId, pages: PageNavigationData[], pagesOrder: PageOrder[], level = 1): MenuPage[] {
  const pagesById = new Map<string, PageNavigationData>();
  const pagesByParent = new Map<string, PageNavigationData[]>();
  const ordersByPage = new Map<string, EntityId[]>();

  pages.forEach(page => {
    if (!page._id) {
      return;
    }

    pagesById.set(page._id.toString(), page);

    const parent = page.parent || '0' as EntityId;
    const parentKey = parent.toString();
    const siblings = pagesByParent.get(parentKey) || [];

    siblings.push(page);
    pagesByParent.set(parentKey, siblings);
  });

  pagesOrder.forEach(order => {
    if (order.page) {
      ordersByPage.set(order.page.toString(), order.order);
    }
  });

  const buildTree = (currentParentId: EntityId, currentLevel: number): MenuPage[] => {
    const childrenOrder = ordersByPage.get(currentParentId.toString()) || [];

    /**
     * branch is a page children in tree
     * if we got some children order on parents tree, then we push found pages in order sequence
     * otherwise just find all pages includes parent tree
     */
    let ordered: PageNavigationData[] = [];

    if (childrenOrder.length > 0) {
      ordered = childrenOrder
        .map(pageId => pagesById.get(pageId.toString()))
        .filter((page): page is PageNavigationData => Boolean(page));
    }

    const unordered = pagesByParent.get(currentParentId.toString()) || [];
    const branch = Array.from(new Set([...ordered, ...unordered]));

    /**
     * stop recursion when we got the passed max level
     */
    if (currentLevel === level + 1) {
      return [];
    }

    /**
     * Each parents children can have subbranches
     */
    return branch.filter((page): page is PageNavigationData & { _id: EntityId } => Boolean(page && page._id)).map(page => ({
      _id: page._id,
      title: page.title || '',
      uri: page.uri || '',
      children: buildTree(page._id, currentLevel + 1),
    }));
  };

  return buildTree(parentPageId, 1);
}
