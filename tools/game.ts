// import AllJson from './cyches.json'
import AllJson from './cyches2.json'
import SimpleJson from './xdhycycds.json'
import DifficultJson from './idiom8.json'
import NormalJson from './idiom6.json'
import EasyJson from './idiom4.json'
import _ from 'lodash'

/**
 * 
 * @param word 被包含的词语
 * @returns 成语数组
 */
export const getWordContainArr = (word: string) => {
  return AllJson.filter((i) => i.words.includes(word)).map((j) => j.words)
}

export const getRandomWord = () => {
  const random = Math.floor(Math.random() * SimpleJson.length)
  return SimpleJson[random].words
}
export const getRandomEasyRecord = (sort: number, random?: boolean) => {
  const randomIndex = _.random(300, EasyJson.length - 1)
  if (random) {
    return EasyJson[randomIndex]
  }
  return EasyJson[sort - 1]
}
export const getRandomNormalRecord = (sort: number, random?: boolean) => {
  const randomIndex = _.random(300, NormalJson.length - 1)
  if (random) {
    return NormalJson[randomIndex]
  }
  return NormalJson[sort - 1]
  // const random = Math.floor(Math.random() * NormalJson.length)
  // return NormalJson[sort - 1]
}
export const getRandomDifficultRecord = (sort: number, random?: boolean) => {
  // const random = Math.floor(Math.random() * DifficultJson.length)
  // return DifficultJson[random]
  const fourDifficultJson = DifficultJson.filter((i) => i.matrix_space.length === 39)
  console.log(fourDifficultJson.length)
  const randomIndex = _.random(300, fourDifficultJson.length - 1)
  if (random) {
    return fourDifficultJson[randomIndex]
  }
  return fourDifficultJson[sort - 1]
  // return DifficultJson[sort - 1]
}

export const checkIsHidden = (str: string) => {
  return str[0] === '['
}

export const wordGenerate = (str: string) => {
  if (str[0] === '[') {
    return str[1]
  } else {
    return `[${str}]`
  }
}
export function getQueryString(name: string) {
  let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  let r = window.location.search.substr(1).match(reg);
  if (r != null) {
    return decodeURIComponent(r[2]);
  };
  return null;
}


export const MD5 = async (str: string) => {
  const { createHash } = await import('crypto');
  let md5sum = createHash('md5');
  md5sum.update(str);
  str = md5sum.digest('hex');
  return str;
};