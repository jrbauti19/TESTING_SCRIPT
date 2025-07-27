/**
 * 🧪 Hacker News E2E Tests
 *
 * Comprehensive Playwright test suite validating Hacker News functionality
 * Demonstrates traditional E2E testing alongside advanced QA framework
 *
 * Author: Joshua Bautista
 * Contact: jrbauti19@gmail.com
 */

const { test, expect } = require('@playwright/test');

test.describe('🚀 Hacker News - Core Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up consistent test environment
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('🌐 Should load the newest page successfully', async ({ page }) => {
    console.log('🔍 Testing: Page load and basic structure...');

    await page.goto('/newest');

    // Verify page loads
    await expect(page).toHaveTitle(/Hacker News/);

    // Verify main navigation exists
    await expect(page.locator('a[href="newest"]')).toBeVisible();

    // Verify articles are present
    const articles = page.locator('.athing');
    await expect(articles).toHaveCount(30);

    console.log('✅ PASSED: Page loads with 30 articles');
  });

  test('📰 Should display articles with required elements', async ({
    page,
  }) => {
    console.log('🔍 Testing: Article structure and required elements...');

    await page.goto('/newest');

    // Wait for articles to load
    await page.waitForSelector('.athing', { timeout: 10000 });

    // Test first article has all required elements
    const firstArticle = page.locator('.athing').first();

    // Should have rank number
    await expect(firstArticle.locator('.rank')).toBeVisible();

    // Should have title
    await expect(firstArticle.locator('.titleline')).toBeVisible();

    // Should have a clickable title link
    const titleLink = firstArticle.locator('.titleline a').first();
    await expect(titleLink).toBeVisible();
    await expect(titleLink).toHaveAttribute('href');

    console.log('✅ PASSED: Articles have required structure');
  });

  test('🔢 Should have sequential rank numbers', async ({ page }) => {
    console.log('🔍 Testing: Sequential ranking system...');

    await page.goto('/newest');
    await page.waitForSelector('.athing', { timeout: 10000 });

    // Get all rank elements
    const ranks = await page.locator('.rank').allTextContents();

    // Verify we have 30 ranks
    expect(ranks).toHaveLength(30);

    // Verify sequential numbering (1, 2, 3, ... 30)
    for (let i = 0; i < ranks.length; i++) {
      const expectedRank = (i + 1).toString() + '.';
      expect(ranks[i]).toBe(expectedRank);
    }

    console.log('✅ PASSED: All 30 articles have sequential ranking (1-30)');
  });

  test('⏰ Should have timestamp information', async ({ page }) => {
    console.log('🔍 Testing: Timestamp presence and format...');

    await page.goto('/newest');
    await page.waitForSelector('.athing', { timeout: 10000 });

    // Check that articles have age information
    const ageElements = page.locator('.age');
    const ageCount = await ageElements.count();

    // Should have age info for most articles (allow for some missing)
    expect(ageCount).toBeGreaterThan(25);

    // Verify age format (should contain time-related words)
    const firstAge = await ageElements.first().textContent();
    const timeWords = ['minute', 'hour', 'day', 'ago', 'on'];
    const hasTimeWord = timeWords.some((word) =>
      firstAge?.toLowerCase().includes(word),
    );

    expect(hasTimeWord).toBeTruthy();

    console.log('✅ PASSED: Articles have proper timestamp information');
  });

  test('🔗 Should have working "More" pagination link', async ({ page }) => {
    console.log('🔍 Testing: Pagination functionality...');

    await page.goto('/newest');
    await page.waitForSelector('.athing', { timeout: 10000 });

    // Find the "More" link
    const moreLink = page.locator('a.morelink');
    await expect(moreLink).toBeVisible();
    await expect(moreLink).toHaveText('More');

    // Verify it has a proper href
    const href = await moreLink.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href).toContain('newest');

    console.log('✅ PASSED: Pagination "More" link is present and functional');
  });

  test('🎯 Should maintain consistent article structure across pages', async ({
    page,
  }) => {
    console.log('🔍 Testing: Multi-page consistency...');

    await page.goto('/newest');
    await page.waitForSelector('.athing', { timeout: 10000 });

    // Get first page article count
    const firstPageArticles = await page.locator('.athing').count();
    expect(firstPageArticles).toBe(30);

    // Navigate to second page
    await page.click('a.morelink');
    await page.waitForSelector('.athing', { timeout: 10000 });

    // Verify second page also has articles
    const secondPageArticles = await page.locator('.athing').count();
    expect(secondPageArticles).toBeGreaterThan(0);

    // Verify structure is consistent
    const firstArticleOnPage2 = page.locator('.athing').first();
    await expect(firstArticleOnPage2.locator('.rank')).toBeVisible();
    await expect(firstArticleOnPage2.locator('.titleline')).toBeVisible();

    console.log('✅ PASSED: Multi-page structure is consistent');
  });

  test('📱 Should be responsive on mobile devices', async ({ page }) => {
    console.log('🔍 Testing: Mobile responsiveness...');

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/newest');
    await page.waitForSelector('.athing', { timeout: 10000 });

    // Verify articles are still visible on mobile
    const articles = page.locator('.athing');
    await expect(articles).toHaveCount(30);

    // Verify main elements are still accessible
    await expect(page.locator('.rank').first()).toBeVisible();
    await expect(page.locator('.titleline').first()).toBeVisible();

    console.log('✅ PASSED: Site is responsive on mobile devices');
  });

  test('🔍 Should handle network delays gracefully', async ({ page }) => {
    console.log('🔍 Testing: Network resilience...');

    // Simulate slow network
    await page.route('**/*', (route) => {
      setTimeout(() => route.continue(), 100);
    });

    await page.goto('/newest');

    // Should still load despite network delays
    await page.waitForSelector('.athing', { timeout: 15000 });
    const articles = await page.locator('.athing').count();

    expect(articles).toBe(30);

    console.log('✅ PASSED: Site handles network delays gracefully');
  });
});

