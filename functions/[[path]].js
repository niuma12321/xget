import { handleRequest } from '../src/app/handle-request.js';

/**
 * @typedef {{
 *   request: Request,
 *   env: Record<string, unknown>,
 *   params: object,
 *   waitUntil: (promise: Promise<unknown>) => void,
 *   next: () => Promise<Response>,
 *   data: object
 * }} PagesFunctionContext
 */

/**
 * Pages Function handler for all routes.
 */
export async function onRequest(context) {
  const { request, env, waitUntil } = context;
  const url = new URL(request.url);

  // ========== 优先拦截根路径，返回你的自定义首页 ==========
  if (url.pathname === '/' || url.pathname === '/index.html') {
    // 从 Pages 静态资源中读取 index.html
    const indexRequest = new Request(new URL('/index.html', request.url));
    const indexResponse = await env.ASSETS.fetch(indexRequest);
    
    if (indexResponse.ok) {
      return new Response(indexResponse.body, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache' // 禁止缓存，避免更新不生效
        }
      });
    }
  }

  // 创建兼容的 ExecutionContext
  const ctx = {
    waitUntil,
    passThroughOnException: () => {
      console.warn('passThroughOnException is not supported in Pages Functions');
    }
  };

  // 非根路径，走原代理逻辑
  return handleRequest(request, env, ctx);
}
