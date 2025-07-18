/**
 * 用于生成各种名称、头像等
 * @Date 23/11/18
 * @Author zhanghan
 */

import { randomUUID } from "@midwayjs/core/dist/util/uuid";

export let names = ['AI爱好者', 'AI探险家', 'AI研究员', 'AI大师', 'AI工程师', 'AI学习者', 'AI魔法师', 'AI战神']

/**
 * 生成随机昵称
 * 不传值，则生成类似 AI爱好者12345
 * @param pres 前置字符串数组
 * @param ends 后置字符数组
 * @returns 
 */
export function generateNickName(ends?: string[], pres: string[] = names) {
  const randomPre = pres[Math.floor(Math.random() * pres.length)];
  const randomEnd = ends ? ends[Math.floor(Math.random() * ends.length)] : Math.floor(Math.random() * 100000);
  return `${randomPre}${randomEnd}`;
}

/**
 * 随机生成username
 * 用uuid
 */
export function generateUsername() {
  return randomUUID().replace(/-/g, '');
}