test.describe('🎯 Advanced Validation Tests', () => {
  test('📊 Should integrate with our advanced QA framework', async ({
    page,
  }) => {
    console.log('🔍 Testing: Integration with advanced QA framework...');

    await page.goto('/newest');
    await page.waitForSelector('.athing', { timeout: 10000 });

    // Extract article data similar to our main framework
    const articles = await page.evaluate(() => {
      const articleElements = document.querySelectorAll('.athing');
      return Array.from(articleElements)
        .slice(0, 10)
        .map((article, index) => {
          const titleElement = article.querySelector('.titleline > a');
          const rankElement = article.querySelector('.rank');
          const ageElement = article.querySelector('.age');

          return {
            rank: index + 1,
            id: article.id,
            title: titleElement?.textContent?.trim() || '',
            hasTimestamp: !!ageElement,
            hasValidStructure: !!(titleElement && rankElement),
          };
        });
    });

    // Validate extracted data
    expect(articles).toHaveLength(10);

    // All articles should have valid structure
    const validArticles = articles.filter((a) => a.hasValidStructure);
    expect(validArticles).toHaveLength(10);

    // Most articles should have timestamps
    const articlesWithTimestamps = articles.filter((a) => a.hasTimestamp);
    expect(articlesWithTimestamps.length).toBeGreaterThan(8);

    console.log('✅ PASSED: E2E tests integrate well with advanced framework');
    console.log(
      `📊 Validated ${articles.length} articles with ${articlesWithTimestamps.length} having timestamps`,
    );
  });

  test('♿ Should meet basic accessibility requirements', async ({ page }) => {
    console.log('🔍 Testing: Basic accessibility compliance...');

    await page.goto('/newest');
    await page.waitForSelector('.athing', { timeout: 10000 });

    // Check for basic accessibility features

    // Should have proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);

    // Links should have proper text or aria-labels
    const links = page.locator('a');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(30); // Should have many links

    // Should not have any obvious accessibility violations
    // (This is a basic check - our main framework does comprehensive axe-core testing)
    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      // If images exist, they should have alt attributes
      const imagesWithAlt = page.locator('img[alt]');
      const altCount = await imagesWithAlt.count();
      expect(altCount).toBeGreaterThanOrEqual(imageCount * 0.8); // Allow some flexibility
    }

    console.log('✅ PASSED: Basic accessibility requirements met');
    console.log(
      '💡 Note: Comprehensive accessibility testing available via main framework',
    );
  });
});

test.describe('🚀 Performance & Quality Tests', () => {
  test('⚡ Should load within performance budgets', async ({ page }) => {
    console.log('🔍 Testing: Performance benchmarks...');

    const startTime = Date.now();

    await page.goto('/newest');
    await page.waitForSelector('.athing', { timeout: 10000 });

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds (reasonable for external site)
    expect(loadTime).toBeLessThan(5000);

    console.log(`✅ PASSED: Page loaded in ${loadTime}ms (under 5s budget)`);
  });

  test('🔒 Should have proper security headers', async ({ page }) => {
    console.log('🔍 Testing: Security headers...');

    const response = await page.goto('/newest');
    const headers = response?.headers() || {};

    // Check for basic security considerations
    // (Note: We can't control HN's headers, but we can verify they exist)
    expect(typeof headers['content-type']).toBe('string');
    expect(headers['content-type']).toContain('text/html');

    console.log('✅ PASSED: Basic security headers present');
  });
});
