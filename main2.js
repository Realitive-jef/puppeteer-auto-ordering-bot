import puppeteer from 'puppeteer';

const app = await puppeteer.launch({
    args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-sandbox',
        '--no-zygote',
        '--single-process',
        '--proxy-server=\'direct://\'',
        '--proxy-bypass-list=*',
        `--user-data-dir=${process.cwd()}/data`,
    ],
    defaultViewport: {
        width: 1920,
        height: 1080,
    },
    headless: false,
});

const page = (await app.pages())[0];

for (;;) {
    let flag = false;
    await page.goto('https://www.mina-perhonen.jp/online_store/fabric/');
    await page.waitForSelector('.col2_4_grid.pure-g > div.pure-u-1-2');
    const grid = await page.$$('.col2_4_grid.pure-g > div.pure-u-1-2');
    for (const item of grid) {
        const itemName = await item.$eval('.fs_h4.jp_serif > span', e => e.textContent);
        if (itemName === 'home circle') {
            await (await item.$('a')).click();
            flag = true;
            break;
        }
    }
    if (flag) {
        break;
    }
    await new Promise(r => setTimeout(r, 1000));
}
await page.waitForNavigation({ waitUntil: 'networkidle0' });
await page.waitForSelector('.color_size_list.item-block > li[data-watch-target]');
const list = await page.$$('.color_size_list.item-block > li[data-watch-target]');
for (const element of list) {
    // const type = (await (await (await element.$('figcaption')).getProperty('textContent')).jsonValue()).trim();
    const type = await element.$eval('figcaption', e => e.textContent.trim());
    if (type === 'gray') {
        console.log('gray');
        await (await element.$('button')).click({ delay: 2000 });
    }
}
