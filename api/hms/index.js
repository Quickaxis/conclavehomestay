import { handleHmsApiRequest } from '../../server/apiRouter.js';

export default async function handler(req, res) {
  return handleHmsApiRequest(req, res);
}
