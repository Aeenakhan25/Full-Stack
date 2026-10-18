/**
 * Task 2: Aggregating Multiple Promises with Promise.all and Conditional Validation
 * 
 * Uses Promise.all to handle multiple promises from two asynchronous functions.
 * Resolves (accepts) or rejects the main promise based on whether the details
 * fetched by both functions meet validation requirements.
 */

/**
 * Asynchronous Function 1: Fetches user profile details.
 * 
 * @param {number|string} userId 
 * @returns {Promise<Object>}
 */
async function fetchUserProfile(userId) {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch user profile (Status: ${response.status})`);
    }
    return await response.json();
}

/**
 * Asynchronous Function 2: Fetches posts created by the user.
 * 
 * @param {number|string} userId 
 * @returns {Promise<Array>}
 */
async function fetchUserPosts(userId) {
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch user posts (Status: ${response.status})`);
    }
    return await response.json();
}

/**
 * Main Function: Combines promises with Promise.all and resolves or rejects
 * the main promise based on validation of both results.
 * 
 * @param {number|string} userId 
 * @returns {Promise<Object>}
 */
function fetchCombinedUserData(userId) {
    return new Promise((resolve, reject) => {
        // Run both asynchronous functions concurrently
        const profilePromise = fetchUserProfile(userId);
        const postsPromise = fetchUserPosts(userId);

        // Catch multiple promises returned by the two asynchronous functions
        Promise.all([profilePromise, postsPromise])
            .then(([profile, posts]) => {
                // Validation checks for both fetched details
                const isProfileValid = profile && typeof profile === "object" && profile.id && profile.name;
                const arePostsValid = Array.isArray(posts) && posts.length > 0;

                if (isProfileValid && arePostsValid) {
                    // Accept the main promise
                    resolve({
                        status: "ACCEPTED",
                        message: "Both user profile and posts details are valid.",
                        data: {
                            user: profile,
                            postsCount: posts.length,
                            posts: posts
                        }
                    });
                } else {
                    // Reject the main promise if either validation fails
                    const invalidReasons = [];
                    if (!isProfileValid) invalidReasons.push("Profile data is invalid or missing required fields.");
                    if (!arePostsValid) invalidReasons.push("Posts data is invalid or empty.");

                    reject(new Error(`Validation Failed: ${invalidReasons.join(" ")}`));
                }
            })
            .catch(error => {
                // Reject the main promise if any fetch fails
                reject(new Error(`Fetch Failed: ${error.message}`));
            });
    });
}

// ==========================================
// Test Demonstrations
// ==========================================
async function runTests() {
    console.log("==================================================");
    console.log("TEST 1: Valid Data (User ID: 1)");
    console.log("Expected: Main Promise ACCEPTED");
    console.log("==================================================");
    try {
        const result = await fetchCombinedUserData(1);
        console.log("Main Promise Resolved:");
        console.log("Status:", result.status);
        console.log("Message:", result.message);
        console.log("User Name:", result.data.user.name);
        console.log("Total Posts Fetched:", result.data.postsCount);
    } catch (err) {
        console.error("Main Promise Rejected:", err.message);
    }

    console.log("\n==================================================");
    console.log("TEST 2: Invalid Posts / Empty Posts (User ID: 9999)");
    console.log("Expected: Main Promise REJECTED (Validation failure)");
    console.log("==================================================");
    try {
        const result = await fetchCombinedUserData(9999);
        console.log("Main Promise Resolved:", result);
    } catch (err) {
        console.error("Main Promise Rejected:");
        console.error("Reason:", err.message);
    }

    console.log("\n==================================================");
    console.log("TEST 3: Non-existent User (User ID: invalid_id)");
    console.log("Expected: Main Promise REJECTED (Fetch failure)");
    console.log("==================================================");
    try {
        const result = await fetchCombinedUserData("non_existent_user_xyz");
        console.log("Main Promise Resolved:", result);
    } catch (err) {
        console.error("Main Promise Rejected:");
        console.error("Reason:", err.message);
    }
}

runTests();
