import { Table, Tag, Typography } from 'antd'
import type { GetStaticPropsContext, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios'
const { Paragraph } = Typography;
interface DataType {
  key: string;
  name: string;
}

const Home: NextPage = () => {

  const levelObj = {
    1: {
      text: '简单',
      color: 'green',
      link: 'easy'
    },
    2: {
      text: '一般',
      color: 'blue',
      link: 'normal'
    },
    3: {
      text: '困难',
      color: 'error',
      link: 'difficult'
    }
  }
  const [data, setData] = useState([])
  // 获取当前关卡
  useEffect(() => {
    axios('/levels', {
      headers: {
        'Cache-Control': 'no-cache'
      }
    }).then((res) => {
      setData(res.data)
    })
  }, [])

  const columns: ColumnsType<DataType> = [
    {
      title: 'Name',
      dataIndex: 'name',
      align: 'center',
      key: 'name',
    },
    {
      title: '第几关排序',
      dataIndex: 'sort',
      align: 'center',
      key: 'sort',
    },
    {
      title: '第几关排序',
      dataIndex: 'sort',
      align: 'center',
      key: 'sort',
    },
    {
      title: '矩阵',
      dataIndex: 'matrix',
      key: 'sort',
      align: 'center',
      width: '30%',
      render: (record, _, action) => [
        <Paragraph style={{ textAlign: 'center', wordBreak: 'break-word' }} copyable={{ tooltips: false }}>{record}</Paragraph>
      ],
    },
    {
      title: '难易等级',
      key: 'level',
      dataIndex: 'level',
      align: 'center',
      filters: [
        {
          text: '简单',
          value: '1',
        },
        {
          text: '一般',
          value: '2',
        },
        {
          text: '困难',
          value: '3'
        }
      ],
      onFilter: (value, record: any) => record.level == value,
      render: (level: 1) => (
        <span>
          <Tag color={levelObj[level].color}>
            {levelObj[level].text}
          </Tag>
        </span>
      ),
    },
    {
      title: '编辑',
      key: 'level',
      align: 'center',
      render: (record) => (
        // @ts-ignore
        <a style={{ color: '#0070f3' }} href={`/game/${levelObj[record.level].link}?id=${record.id}`}>
          编辑
        </a>
      ),
    },
  ]

  return (
    <div className={styles.container}>
      <Head>
        <title>idiom game</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>
          {/* Welcome to <a href="https://nextjs.org">Next.js!</a> */}
          成语生成
        </h1>

        <div className={styles.grid}>
          <Link href="/game/easy">
            <h2 className={styles.card}>入门 &rarr;</h2>
          </Link>

          <Link href="/game/normal">
            <h2 className={styles.card}>普通 &rarr;</h2>
          </Link>

          <Link href="/game/difficult">
            <h2 className={styles.card}>困难 &rarr;</h2>
          </Link>
        </div>
      </main>
      <Table columns={columns} dataSource={data} />
    </div>
  )
}
// export async function getStaticProps(context: GetStaticPropsContext) {
//   return {
//     props: {}, // will be passed to the page component as props
//   }
// }
export default Home
