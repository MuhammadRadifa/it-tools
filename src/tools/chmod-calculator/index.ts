import { FileInvoice } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.chmod-calculator.title'),
  path: '/chmod-calculator',
  description: translate('tools.chmod-calculator.description'),
  keywords: [
    'chmod',
    'chown',
    'calculator',
    'converter',
    'file',
    'permission',
    'files',
    'directory',
    'folder',
    'recursive',
    'generator',
    'octal',
    'symbolic',
    'script',
    'setuid',
    'sticky',
  ],
  component: () => import('./chmod-calculator.vue'),
  icon: FileInvoice,
});
