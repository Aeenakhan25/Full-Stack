/**
 * Task 1: Async/Await API Fetch with Error Handling
 * 
 * Implements an async function that fetches user data from an API.
 * - On success: returns a valid user object.
 * - On failure: catches the error and returns an error details object.
 */

/**
 * Fetches user data by user ID from an API.
 * 
 * @param {number|string} userId - The user identifier to fetch.
 * @returns {Promise<Object>} Resolves with the user object on success, or an error object on failure.
 */
async function fetchUser(userId) {
    const url = `https://jsonplaceholder.typicode.com/users/${userId}`;
    
    try {
        const response = await fetch(url);
        
        // Check if HTTP status is in the 200-299 range
        if (!response.ok) {
            throw new Error(`Failed to fetch user. HTTP Status: ${response.status} (${response.statusText})`);
        }
        
        const user = await response.json();
        
        // Validate that user object has expected properties
        if (!user || typeof user !== "object" || Object.keys(user).length === 0 || !user.id) {
            throw new Error("Invalid user object received from API.");
        }
        
        return user;
    } catch (error) {
        // Return an error descriptor object on unsuccessful fetch
        return {
            success: false,
            error: error.message
        };
    }
}

// ==========================================
// Test Demonstrations
// ==========================================
async function runTests() {
    console.log("==========================================");
    console.log("TEST 1: Successful Fetch (User ID: 1)");
    console.log("==========================================");
    const validUser = await fetchUser(1);
    console.log("Result:", validUser);

    console.log("\n==========================================");
    console.log("TEST 2: Unsuccessful Fetch - User Not Found (User ID: 999999)");
    console.log("==========================================");
    const notFoundUser = await fetchUser(999999);
    console.log("Result:", notFoundUser);

    console.log("\n==========================================");
    console.log("TEST 3: Unsuccessful Fetch - Invalid Parameter");
    console.log("==========================================");
    const invalidReq = await fetchUser("invalid-id-endpoint/test");
    console.log("Result:", invalidReq);
}

runTests();
