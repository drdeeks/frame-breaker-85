
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:5173", wait_until="networkidle")

    # Wait for the "Start Game" button to ensure the app is loaded
    start_game_button = page.locator('button:has-text("Start Game")')
    start_game_button.wait_for(state="visible", timeout=10000) # 10 second timeout

    # Now that the game is loaded, set the game state
    page.evaluate("window.gameLogic.setGameState('game-over')")

    # Wait for the "Connect Wallet" button to be visible
    connect_wallet_button = page.locator('button:has-text("Connect Wallet")')
    connect_wallet_button.wait_for(state="visible", timeout=5000)

    page.screenshot(path="jules-scratch/verification/verification.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
