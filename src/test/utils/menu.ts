import { expect } from 'chai';
import PageOrder from '../../backend/models/pageOrder.js';
import { EntityId } from '../../backend/database/types.js';
import { createMenuTree } from '../../backend/utils/menu.js';

const id = (value: string): EntityId => value as EntityId;

describe('Menu utils', () => {
  it('Builds ordered menu tree from lightweight page data', () => {
    const pages = [
      {
        _id: id('unordered-root'),
        title: 'Unordered root',
        uri: 'unordered-root',
        parent: id('0'),
      },
      {
        _id: id('ordered-root'),
        title: 'Ordered root',
        uri: 'ordered-root',
        parent: id('0'),
      },
      {
        _id: id('ordered-child'),
        title: 'Ordered child',
        uri: 'ordered-child',
        parent: id('ordered-root'),
      },
      {
        _id: id('deep-child'),
        title: 'Deep child',
        uri: 'deep-child',
        parent: id('ordered-child'),
      },
    ];
    const pagesOrder = [
      new PageOrder({
        page: id('0'),
        order: [id('ordered-root')],
      }),
      new PageOrder({
        page: id('ordered-root'),
        order: [id('ordered-child')],
      }),
      new PageOrder({
        page: id('ordered-child'),
        order: [id('deep-child')],
      }),
    ];

    const menu = createMenuTree(id('0'), pages, pagesOrder, 2);

    expect(menu.map(page => page._id.toString())).to.deep.equal([
      'ordered-root',
      'unordered-root',
    ]);
    expect(menu[0].children.map(page => page._id.toString())).to.deep.equal([
      'ordered-child',
    ]);
    expect(menu[0].children[0].children).to.deep.equal([]);
    expect((menu[0] as typeof menu[number] & { body?: unknown }).body).to.be.undefined;
  });
});
