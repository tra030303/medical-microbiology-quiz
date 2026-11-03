import { SCAN_INDEX } from '../data/scan-index.js';
const scanPacks = new Map();
export async function resolveScanSource(source) {
  if (typeof source !== 'string' || !source.startsWith('./data/past-images/')) return source;
  const name = source.slice('./data/past-images/'.length);
  const pack = SCAN_INDEX?.[name];
  if (!pack) return source;
  if (!/^part-\d+\.js$/.test(pack)) throw new Error('Invalid image pack');
  if (!scanPacks.has(pack)) scanPacks.set(pack, import('../data/scan-packs/' + pack));
  const module = await scanPacks.get(pack);
  const result = module.SCANS?.[name];
  if (typeof result !== 'string' || !/^data:image\/webp;base64,[A-Za-z0-9+/=]+$/.test(result)) throw new Error('Question image was not found');
  return result;
}
export function bindScanImage(image, source) {
  resolveScanSource(source).then(value=>{ image.src=value; }).catch(()=>{image.alt='원문 그림을 불러오지 못했습니다. 새로고침해 주세요.';image.classList.add('image-load-failed');});
}
