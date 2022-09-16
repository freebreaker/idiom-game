export interface IWord {
  x: number
  y: number
  word: string
  direction?: number;
  isLock?: boolean
}

interface IIdiom {
  /**
   * 成语 比如 一心一意
   */
  text: string
  /**
   * 0 横向 1竖向
   */
  direction: number
  /**
   * [{ x: 3, y: 4, word:'一‘, isLock:false}]
   */
  words: [IWord]
}

export type Poem = IIdiom[]

export class Info {
  all: {
    /**
     * 包含字的所有成语
     * 第单数个成语横放,第双数个成语竖着放
     * { "一": ["一心一意","一往无前","沆瀣一气"]}
     */
    [prop: string]: string[]
  }
  constructor(word: string) {
    this.all = {
      [word]: this.getAllWords(word)
    }
  }

  /**
   * 
   * 不可用包括：超出边界, 单词和已有成语的所有坐标重合 且重合的字不同
   * @param words  成语 
   * @param _direction  方向
   * @param _word 成语根 
   * @returns boolean 是否可用
   */
  check(words: IWord[], _direction: number, _word: IWord) {
    console.log(words)
    return true
  }

  getAllWords(word: string) {
    return [word]
  }
}