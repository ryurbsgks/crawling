const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const dotenv = require('dotenv');

dotenv.config();

function delay(ms) {
  return new Promise( (resolve) => {
    setTimeout(resolve, ms);
  });
}

async function crawl() {

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const url = 'https://www.melon.com/index.htm';
  const arrTitle = [];

  await page.setViewport({ 
    width: 1920, 
    height: 1080
  });
  await page.goto(url);
  await page.click('#gnbLoginDiv > div > button > span');
  await delay(1000);
  await page.click('#conts_section > div > div > div:nth-child(3) > button');
  await delay(1000);
  await page.evaluate( (id, pw) => {
    document.querySelector('#id').value = id;
    document.querySelector('#pwd').value = pw;
  }, process.env.USER_ID, process.env.USER_PW);
  await page.click('#btnLogin');
  await delay(1000);

  if (page.url() === url) {

    const pageNum = 5;

    for (let i = 0; i < pageNum; i++) {

      const num = i * 50 + 1;

      await page.goto(`${process.env.TARGET_URL}${num}`);
      await delay(1000);

      const content = await page.content();
      const $ = cheerio.load(content);
      const list = $('#frm > div > table > tbody > tr');
      
      list.each( (_, item) => arrTitle.push($(item).find('td:nth-child(3) > div > div > a.fc_gray').text()));

    }

    await browser.close();

  } else {
    await browser.close();
  }

  console.log(arrTitle.join("\n"));
  
}

crawl();