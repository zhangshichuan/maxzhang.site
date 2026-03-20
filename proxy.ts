import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
 
export default createMiddleware(routing);
 
export const config = {
  // 匹配所有路径，除了 api, _next, 以及静态文件 (如 .ico, .png 等)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
