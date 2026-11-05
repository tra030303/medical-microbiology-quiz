import { SCAN_INDEX } from '../data/scan-index.js';
import { QUESTION_IMAGE_INDEX } from '../data/question-image-index.js';

const imagePacks = new Map();
export function isSafeScanSource(source) {
  return typeof source === 'string' && (
    /^\.\/data\/(?:past-images|question-images)\/[a-z0-9-]+\.webp$/.test(source) ||
    /^data:image\/webp;base64,[A-Za-z0-9+/]+={0,2}$/.test(source)
  );
}
export async function resolveScanSource(source) {
  if (!isSafeScanSource(source)) throw new Error('Invalid question image');
  if (source.startsWith('data:')) return source;
  const isQuestionImage = source.startsWith('./data/question-images/');
  const prefix = isQuestionImage ? './data/question-images/' : './data/past-images/';
  const name = source.slice(prefix.length);
  const index = isQuestionImage ? QUESTION_IMAGE_INDEX : SCAN_INDEX;
  const pack = index?.[name];
  if (!pack) return source;
  if (!/^part-\d+\.js$/.test(pack)) throw new Error('Invalid image pack');
  const directory = isQuestionImage ? 'question-image-packs' : 'scan-packs';
  const key = directory + '/' + pack;
  if (!imagePacks.has(key)) imagePacks.set(key, import('../data/' + directory + '/' + pack));
  const module = await imagePacks.get(key);
  const result = module.SCANS?.[name];
  if (typeof result !== 'string' || !/^data:image\/webp;base64,[A-Za-z0-9+/]+={0,2}$/.test(result)) throw new Error('Question image was not found');
  return result;
}
export function bindScanImage(image, source) {
  return resolveScanSource(source).then(value => { image.src = value; return value; }).catch(() => {
    image.alt = '그림을 불러오지 못했습니다. 새로고침해 주세요.';
    image.classList.add('image-load-failed');
    return null;
  });
}
