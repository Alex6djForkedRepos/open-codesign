import { randomUUID } from 'node:crypto';
import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { findSystemChrome } from '@open-codesign/exporters';
import puppeteer, { type Browser, type Page } from 'puppeteer-core';
import { createServer, type ViteDevServer } from 'vite';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type {} from './__fixtures__/active-message-browser';

const chrome = await findSystemChrome().catch(() => null);

describe.skipIf(!chrome)('active composer fake gate in system Chrome', () => {
  let browser: Browser;
  let server: ViteDevServer;
  let page: Page;
  let endpoint: string;
  const profile = resolve(process.cwd(), `.codesign-browser-profile-${randomUUID()}`);
  const externalRequests: string[] = [];
  const browserErrors: string[] = [];

  beforeAll(async () => {
    if (!chrome) throw new Error('System Chrome unavailable');
    server = await createServer({
      configFile: false,
      root: process.cwd(),
      esbuild: { jsx: 'automatic' },
      server: { host: '127.0.0.1', port: 0 },
      plugins: [
        {
          name: 'active-message-component-fixture',
          configureServer(vite) {
            vite.middlewares.use((req, res, next) => {
              if (req.url !== '/active-message-fixture') return next();
              res.setHeader('Content-Type', 'text/html');
              res.end(
                '<!doctype html><html><body><div id="root"></div><script type="module" src="/src/renderer/src/components/chat/__fixtures__/active-message-browser.tsx"></script></body></html>',
              );
            });
          },
        },
      ],
    });
    await server.listen();
    const address = server.httpServer?.address();
    if (!address || typeof address === 'string') throw new Error('Fixture server unavailable');
    endpoint = `http://127.0.0.1:${address.port}/active-message-fixture`;
    expect((await fetch(endpoint)).ok).toBe(true);
    browser = await puppeteer.launch({
      executablePath: chrome,
      headless: true,
      userDataDir: profile,
    });
  }, 60_000);

  beforeEach(async () => {
    externalRequests.length = 0;
    browserErrors.length = 0;
    page = await browser.newPage();
    page.on('pageerror', (error) => browserErrors.push(String(error)));
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (new URL(request.url()).origin === new URL(endpoint).origin) {
        void request.continue();
      } else {
        externalRequests.push(request.url());
        void request.abort();
      }
    });
    await page.goto(endpoint);
    await page.waitForSelector('textarea');
  }, 60_000);

  afterEach(async () => {
    await page?.close();
    expect(externalRequests).toEqual([]);
    expect(browserErrors).toEqual([]);
  });

  afterAll(async () => {
    try {
      await browser?.close();
    } finally {
      await server?.close();
      await rm(profile, { recursive: true, force: true });
    }
  }, 30_000);

  async function snapshot() {
    return page.evaluate(() => window.activeMessageFixture.snapshot());
  }
  async function clickButton(text: string) {
    for (const button of await page.$$('button')) {
      if ((await button.evaluate((node) => node.textContent)) === text) {
        await button.click();
        return;
      }
    }
    throw new Error(`Missing button: ${text}`);
  }

  it('queues Enter, steers with the secondary control, and leaves Stop independent', async () => {
    await page.type('textarea', 'Queued from real Chrome');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.activeMessageFixture.snapshot().calls.length === 1);
    expect((await snapshot()).calls[0]).toMatchObject({
      mode: 'follow-up',
      designId: 'browser-design',
      generationId: 'browser-run',
      text: 'Queued from real Chrome',
    });
    await page.evaluate(() => window.activeMessageFixture.accept(0));
    await page.waitForFunction(() => window.activeMessageFixture.snapshot().draft === '');
    await page.type('textarea', 'Steer the next step');
    await clickButton('Steer next step');
    await page.waitForFunction(() => window.activeMessageFixture.snapshot().calls.length === 2);
    expect((await snapshot()).calls[1]?.mode).toBe('steer');
    await page.evaluate(() => window.activeMessageFixture.accept(1));
    await page.waitForFunction(() => window.activeMessageFixture.snapshot().draft === '');
    await page.click('button[aria-label^="Stop"]');
    await page.waitForFunction(() =>
      window.activeMessageFixture.snapshot().rows.every((row) => row.status === 'not-delivered'),
    );
    expect((await snapshot()).cancelCalls).toBe(1);
    expect((await snapshot()).generateCalls).toBe(0);
  });

  it('preserves IME and Shift+Enter, then queues Ctrl+Enter without a normal generation', async () => {
    await page.type('textarea', 'Composition');
    await page.$eval('textarea', (node) =>
      node.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true })),
    );
    await page.keyboard.press('Enter');
    await page.$eval('textarea', (node) =>
      node.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true })),
    );
    await page.keyboard.down('Shift');
    await page.keyboard.press('Enter');
    await page.keyboard.up('Shift');
    expect((await snapshot()).calls).toHaveLength(0);
    expect(await page.$eval('textarea', (node) => node.value)).toContain('\n');
    await page.keyboard.down('Control');
    await page.keyboard.press('Enter');
    await page.keyboard.up('Control');
    await page.waitForFunction(() => window.activeMessageFixture.snapshot().calls.length === 1);
    expect((await snapshot()).calls[0]?.mode).toBe('follow-up');
    expect((await snapshot()).generateCalls).toBe(0);
  });

  it('retains concurrent edits on acceptance and exposes rejection without losing the draft', async () => {
    await page.type('textarea', 'Original');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.activeMessageFixture.snapshot().calls.length === 1);
    await page.type('textarea', ' plus newer edit');
    await page.evaluate(() => window.activeMessageFixture.accept(0));
    await page.waitForFunction(
      () => !document.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled,
    );
    expect((await snapshot()).draft).toBe('Original plus newer edit');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.activeMessageFixture.snapshot().calls.length === 2);
    await page.evaluate(() => window.activeMessageFixture.reject(1));
    await page.waitForFunction(() =>
      document.querySelector('output')?.textContent?.includes('Fake gate'),
    );
    expect((await snapshot()).draft).toBe('Original plus newer edit');
    expect((await snapshot()).generateCalls).toBe(0);
  });

  it.each([
    false,
    true,
  ])('preserves the draft on not-delivered outcome (event before ACK: %s)', async (eventBeforeAck) => {
    await page.type('textarea', 'Never discard an undelivered draft');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.activeMessageFixture.snapshot().calls.length === 1);
    await page.evaluate(
      (eventBeforeAck) => window.activeMessageFixture.settleUndelivered(0, eventBeforeAck),
      eventBeforeAck,
    );
    await page.waitForFunction(() =>
      document.querySelector('output')?.textContent?.includes('stopped before delivery'),
    );
    const state = await snapshot();
    expect(state.draft).toBe('Never discard an undelivered draft');
    expect(state.rows[0]?.status).toBe('not-delivered');
    expect(state.calls).toHaveLength(1);
    expect(state.generateCalls).toBe(0);
  });

  it.each(['file', 'comment', 'url'] as const)('never silently sends %s context', async (kind) => {
    await page.evaluate((kind) => window.activeMessageFixture.setContext(kind), kind);
    await page.type('textarea', 'Keep my context and draft');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() =>
      document.querySelector('output')?.textContent?.includes('text-only'),
    );
    const state = await snapshot();
    expect(state.calls).toHaveLength(0);
    expect(state.generateCalls).toBe(0);
    expect(state.draft).toBe('Keep my context and draft');
    if (kind === 'file') expect(state.files).toHaveLength(1);
    if (kind === 'comment') expect(state.comments).toEqual(['pending-comment']);
  });
});
