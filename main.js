import puppeteer from 'puppeteer';

const app = await puppeteer.launch({
    args: [
        '--window-size=1280,720',
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
    headless: false,
    defaultViewport: {
        width: 1280,
        height: 720,
}});

const page = (await app.pages())[0];

for (;;) {
    let flag = false;
    await page.goto('https://www.mina-perhonen.jp/online_store/fabric/');
    await page.waitForSelector('.col2_4_grid.pure-g > div.pure-u-1-2');
    const grid = await page.$$('.col2_4_grid.pure-g > div.pure-u-1-2');
    for (const item of grid) {
        const itemName = await item.$eval('.fs_h4.jp_serif > span', e => e.textContent);
        if (itemName === 'home circle') {
            item.click();
            flag = true;
        }
    }
    if (flag) {
        break;
    }
    await new Promise(r => setTimeout(r, 1000));
    await page.evaluate(() => {
        document.querySelector("#__layout > div > div.inner > div > div.contents_wrap > main > article > section.cols2_wrap.bb_section > div.col2 > div > span > div.form_color_size > ul > li:nth-child(4) > dl > dd > button").click();
    });
}
// await page.hoge
// await page.close();
// await app.close();

