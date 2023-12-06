import { browser } from "k6/experimental/browser";
import { check } from "k6";
import http from "k6/http";

const USERNAME = "";
const PASSWORD = "";

export const options = {
  scenarios: {
    ui: {
      executor: "constant-vus",
      exec: "browserTest",
      vus: 1,
      duration: "1m",
      options: {
        browser: {
          type: "chromium",
        },
      },
    },
    load: {
      executor: "constant-vus",
      exec: "load",
      vus: 1,
      duration: "1m",
    },
  },
  thresholds: {
    browser_http_req_duration: ["p(90) < 500"],
    browser_http_req_failed: ["rate == 0"],
    "browser_http_req_duration{url:https://cdnjs.cloudflare.com/ajax/libs/jquery.lazy/1.7.9/jquery.lazy.plugins.min.js}":
      ["p(90) < 100"],
  },
};

export async function browserTest() {
  const page = browser.newPage();

  try {
    await page.goto(
      "https://ecommerce-playground.lambdatest.io/index.php?route=account/login"
    );
    page.screenshot({ path: "screenshots/browserTestScreenshot_start.png" });

    page.locator("#input-email").type(USERNAME);
    page.locator("#input-password").type(PASSWORD);
    const submitButton = page.locator('input[value="Login"]');
    await Promise.all([page.waitForNavigation(), submitButton.click()]);

    check(page, {
      "Verify user is logged In": () =>
        page.locator(".breadcrumb-item.active").textContent() == "Account",
    });
    check(page, {
      "Verify the text": () =>
        page.locator(".breadcrumb-item.active").textContent() == "Test",
    });

    page.screenshot({ path: "screenshots/browserTestScreenshot_finish.png" });
  } finally {
    page.close();
  }
}

export function load() {
  const res = http.get(
    "https://ecommerce-playground.lambdatest.io/index.php?route=account/login"
  );

  check(res, {
    "status is 200": (r) => r.status === 200,
  });
}
