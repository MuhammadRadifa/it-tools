import { Checks } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.hash-compare.title'),
  path: '/hash-compare',
  description: translate('tools.hash-compare.description'),
  keywords: [
    'hash',
    'digest',
    'compare',
    'match',
    'verify',
    'crypto',
    'security',
    'MD5',
    'SHA1',
    'SHA256',
    'SHA224',
    'SHA512',
    'SHA384',
    'SHA3',
    'RIPEMD160',
  ],
  component: () => import('./hash-compare.vue'),
  icon: Checks,
});
