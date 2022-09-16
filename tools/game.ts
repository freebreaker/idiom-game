import AllJson from './cyches.json'

/**
 * 
 * @param word 被包含的词语
 * @returns 成语数组
 */
export const getWordContainArr = (word: string) => {
  return AllJson.filter((i) => i.words.includes(word)).map((j) => j.words)
}

export const getRandomWord = () => {
  const random = Math.floor(Math.random() * AllJson.length)
  return AllJson[random].words
}