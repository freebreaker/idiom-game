
import { Button, Form, Input, InputNumber, message } from 'antd'
import type { GetStaticPropsContext, NextPage } from 'next'
import { useEffect, useState } from 'react'
import { checkIsHidden, getRandomWord, getWordContainArr, wordGenerate } from '../../../tools/game'
import { IWord } from '../../api/game'
import styles from './index.module.scss'
import dynamic from 'next/dynamic'
const ReactJson = dynamic(() => import('react-json-view'), { ssr: false })


// const xBlockNum = 10
// const yBlockNum = 10
let wordDic: {
  [prop in string]: string[]
} = {}

let idiomDic: {
  [prop in string]: IWord
} = {}
const createData = (xBlockNum: number, yBlockNum: number) => {
  return Array.from({ length: yBlockNum }).map((i) => (
    [
      ...Array.from({ length: xBlockNum }).map(() => '')
    ]
  ))
}
let initData: string[][]
const Game: NextPage = () => {
  const key = 'update'
  const [idiomCount, setIdiomCount] = useState(4)
  const [xBlockNum, setXBlockNum] = useState(16)
  const [yBlockNum, setYBlockNum] = useState(6)
  initData = createData(xBlockNum, yBlockNum)
  const [data, setData] = useState<string[][]>(createData(xBlockNum, yBlockNum))
  const [rendered, setRendered] = useState(false)

  // 获取当前关卡
  useEffect(() => {
  }, [])


  useEffect(() => {
    initData = createData(xBlockNum, yBlockNum)
    setData(initData)
    setTimeout(() => {
      refresh()
    }, 1000);
  }, [xBlockNum, yBlockNum, idiomCount])

  const refresh = () => {
    message.loading({ content: '生成中', key })
    const firstIdiom = getRandomWord()
    const randomDis = Math.floor(Math.random())
    const randomDirection = Math.floor(Math.random())
    renderData({
      x: parseInt((xBlockNum / 2).toString()) - randomDis,
      y: parseInt((yBlockNum / 2).toString()) - randomDis,
      word: firstIdiom
    }, idiomCount, randomDirection)
  }

  const renderData = (idiom: IWord, count: number, direction: number) => {
    console.log(initData, idiomDic, count)
    if (count < 1) {
      message.success({ content: '生成成功!', key, duration: 2 });
      setRendered(true)
      return
    }
    idiomDic[idiom.word] = {
      ...idiom,
      direction
    }
    for (let index = 0; index < idiom.word.length; index++) {
      const element = idiom.word[index];
      wordDic[element] = getWordContainArr(element)
      const { x, y } = idiom
      if (direction === 0) {
        initData[y][x + index] = element
      } else {
        initData[y + index][x] = element
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

          console.log(1111, elementInfo)
          // 每一个字的坐标
          const letterPosition = {
            x: elementInfo.direction === 0 ? elementInfo.x + index : elementInfo.x,
            y: elementInfo.direction === 0 ? elementInfo.y : elementInfo.y + index,
          }


          if (letterArr) {
            for (let i = 0; i < letterArr.length; i++) {
              const idiom = letterArr[i];
              const { x: nextX, y: nextY } = getIdiomBeginPosition(letter, letterPosition, idiom, 1 - direction)
              if (checkWordsIsOk(idiom, nextX, nextY, 1 - direction, {
                x: letterPosition.x,
                y: letterPosition.y
              })) {
                console.log({
                  x: nextX,
                  y: nextY,
                  word: idiom
                }, 1 - direction)
                renderData({
                  x: nextX,
                  y: nextY,
                  word: idiom
                }, count - 1, 1 - direction)
                setData([...initData])
                return
              } else {
                console.log('none of is ok', idiom)
              }
            }
          }
        }
      }
    }
    // setData([...initData])
  }

  const checkWordsIsOk = (word: string, x: number, y: number, direction: number, ignore: {
    x: number,
    y: number
  }) => {
    if (idiomDic[word]) {
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

    console.log('postions', [postions])

    for (let i = 0; i < postions.length; i++) {
      const { letterX, letterY, letter } = postions[i];
      // 超出边界false
      if (letterX > xBlockNum - 1 || letterY > yBlockNum - 1) {
        console.log('超出边界', xBlockNum, yBlockNum, letter)
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
    console.log(x, y)
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

  return (
    <div className={styles.container}>
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
            refresh()
          }}>
            刷新
          </Button>
        </Form.Item>
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
    </div >
  )
}
export async function getStaticProps(context: GetStaticPropsContext) {
  return {
    props: {},
  }
}
export default Game
