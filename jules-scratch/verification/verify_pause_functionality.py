from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    try:
        # Navigate to the local development server
        page.goto("http://localhost:5173", timeout=60000)

        # Wait for the game to be in the 'start' state
        expect(page.get_by_role("heading", name="Frame Breaker '85")).to_be_visible()

        # 1. Start the game
        page.get_by_role("button", name="Start Game").click()

        # Wait for the game to enter the 'playing' state (canvas is visible and UI is gone)
        expect(page.locator("canvas")).to_be_visible()
        expect(page.get_by_role("heading", name="Frame Breaker '85")).not_to_be_visible()

        # Give a moment for the game to render
        page.wait_for_timeout(500)

        # 2. Click the game screen to pause
        page.locator("#game-wrapper").click()

        # 3. Verify the game is paused and take a screenshot
        expect(page.get_by_role("heading", name="Paused")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/01_game_paused.png")

        # 4. Click the game screen again to resume
        page.locator("#game-wrapper").click()

        # 5. Verify the game has resumed and take a screenshot
        expect(page.get_by_role("heading", name="Paused")).not_to_be_visible()
        page.screenshot(path="jules-scratch/verification/02_game_resumed.png")

        print("Verification script completed successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error_screenshot.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run_verification(playwright)