/**********************************************************
 * Application loader
 * Avoids circular dependencies between page and templates
 *  app -> page
 *  app -> templates -> page
 **********************************************************/

import * as templates from './app/templates.js';
import { page } from './app/page.js';

page.templates = templates;
