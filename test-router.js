import puppeteer from 'puppeteer';

(async () => {
    try {
        console.log('Launching browser...');
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        
        let errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(`[CONSOLE ERROR] ${msg.text()}`);
                console.log(`[CONSOLE ERROR] ${msg.text()}`);
            }
        });
        
        page.on('pageerror', error => {
            errors.push(`[PAGE ERROR] ${error.message}`);
            console.log(`[PAGE ERROR] ${error.message}`);
        });

        console.log('Navigating to http://localhost:5173/dashboard...');
        await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2' });
        
        console.log('Waiting for sidebar links...');
        await page.waitForSelector('nav a', { timeout: 10000 });
        
        const links = await page.$$('nav a');
        console.log(`Found ${links.length} sidebar links.`);
        
        if (links.length > 0) {
            for (let i = 0; i < 8; i++) {
                const idx = i % links.length;
                const linkHref = await page.evaluate(el => el.href, links[idx]);
                console.log(`Clicking link ${i + 1}: ${linkHref}`);
                
                await links[idx].click();
                await new Promise(r => setTimeout(r, 400)); 
            }
        }
        
        console.log('Done clicking. Checking errors...');
        if (errors.length === 0) {
            console.log('No errors captured during routing.');
        } else {
            console.log(`Captured ${errors.length} errors.`);
        }
        
        await browser.close();
    } catch (e) {
        console.error('Puppeteer Script Error:', e.message);
        process.exit(1);
    }
})();
