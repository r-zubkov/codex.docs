import express, { Request, Response } from 'express';
import appConfig from '../../utils/appConfig.js';
import ogs from 'open-graph-scraper';
import axios from 'axios';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { isUrlInWhiteList } from '../../utils/proxy.js';


const router = express.Router();

interface ResponseData {
  success: number;
  meta?: {
    title: string | undefined;
    description: string | undefined;
    siteName: string | undefined;
    image: { url: string | undefined }
  }
}

/**
 * Accept file url to fetch
 */
router.get('/fetchUrl', async (req: Request, res: Response) => {
  const response: ResponseData = {
    success: 0,
  };

  if (!req.query.url) {
    res.status(400).json(response);

    return;
  }

  if (typeof req.query.url !== 'string') {
    res.status(400).json(response);

    return;
  }

  try {
    const url = req.query.url;
    const isUseProxy = appConfig.frontend.isUseSocksProxy;
    const socksProxy = appConfig.socksProxy;
    const whiteList = socksProxy?.whiteList ?? [];
    const shouldBypassProxy = isUrlInWhiteList(url, whiteList);
    let linkData;

    if (!isUseProxy || shouldBypassProxy) {
      linkData = (await ogs({ url })).result;
    } else {
      if (!socksProxy) {
        throw new Error('SOCKS proxy configuration is missing');
      }

      const proxyHost = socksProxy.ip.includes(':') ? `[${socksProxy.ip}]` : socksProxy.ip;
      const proxyUrl = new URL(`socks5h://${proxyHost}:${socksProxy.port}`);

      proxyUrl.username = socksProxy.user;
      proxyUrl.password = socksProxy.password;

      const socksProxyAgent = new SocksProxyAgent(proxyUrl);

      const request = await axios.get(url, {
        headers: {
          // HTTP header names are not JavaScript identifiers.
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
        },
        httpsAgent: socksProxyAgent,
        httpAgent: socksProxyAgent,
        proxy: false,
        timeout: 10000,
      });

      linkData = (await ogs({
        url: '',
        html: request.data,
      })).result;
    }

    if (!linkData.success) {
      res.status(502).json(response);

      return;
    }

    response.success = 1;
    response.meta = {
      title: linkData.ogTitle,
      description: linkData.ogDescription,
      siteName: linkData.ogSiteName,
      image: {
        url: undefined,
      },
    };

    const image = linkData.ogImage;

    if (image) {
      if (Array.isArray(image)) {
        response.meta.image = { url: image[0].url };
      } else {
        response.meta.image = { url: image.url };
      }
    }

    res.status(200).json(response);
  } catch (e) {
    console.log(e);
    res.status(500).json(response);
  }
});

export default router;
