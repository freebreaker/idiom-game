
import { Button, Form, InputNumber, message } from 'antd'
import type { GetStaticPropsContext, NextPage } from 'next'
import { useCallback, useEffect, useState } from 'react'
import { checkIsHidden, getQueryString, getRandomNormalRecord, getRandomWord, getWordContainArr, MD5, wordGenerate } from '../../../tools/game'
import { IWord } from '../../api/game'
import styles from './index.module.scss'
import dynamic from 'next/dynamic'
import axios from 'axios'
import _ from 'lodash'
const ReactJson = dynamic(() => import('react-json-view'), { ssr: false })

// const xBlockNum = 10
// const yBlockNum = 10
let wordDic: {
  [prop in string]: string[]
} = {}

let idiomDic: {
  [prop in string]: IWord
} = {}
let matrixRecord: string[] = []

let postionXY = {
  x: [] as number[],
  y: [] as number[]
}

const createData = (xBlockNum: number, yBlockNum: number) => {
  return Array.from({ length: yBlockNum }).map((i) => (
    [
      ...Array.from({ length: xBlockNum }).map(() => '')
    ]
  ))
}
let initData: string[][]
let refreshAmount = 300
let refreshCount = 300
// 如果有了 不发请求
let refreshDataQueue: string[] = []


