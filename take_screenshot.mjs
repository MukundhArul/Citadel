import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  console.log("Navigating to register...");
  await page.goto('http://localhost:3000/login?mode=register');
  
  // Create user
  const uniqueEmail = `demo_${Date.now()}@citadel.com`;
  await page.type('input[type="email"]', uniqueEmail);
  await page.type('input[type="password"]', 'demopassword');
  const allBtnsReg = await page.$$('button');
  for (let btn of allBtnsReg) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('INITIALIZE VAULT')) {
      await btn.click();
      break;
    }
  }

  console.log("Waiting for dashboard...");
  // Wait for dashboard to load (checking for MASTER PASSWORD input)
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  // Enter Master Password
  const passInputs = await page.$$('input[type="password"]');
  if (passInputs.length > 0) {
    await passInputs[0].type('masterkey');
  }
  
  // Click INITIALIZE DECRYPTION
  const buttons = await page.$$('button[type="submit"]');
  for (let btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('INITIALIZE DECRYPTION')) {
      await btn.click();
      break;
    }
  }

  console.log("Waiting for vault unlocking...");
  await new Promise(r => setTimeout(r, 3000));

  // Click NEW RECORD
  const allBtns = await page.$$('button');
  for (let btn of allBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('NEW RECORD')) {
      await btn.click();
      break;
    }
  }

  // Fill out new record
  await new Promise(r => setTimeout(r, 1000));
  const inputs = await page.$$('input');
  // First input is title, second username, third password, fourth url, fifth notes
  if (inputs.length >= 5) {
    await inputs[0].type('GitHub Enterprise');
    await inputs[1].type('demo_agent');
    await inputs[2].type('super_secure_password_123!');
    await inputs[3].type('https://github.com');
  }

  // Save record
  for (let btn of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('SAVE RECORD')) {
      await btn.click();
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 3000));

  console.log("Taking screenshot...");
  await page.screenshot({ path: 'public/screenshot.png' });
  await browser.close();
  console.log("Done!");
})();
