import { expect } from 'chai';
import { isUrlInWhiteList } from '../../backend/utils/proxy.js';

describe('Proxy utils', () => {
  it('Treats an empty whitelist as no proxy bypass rules', () => {
    expect(isUrlInWhiteList('https://example.ru', [])).to.be.false;
    expect(isUrlInWhiteList('https://example.ru', [ '' ])).to.be.false;
    expect(isUrlInWhiteList('https://example.ru', [ '   ' ])).to.be.false;
  });

  it('Matches domain suffix rules', () => {
    const whiteList = [ '.ru' ];

    expect(isUrlInWhiteList('https://example.ru', whiteList)).to.be.true;
    expect(isUrlInWhiteList('https://api.example.ru/page', whiteList)).to.be.true;
    expect(isUrlInWhiteList('https://example.ru.evil.com', whiteList)).to.be.false;
  });

  it('Matches an exact hostname and its subdomains', () => {
    const whiteList = [ 'example.com' ];

    expect(isUrlInWhiteList('https://example.com', whiteList)).to.be.true;
    expect(isUrlInWhiteList('https://cdn.example.com', whiteList)).to.be.true;
    expect(isUrlInWhiteList('https://notexample.com', whiteList)).to.be.false;
  });

  it('Does not match rules found only in the URL path or query', () => {
    const whiteList = [ 'example.com' ];

    expect(isUrlInWhiteList('https://evil.com/example.com', whiteList)).to.be.false;
    expect(isUrlInWhiteList('https://evil.com/?url=example.com', whiteList)).to.be.false;
  });

  it('Ignores empty entries alongside valid rules', () => {
    const whiteList = [ '', '  ', '.ru', 'example.com' ];

    expect(isUrlInWhiteList('https://example.ru', whiteList)).to.be.true;
    expect(isUrlInWhiteList('https://example.com', whiteList)).to.be.true;
    expect(isUrlInWhiteList('https://example.org', whiteList)).to.be.false;
  });
});
