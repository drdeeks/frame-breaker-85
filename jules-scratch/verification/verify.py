from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5173")
        page.screenshot(path="jules-scratch/verification/screenshot.png")
        browser.close()

if __name__ == "__main__":
    run()