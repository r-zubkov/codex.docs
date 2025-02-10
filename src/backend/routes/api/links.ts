import express, { Request, Response } from 'express';
import appConfig from '../../utils/appConfig.js';
import ogs from 'open-graph-scraper';
import axios from 'axios';
import { SocksProxyAgent } from "socks-proxy-agent"


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
    return;
  }

  try {
    const url = req.query.url
    const isUseProxy = appConfig.frontend.isUseSocksProxy
    const socksProxy = appConfig.socksProxy
    const whiteList = socksProxy?.whiteList
    let linkData

    if (!isUseProxy || (isUseProxy && whiteList && whiteList.some(item => url.includes(item)))
    ) {
      linkData = (await ogs({ url })).result;
    } else {
      const torProxyAgent = new SocksProxyAgent(`socks://${socksProxy?.user}:${socksProxy?.password}@${socksProxy?.ip}:${socksProxy?.port}`);

      const request = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36"
        },
        httpsAgent: torProxyAgent,
        httpAgent: torProxyAgent,
      });
  
      linkData = (await ogs({ url: '', html: request.data })).result;
    }

    if (!linkData.success) {
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
