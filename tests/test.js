import { Builder, By, Key, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';

/**
 * A simple end-to-end test to simulate a user logging into a web application.
 * This function navigates to the login page, enters credentials, and verifies
 * that the user is redirected and logged in successfully.
 */

//SignUp Test..
async function signUpTest() {
   // Build a new driver instance for the Chrome browser.
  let driver = await new Builder().forBrowser('chrome').build();

  try {
    // 1. Navigate to your React application's signup page.
    await driver.get('http://localhost:5173/signup');

    // 2. Find the name, username and password input fields and the submit button.
    const nameInput = await driver.findElement(By.css('input[type="text"]'));
    const usernameInput = await driver.findElement(By.css('input[type="email"]'));
    const passwordInput = await driver.findElement(By.css('input[type="password"]'));
    const loginButton = await driver.findElement(By.css('button[type="submit"]'));

    // 3. Type in the credentials using the sendKeys method.
    await nameInput.sendKeys('gksPro');
    await usernameInput.sendKeys('gks1.pro@gmail.com');
    await passwordInput.sendKeys('Aa@#12345');

    // 4. Click the login button to submit the form.
    await loginButton.click();

    // 5. Wait for the URL to change to the HOME page URL.
    await driver.wait(until.urlIs('http://localhost:5173/login'), 5000);
    
    console.log('Login test passed!');

  } catch (error) {
    console.error('Login test failed:', error);
    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync('login-failure.png', screenshot, 'base64');
    console.log('Screenshot saved to login-failure.png');

  } finally {
    await driver.quit();
  }
}
signUpTest();




// async function loginTest() {
//   let driver = await new Builder().forBrowser('chrome').build();

//   try {
    
//     await driver.get('http://localhost:5173/login');

//     const usernameInput = await driver.findElement(By.css('input[type="email"]'));
//     const passwordInput = await driver.findElement(By.css('input[type="password"]'));
//     const loginButton = await driver.findElement(By.css('button[type="submit"]'));

//     await usernameInput.sendKeys('gks1.pro@gmail.com');
//     await passwordInput.sendKeys('Aa@#12345');

//     await loginButton.click();

//     // Wait for the URL to change to the HOME page URL.
//     await driver.wait(until.urlIs('http://localhost:5173/'), 10000);

//      //I used this to check if the login was successful by looking for a logout button is there  in the home page or not
//     // Optionally, u can verify that a specific element is present on the home page
//     // const logoutLocator = By.xpath("//*[text()='Logout']");
//     // await driver.wait(until.elementLocated(logoutLocator), 10000);
    
//     console.log('Login test passed!');

//   } catch (error) {
    
//     console.error('Login test failed:', error);
//     const screenshot = await driver.takeScreenshot();
//     fs.writeFileSync('login-failure.png', screenshot, 'base64');
//     console.log('Screenshot saved to login-failure.png');

//   } finally {
//     await driver.quit();
//   }
// }
// loginTest();

