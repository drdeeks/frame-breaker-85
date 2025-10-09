import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        await page.goto("http://localhost:5173/")

        # Wait for the main heading to ensure the start screen is loaded
        start_heading = page.get_by_role("heading", name="Frame Breaker '85")
        await expect(start_heading).to_be_visible(timeout=10000) # 10s timeout

        # Click the "Start Game" button
        await page.get_by_role("button", name="Start Game").click()

        # Click the canvas to release the ball
        await page.locator("canvas").click()

        # Wait for the "Game Over" screen to appear.
        # The game needs to run until all lives are lost.
        # We'll wait for the "Game Over" heading to be visible.
        game_over_heading = page.get_by_role("heading", name="Game Over")
        await expect(game_over_heading).to_be_visible(timeout=60000) # 60 second timeout

        # Take a screenshot of the game over screen
        await page.screenshot(path="jules-scratch/verification/game_over_screen.png")

        await browser.close()

asyncio.run(main())