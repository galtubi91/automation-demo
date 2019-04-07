let apesterIframe;
const testUnit = 'https://renderer.apester.com/v2/5c87d7270e019f1fcb6b69fe?preview=true&iframe_preview=true';

beforeAll(async () => {
    jest.setTimeout(150000);
    page = await global.__BROWSER__.newPage();
    await page.goto(testUnit, {
        waitUntil: 'domcontentloaded',
    });
});
test('Unit size test: Story desktop Size', async () => {
    apesterIframe = await page.$('iframe[src^="https://renderer.apester.com"]');
    apesterIframe = await page.frames()[1];
    const unitBody = await apesterIframe.$('#root');
    await page.waitFor(5000);
    const iframeSize = await unitBody.boxModel();
    expect(iframeSize.width).toEqual(400);
    expect(iframeSize.height).toEqual(640);
});