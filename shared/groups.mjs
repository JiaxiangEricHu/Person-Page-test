/** Stable IDs keep projects in their column when its name or position changes. */
export function normalizeGroups(input) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 12) throw Error('分组数量需要为 1–12 列。');
  const groups = input.map((value, i) => typeof value === 'string'
    ? {id:`group-${String(i+1).padStart(2,'0')}`, name:value, keywords:[], logo:'', color:'#c7a66e', visibleRows:24, enabled:true}
    : {...value});
  const ids = new Set();
  for (const g of groups) {
    if (typeof g.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(g.id || '') || ids.has(g.id)) throw Error('每列 ID 需唯一，使用小写英文、数字或短横线。');
    ids.add(g.id);
    if (typeof g.name !== 'string' || !g.name.trim()) throw Error('分组名称不能为空。');
    if (!Array.isArray(g.keywords) || g.keywords.some(x=>typeof x!=='string')) throw Error(`${g.id}: 关键词需要文本数组。`);
    if (typeof g.logo !== 'string' || (g.logo && !/^uploads\/[a-zA-Z0-9_./-]+\.(png|jpe?g|webp|gif|avif|svg)$/i.test(g.logo)) || g.logo.split('/').includes('..') || g.logo.includes('//')) throw Error(`${g.id}: Logo 使用 uploads/文件名.png 等本地图片路径。`);
    if (!/^#[a-f0-9]{6}$/i.test(g.color)) throw Error(`${g.id}: 颜色需要 #RRGGBB。`);
    if (!Number.isInteger(g.visibleRows) || g.visibleRows < 1 || g.visibleRows > 48) throw Error(`${g.id}: 同时显示行数需要为 1–48 的整数。`);
    if (typeof g.enabled !== 'boolean') throw Error(`${g.id}: enabled 需要 true 或 false。`);
    for (const k of Object.keys(g)) if (!['id','name','keywords','logo','color','visibleRows','enabled'].includes(k)) throw Error(`${g.id}: 未知字段 ${k}`);
  }
  return groups;
}
export function groupFor(groups, value) {
  return typeof value === 'number' ? groups[value - 1] : groups.find(g=>g.id===value);
}
