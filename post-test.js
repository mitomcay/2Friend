const { Builder, By, Key, until } = require('selenium-webdriver');
const edge = require('selenium-webdriver/edge');
const path = require('path');

// Path to msedgedriver.exe
const service = new edge.ServiceBuilder(path.join('D:\\Dai_hoc\\Node.js\\Test', 'msedgedriver.exe')).build();
const options = new edge.Options();

(async function runTests() {
    const driver = new Builder()
        .forBrowser('MicrosoftEdge')
        .setEdgeService(service)
        .setEdgeOptions(options)
        .build();

    // Function to log in
    async function login(username, password) {
        await driver.get('http://localhost:3000/login'); // Login URL
        await driver.findElement(By.name('username')).sendKeys(username);
        await driver.findElement(By.name('password')).sendKeys(password);
        await driver.findElement(By.name('password')).sendKeys(Key.RETURN);
        await driver.sleep(3000); // Wait for login to complete
    }

    // Function to handle test result
    function handleTestResult(testName, passed) {
        if (passed) {
            console.log(`${testName}: Passed`);
        } else {
            console.error(`${testName}: Failed`);
        }
    }

    // Function to post a blank post
    async function testBlankPost() {
        await driver.get('http://localhost:3000/home'); // Home URL
        await driver.findElement(By.xpath("//button[text()='Post']")).click();
        await driver.sleep(2000);
        const pageSource = await driver.getPageSource();
        const passed = pageSource.includes("Error: Content is required");
        handleTestResult("Test Blank Post", passed);
    }

    // Function to post a text post
    async function testTextPost() {
        await driver.get('http://localhost:3000/home'); // Home URL
        await driver.findElement(By.name('content')).sendKeys("This is a text post.");
        await driver.findElement(By.xpath("//button[text()='Post']")).click();
        await driver.sleep(2000);
        const pageSource = await driver.getPageSource();
        const passed = pageSource.includes("This is a text post.");
        handleTestResult("Test Text Post", passed);
    }

    // Function to post an image post without text
    async function testImagePost() {
        await driver.get('http://localhost:3000/home'); // Home URL
        await driver.findElement(By.name('files')).sendKeys('C:\\Users\\minh0\\Downloads\\winnie.jpeg'); // Updated with correct image path
        await driver.findElement(By.xpath("//button[text()='Post']")).click();
        await driver.sleep(2000);
        const pageSource = await driver.getPageSource();
        const passed = pageSource.includes("winnie.jpeg");
        handleTestResult("Test Image Post", passed);
    }

    // Function to post an image post with text
    async function testImageTextPost() {
        await driver.get('http://localhost:3000/home'); // Home URL
        await driver.findElement(By.name('content')).sendKeys("This is a post with an image.");
        await driver.findElement(By.name('files')).sendKeys('C:\\Users\\minh0\\Downloads\\winnie.jpeg'); // Updated with correct image path
        await driver.findElement(By.xpath("//button[text()='Post']")).click();
        await driver.sleep(2000);
        const pageSource = await driver.getPageSource();
        const passed = pageSource.includes("This is a post with an image.") && pageSource.includes("winnie.jpeg");
        handleTestResult("Test Image and Text Post", passed);
    }

    // Execute all tests
    try {
        await login("user1", "1");  // Replace with correct username and password
        await testBlankPost();
        await testTextPost();
        await testImagePost();
        await testImageTextPost();
    } finally {
        await driver.quit();
    }
})();
