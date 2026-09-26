import { domainToASCII } from 'url';

/**
 * Normalizes a hostname rule from the proxy whitelist.
 *
 * A leading dot marks a domain suffix, for example `.ru`.
 * Rules without a leading dot match the exact hostname and its subdomains.
 *
 * @param value - raw whitelist rule
 */
function normalizeRule(value: string): string | undefined {
  const trimmedValue = value.trim().toLowerCase()
    .replace(/\.$/, '');

  if (!trimmedValue) {
    return undefined;
  }

  const isSuffix = trimmedValue.startsWith('.');
  const domain = domainToASCII(isSuffix ? trimmedValue.slice(1) : trimmedValue);

  if (!domain) {
    return undefined;
  }

  return isSuffix ? `.${domain}` : domain;
}

/**
 * Checks whether a URL should bypass the configured SOCKS proxy.
 *
 * @param url - URL to check
 * @param whiteList - hostname rules that should be fetched directly
 */
export function isUrlInWhiteList(url: string, whiteList: string[]): boolean {
  let hostname: string;

  try {
    hostname = new URL(url).hostname.toLowerCase().replace(/\.$/, '');
  } catch {
    return false;
  }

  return whiteList.some((item) => {
    const rule = normalizeRule(item);

    if (!rule) {
      return false;
    }

    if (rule.startsWith('.')) {
      return hostname.endsWith(rule);
    }

    return hostname === rule || hostname.endsWith(`.${rule}`);
  });
}
