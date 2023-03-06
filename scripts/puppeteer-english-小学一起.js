import puppeteer from 'puppeteer-core';
import { appendFile, existsSync, mkdirSync, writeFileSync } from 'fs';

const DataJson = [
    {
        value: 1,
        text: '一年级上册',
    },
    {
        value: 2,
        text: '一年级下册',
    }, {
        value: 3,
        text: '二年级上册',
    }, {
        value: 4,
        text: '二年级下册',
    }, {
        value: 5,
        text: '三年级上册',
    }, {
        value: 6,
        text: '三年级下册',
    }, {
        value: 7,
        text: '四年级上册',
    }, {
        value: 8,
        text: '四年级下册',
    }, {
        value: 9,
        text: '五年级上册',
    }, {
        value: 10,
        text: '五年级下册',
    }, {
        value: 11,
        text: '六年级上册',
    }, {
        value: 12,
        text: '六年级下册',
    }
]
const path = './json/puppeteer-english-小学一起.json'
const getCategoryRes = async (browser, grade) => {
    const page = await browser.newPage();
    const url = `https://k12-nse-cdn.unipus.cn/books/appwx/1l${grade}_V2/wxjson/catalog.json?v=20231119714`
    const res = await page.goto(url)
    return await res.text();
}

const command = async () => {
    const browser = await puppeteer.launch({
        // headless false显示；
        headless: false,
        defaultViewport: {
            width: 1080,
            height: 1024
        },
        executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    });
    const page = await browser.newPage();
    await page.setUserAgent('UA-TEST');
    let totalArray = []
    for (let index = 0; index < DataJson.length; index++) {
        const grade = DataJson[index].value
        const res = await getCategoryRes(browser, grade)
        const data = JSON.parse(res)
        totalArray.push({
            ...DataJson[index],
            data
        })
    }
    console.log(totalArray)
    writeFileSync(path, JSON.stringify(totalArray, null, 2), 'utf8');
};

await command()