const Game: NextPage = (props) => {
  const easy = 2
  const key = 'update'
  const [idiomCount, setIdiomCount] = useState(6)
  const [sortRecord, setSortRecord] = useState(0)
  const [xBlockNum, setXBlockNum] = useState(16)
  const [yBlockNum, setYBlockNum] = useState(6)
  const [submitCountLock, setSubmitCountLock] = useState(false)
  initData = createData(xBlockNum, yBlockNum)
  const [data, setData] = useState<string[][]>([])
  // const [data, setData] = useState<string[][]>(createData(xBlockNum, yBlockNum))
  const [rendered, setRendered] = useState(false)
  const [id, setId] = useState<string>()

  useEffect(() => {
    const paramId = getQueryString('id')
    if (paramId) {
      setId(paramId)
      axios.get(`/level/${paramId}`, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      }).then((res) => {
        const matrix = res.data.matrix
        matrixRecord = res.data.matrix_space.split(',')
        setData(JSON.parse(matrix))
        setSortRecord(res.data.sort)
      })
    } else {
      initData = createData(xBlockNum, yBlockNum)
      setData(initData)
      setTimeout(() => {
        refresh()
      }, 1000);
    }

  }, [xBlockNum, yBlockNum, idiomCount])

  const refresh = () => {
    wordDic = {}
    idiomDic = {}
    matrixRecord = []
    postionXY = {
      x: [],
      y: [],
    }
    message.loading({ content: '生成中', key })
    const firstIdiom = getRandomWord()
    console.log('first', firstIdiom)
    const randomY = _.random(-1, 1)
    const randomX = _.random(2, 4)
    const centerX = parseInt((xBlockNum / 2).toString())
    const centerY = parseInt((yBlockNum / 2).toString())
    const result = renderData({
      x: centerX - randomX,
      y: centerY - randomY,
      word: firstIdiom
    }, idiomCount, 0).then((res) => {
      console.log(res, idiomCount)
    })
  }

  const renderData = async (idiom: IWord, count: number, direction: number) => {
    console.log('this time render success:', idiom)
    if (count > 0) {
      matrixRecord.push(idiom.word)
    }
    postionXY['x'].push(idiom.x)
    postionXY['y'].push(idiom.y)
    if (count < 1) {
      message.success({ content: '生成成功!', key, duration: 2 });
      setRendered(true)
      return
    }
    idiomDic[idiom.word] = {
      ...idiom,
      direction
    }
    const randomEmptyIndex = _.random(0, idiom.word.length - 1)
    for (let index = 0; index < idiom.word.length; index++) {
      const element = idiom.word[index];
      wordDic[element] = getWordContainArr(element)
      const { x, y } = idiom
      if (direction === 0) {
        // 在这里把随机的empty给加了
        // initData[y][x + index] = element
        initData[y][x + index] = index == randomEmptyIndex ? `[${element}]` : element
      } else {
        initData[y + index][x] = index == randomEmptyIndex ? `[${element}]` : element
        // initData[y + index][x] = element
      }
    }

    for (const key in idiomDic) {
      if (Object.prototype.hasOwnProperty.call(idiomDic, key)) {
        const element = idiomDic[key].word;
        const elementInfo = idiomDic[element]
        for (let index = 0; index < element.length; index++) {
          // 每一个字
          const letter = element[index]
          // 每一个字有多少个成语
          const letterArr = wordDic[letter]

          // 每一个字的坐标
          const letterPosition = {
            x: elementInfo.direction === 0 ? elementInfo.x + index : elementInfo.x,
            y: elementInfo.direction === 0 ? elementInfo.y : elementInfo.y + index,
          }


          if (letterArr) {
            for (let i = 0; i < letterArr.length; i++) {
              const idiom = letterArr[i];
              const { x: nextX, y: nextY } = getIdiomBeginPosition(letter, letterPosition, idiom, 1 - direction)
              if (await checkWordsIsOk(idiom, nextX, nextY, 1 - direction, {
                x: letterPosition.x,
                y: letterPosition.y
              })) {
                // console.log('下一个position：', { nextX, nextY }, letter, letterArr, element, letterPosition, idiom, 1 - direction)
                // console.log('本次渲染的成语是；', idiom, postionXY)
                // 避免一条长龙的成语现象

                renderData({
                  x: nextX,
                  y: nextY,
                  word: idiom
                }, count - 1, 1 - direction).then((res) => {
                  if (!res && count - 1 > 0) {
                    console.log('就是我要的情况')
                    // 重新render
                    initData = createData(xBlockNum, yBlockNum)
                    setData(initData)
                    setTimeout(() => {
                      refresh()
                    }, 2000);
                  }
                })
                setData([...getEmptyData(initData)])
                return true
              } else {
              }
            }

          }
        }
      }
    }



    // setData([...initData])
  }

  const checkWordsIsOk = async (word: string, x: number, y: number, direction: number, ignore: {
    x: number,
    y: number
  }) => {
    if (idiomDic[word]) {
      return false
    }

    // 横着渲染 不能和之前渲染过的同一行
    if (direction == 0) {
      if (postionXY['y'].includes(y)) {
        return false
      }
    }

    if (direction == 1) {
      if (postionXY['x'].includes(x)) {
        return false
      }
    }
    // const api = 'https://www.gankao.com/p-aienglish/dict/getDict'
    // const staticSalt = 'gankao666'
    // const res = axios.post(api, {
    //   code: 'cyches',
    //   words: word
    // }, {
    //   headers: {
    //     'Content-Type': 'application/json',
    //     token: await MD5(word + staticSalt)
    //   }
    // })

    if (x < 0 || x > xBlockNum || y < 0 || y > yBlockNum) {
      return false
    }

    // 左右上下
    const moveArr = [[-1, 0], [1, 0], [0, -1], [0, 1]]

    const postions = word.split('').map((i, index) => {
      return {
        letter: i,
        letterX: direction === 0 ? x + index : x,
        letterY: direction === 0 ? y : y + index,
      }
    })



    for (let i = 0; i < postions.length; i++) {
      const { letterX, letterY, letter } = postions[i];
      // 超出边界false
      if (letterX > xBlockNum - 1 || letterY > yBlockNum - 1) {
        // console.log('超出边界', xBlockNum, yBlockNum, letter)
        return false
      }
      // 检测每个字上下左右的字
      for (let index = 0; index < moveArr.length; index++) {
        const [dx, dy] = moveArr[index];
        const tx = letterX + dx
        const ty = letterY + dy
        if ((tx === ignore.x && ty === ignore.y) || (letterX === ignore.x && letterY === ignore.y)) {
          continue
        } else {
          try {
            if (initData[ty] && initData[ty][tx]) {
              return false
            }
          } catch (error) {
            console.log(initData, tx, ty)
          }

        }
      }
    }
    // 检查后来的是否和 之前的成语有所交集 如果没有false，放在最后检查 是为了 数组边界问题
    let exist = false
    for (let i = 0; i < postions.length; i++) {
      // console.log('检查：', initData, postions)
      const { letterX, letterY } = postions[i];
      if (initData[letterY] && initData[letterY][letterX]) {
        exist = true
      }
    }
    if (!exist) {
      return false
    }
    return true
  }

  const getIdiomBeginPosition = (
    letter: string,
    letterPositon: { x: number, y: number },
    idiom: string, direction: number) => {
    const letterIndex = idiom.split('').findIndex(i => i === letter)
    const { x, y } = letterPositon
    if (direction === 1) {
      return {
        x,
        y: y - letterIndex
      }
    } else {
      return {
        x: x - letterIndex,
        y
      }
    }

  }

  const handleJson = (x: number, y: number, _data: string[][]) => {
    const str = data[x][y]
    const copyData = JSON.parse(JSON.stringify(_data))
    if (!str) return
    if (!checkIsHidden(str)) {
      // hidden
      copyData[x][y] = wordGenerate(str)
      setData(copyData)
    } else {
      // show
      copyData[x][y] = wordGenerate(str)
      setData(copyData)
    }
  }

  const submitOne = async (matrix: string[][], id?: string) => {
    const sort = id ? sortRecord : refreshAmount - refreshCount
    const res = await axios.post('/add', {
      id: Number(id),
      level: easy,
      sort: sort,
      name: `第${sort}关`,
      matrix: JSON.stringify(matrix),
      matrix_space: matrixRecord.toString(),
    })
    if (id && res) {
      message.success('操作成功')
      return
    }
    return res
  }

  useEffect(() => {
    const dataString = JSON.stringify(data)
    if (data && submitCountLock && refreshCount > 0) {
      if (refreshDataQueue.indexOf(dataString) > -1 || matrixRecord.length < idiomCount) {
        refresh()
      } else {
        refreshCount--
        submitOne(data).then(() => {
          refresh()
        })
        refreshDataQueue.push(data.toString())
      }
    } else {
      setSubmitCountLock(false)
    }
  }, [data, submitCountLock])

  const getEmptyData = useCallback((data: string[][]) => {
    let randomEmptyCount = idiomCount + 2
    const dataCopy = JSON.parse(JSON.stringify(data))
    const postions = []
    console.log(data)
    // 保证四周节点必须有
    for (let index = 0; index < data.length; index++) {
      const line = data[index]
      for (let i = 0; i < line.length; i++) {
        const word = line[i];
        if (word) {
          postions.push({ x: i, y: index, word })
          // const result = checkAround(data, i, index)
          // if (randomEmptyCount > 0 && result && word[0] !== '[') {
          //   randomEmptyCount--;
          //   // dataCopy[index][i] = `[${word}]`
          // } else {
          //   postions.push({ x: i, y: index, word })
          // }
          if (word[0] == '[') {
            randomEmptyCount--;
          }
        }
      }
    }
    let emptyRecords = postions.filter((i) => !i.word.includes('['))
    // 应该是每一个成语里面都应该有一个字 empty
    emptyRecords.forEach((i) => {
      const { x, y, word } = i
      if (checkAroundEmpty(dataCopy, x, y) && randomEmptyCount > 0) {
        // dataCopy[y][x] = `[${word}]`
        dataCopy[y][x] = `[${word}]`
        randomEmptyCount--
      }
    })

    // for (let index = 0; index < randomEmptyCount; index++) {
    //   const randomIndex = _.random(0, emptyRecords.length - 1)
    //   const { x, y, word } = postions[randomIndex]
    //   if (word[0] !== '[') {
    //     dataCopy[y][x] = `[${word}]`
    //   }
    // }
    // 先把
    return dataCopy
  }, [idiomCount])

  const checkAround = (data: string[][], letterX: number, letterY: number) => {
    const moveArr = [[-1, 0], [1, 0], [0, -1], [0, 1]]
    let result = true
    for (let index = 0; index < moveArr.length; index++) {
      const [dx, dy] = moveArr[index];
      const tx = letterX + dx
      const ty = letterY + dy
      if (!(data[ty] && data[ty][tx])) {
        result = false
        return
      }
    }
    return result
  }
  const checkAroundEmpty = (data: string[][], letterX: number, letterY: number) => {
    console.log(data)
    const moveArr = [[-1, 0], [1, 0], [0, -1], [0, 1]]
    let result = true
    for (let index = 0; index < moveArr.length; index++) {
      const [dx, dy] = moveArr[index];
      const tx = letterX + dx
      const ty = letterY + dy
      if (data[ty] && data[ty][tx] && data[ty][tx].includes('[')) {
        result = false
        if (result) {
          console.log({ tx, ty }, result)
        }
      }
    }
    return result
  }
  const submitJson = async () => {
    const sort = refreshAmount + 1 - refreshCount
    const { matrix, matrix_space } = getRandomNormalRecord(sort)
    const res = await axios.post('/add', {
      level: easy,
      sort: sort,
      name: `第${sort}关`,
      matrix: JSON.stringify(matrix),
      matrix_space: matrix_space
    })
    if (id && res) {
      message.success('操作成功')
      return
    }
    refreshCount--
    if (refreshCount > 0) {
      submitJson()
    } else {
      return
    }
  }
  return (
    <div className={styles.container}>
      {/* {id} */}
      <Form
        name="basic"
        layout='inline'
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ xBlockNum, yBlockNum, idiomCount }}
        onFinish={(values) => {
          setXBlockNum(values.xBlockNum)
          setYBlockNum(values.yBlockNum)
          setIdiomCount(values.idiomCount)
          // refresh()
        }}
        style={{
          marginBottom: 50
        }}
        autoComplete="off"
      >
        <Form.Item
          label="横向格子"
          name="xBlockNum"
          rules={[{ required: true, message: '请输入!' }]}
        >
          <InputNumber style={{ marginLeft: 28 }} />
        </Form.Item>

        <Form.Item
          label="纵向格子"
          name="yBlockNum"
          rules={[{ required: true, message: '请输入!' }]}
        >
          <InputNumber style={{ marginLeft: 28 }} />
        </Form.Item>
        <Form.Item
          label="成语个数"
          name="idiomCount"
          rules={[{ required: true, message: '请输入!' }]}
        >
          <InputNumber style={{ marginLeft: 28 }} />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            配置
          </Button>
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button onClick={() => {
            message.loading({ content: '生成中', key })
            initData = createData(xBlockNum, yBlockNum)
            matrixRecord = []
            setData(initData)
            setTimeout(() => {
              refresh()
            }, 1000);
          }}>
            刷新
          </Button>
          <Button onClick={() => {
            initData = createData(xBlockNum, yBlockNum)
            const { matrix, matrix_space } = getRandomNormalRecord(1, true)
            initData = matrix
            setData(matrix)
            matrixRecord = matrix_space.split(',')
          }}>
            从json刷新
          </Button>

        </Form.Item>
        {
          id ?
            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button onClick={() => {
                submitOne(data, id)
              }}>
                更新当前数据
              </Button>
            </Form.Item> :
            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button onClick={() => {
                message.loading({ content: '提交中', key })
                setSubmitCountLock(!submitCountLock)
              }}>
                提交300条数据
              </Button>
              <Button type='primary' onClick={() => {
                submitJson()
              }}>
                提交JSON
              </Button>
            </Form.Item>
        }


      </Form>
      <div>
        {
          rendered ?
            <ReactJson src={data} collapsed style={{ marginBottom: 50 }} />
            : ''
        }
      </div>
      {
        data?.map((i, index) => (
          <div className={styles.line} key={index}>
            {i.map((j, _index) => (
              <div className={j ? styles.activeBox : styles.box}
                style={{
                  background: checkIsHidden(j) ? 'orange' : '',
                  color: checkIsHidden(j) ? 'black' : ""
                }}
                onClick={() => {
                  handleJson(index, _index, data)
                }}
                key={_index}>
                {j}
                <p>{`(${_index}, ${index})`}</p>
              </div>
            ))}
          </div>
        ))
      }
      <div style={{ margin: '100px auto', textAlign: 'center' }}>
        {
          id ?
            <a style={{ color: '#0070f3' }} href={`/game/easy?id=${Number(id) + 1}`}>
              下一关
            </a> : ''
        }
      </div>


    </div >
  )
}
// export async function getStaticProps(context: GetStaticPropsContext) {
//   return { props: {} };
// }
export default Game
