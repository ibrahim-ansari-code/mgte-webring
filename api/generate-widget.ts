import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { url, deployUrl } = req.body || {};
    const siteUrl: string = (url || '').replace(/\/$/, '');
    const base: string = deployUrl || '';
    const html = `
<div style="display:flex;align-items:center;gap:8px">
  <a href="${base}/#${encodeURIComponent(siteUrl)}?nav=prev" aria-label="Previous site">←</a>
  <a href="${base}/#${encodeURIComponent(siteUrl)}" target="_blank" aria-label="MGTE Webring">
    <img src="https://uwaterloo.ca/sites/default/files/uploads/images/university-of-waterloo-logo.svg" alt="UW Logo" style="width:24px;height:auto;opacity:.85" />
  </a>
  <a href="${base}/#${encodeURIComponent(siteUrl)}?nav=next" aria-label="Next site">→</a>
</div>`;
    return res.status(200).json({ html });
  } catch (e: any) {
    return res.status(200).json({ html: '' });
  }
}


