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
    </div>
  )
}
// export async function getStaticProps(context: GetStaticPropsContext) {
//   return {
//     props: {}, // will be passed to the page component as props
//   }
// }
export default Home
