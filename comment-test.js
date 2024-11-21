const { Builder, By, Key, until } = require('selenium-webdriver');
const edge = require('selenium-webdriver/edge');
const path = require('path');

(async function runTests() {
    const service = new edge.ServiceBuilder(path.join('D:\\Dai_hoc\\Node.js\\Test', 'msedgedriver.exe')).build();
    const driverUser1 = new Builder()
        .forBrowser('MicrosoftEdge')
        .setEdgeService(service)
        .build();

    const driverUser2 = new Builder()
        .forBrowser('MicrosoftEdge')
        .setEdgeService(service)
        .build();

    // Function to log in
    async function login(driver, username, password) {
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

    // Function to post a comment
    async function postComment(driver, comment) {
        await driver.get('http://localhost:3000/home'); // Home URL
        await driver.findElement(By.name('content')).sendKeys(comment);
        await driver.findElement(By.xpath("//button[text()='Comment']")).click();
        await driver.sleep(2000); // Wait for comment to be posted
    }

    // Function to verify comment
    async function verifyComment(driver, comment) {
        await driver.get('http://localhost:3000/home'); // Home URL
        await driver.sleep(2000); // Wait for page to load
        const pageSource = await driver.getPageSource();
        return pageSource.includes(comment);
    }

    // Execute all tests
    try {
        // Log in as user1 and post different comments
        await login(driverUser1, "user1", "1");  // Replace with correct username and password
        await postComment(driverUser1, "This is a normal text comment.");
        handleTestResult("Test Normal Text Comment", await verifyComment(driverUser1, "This is a normal text comment."));
        
        await postComment(driverUser1, "This is a comment with enter\n and spaces.");
        handleTestResult("Test Comment with Enter and Spaces", await verifyComment(driverUser1, "This is a comment with enter\n and spaces."));
        
        await postComment(driverUser1, "Special characters !@#$%^&*()_+");
        handleTestResult("Test Comment with Special Characters", await verifyComment(driverUser1, "Special characters !@#$%^&*()_+"));
        
        await postComment(driverUser1, "Emojis 😊🚀");
        handleTestResult("Test Comment with Emojis", await verifyComment(driverUser1, "Emojis 😊🚀"));
        
        await postComment(driverUser1, "Comment in other language こんにちは");
        handleTestResult("Test Comment with Other Language Characters", await verifyComment(driverUser1, "Comment in other language こんにちは"));
        
        // Log in as user2 and verify the comment is displayed when the page refreshes
        await login(driverUser2, "baba", "1");  // Replace with correct username and password
        handleTestResult("Test Comment Displayed for Another User", await verifyComment(driverUser2, "This is a normal text comment."));

        // Test for potential injection attack
        const maliciousComment = "<script>alert('XSS');</script>";
        await postComment(driverUser1, maliciousComment);
        const isSafe = !(await driverUser1.getPageSource()).includes(maliciousComment);
        handleTestResult("Test for Injection Attack", isSafe);
    } finally {
        await driverUser1.quit();
        await driverUser2.quit();
    }
})();
