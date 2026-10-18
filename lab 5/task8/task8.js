const MOCK_DATA = {
    "/users": [
        { id: 101, name: "Ali", department: "CS" },
        { id: 102, name: "Sara", department: "CS" },
        { id: 103, name: "Usman", department: "SE" },
        { id: 104, name: "Hina", department: "AI" },
        { id: 105, name: "Ahmed", department: "SE" },
        { id: 106, name: "Zoya", department: "AI" }
    ],
    "/courses": [
        { code: "CS301", title: "Web Technologies", creditHours: 3 },
        { code: "CS401", title: "Enterprise Systems", creditHours: 4 },
        { code: "AI302", title: "Machine Learning", creditHours: 3 },
        { code: "SE305", title: "Software Architecture", creditHours: 3 }
    ],
    "/results": [
        { studentId: 101, marks: 82 },
        { studentId: 102, marks: 91 },
        { studentId: 103, marks: 47 },
        { studentId: 104, marks: 73 },
        { studentId: 105, marks: 64 },
        { studentId: 106, marks: 95 }
    ]
};

function fakeFetch(url, options = {}) {
    return new Promise((resolve, reject) => {
        const { signal } = options;

        if (signal && signal.aborted) {
            const abortError = new Error("The operation was aborted.");
            abortError.name = "AbortError";
            return reject(abortError);
        }

        let latency = 50;
        if (url === "/slow-endpoint") {
            latency = 400;
        }

        const timer = setTimeout(() => {
            if (url === "/network-error") {
                const netErr = new Error("NetworkError: Failed to connect to server.");
                netErr.name = "NetworkError";
                return reject(netErr);
            }

            if (url === "/server-error") {
                return resolve({
                    ok: false,
                    status: 500,
                    statusText: "Internal Server Error",
                    json: async () => ({ error: "Internal Database Connection Lost" })
                });
            }

            if (url === "/not-found" || !Object.prototype.hasOwnProperty.call(MOCK_DATA, url)) {
                if (url !== "/invalid-json" && url !== "/slow-endpoint") {
                    return resolve({
                        ok: false,
                        status: 404,
                        statusText: "Not Found",
                        json: async () => ({ error: `Endpoint ${url} not found.` })
                    });
                }
            }

            if (url === "/invalid-json") {
                return resolve({
                    ok: true,
                    status: 200,
                    statusText: "OK",
                    json: async () => {
                        throw new SyntaxError("Unexpected token '<' in JSON at position 0");
                    }
                });
            }

            const payload = MOCK_DATA[url] || { message: "Slow endpoint completed successfully" };
            return resolve({
                ok: true,
                status: 200,
                statusText: "OK",
                json: async () => JSON.parse(JSON.stringify(payload))
            });
        }, latency);

        if (signal) {
            signal.addEventListener("abort", () => {
                clearTimeout(timer);
                const abortError = new Error("The operation was aborted due to timeout.");
                abortError.name = "AbortError";
                reject(abortError);
            }, { once: true });
        }
    });
}

async function fetchWithTimeout(url, milliseconds, fetchImplementation = fakeFetch) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort();
    }, milliseconds);

    try {
        const response = await fetchImplementation(url, { signal: controller.signal });
        return response;
    } finally {
        clearTimeout(timeoutId);
    }
}

async function getJSON(url, fetchImplementation = fakeFetch) {
    let response;
    try {
        response = await fetchImplementation(url);
    } catch (err) {
        if (err.name === "AbortError") {
            throw new Error(`TimeoutError: Request to '${url}' timed out.`);
        }
        throw new Error(`NetworkError: Failed to fetch from '${url}' - ${err.message}`);
    }

    if (!response.ok) {
        throw new Error(`HTTPError: Request to '${url}' failed with status ${response.status} (${response.statusText})`);
    }

    try {
        const data = await response.json();
        return data;
    } catch (parseErr) {
        throw new Error(`JSONParseError: Failed to parse JSON from '${url}' - ${parseErr.message}`);
    }
}

async function loadCampusFlowDashboard(fetchImpl = fakeFetch) {
    // Concurrent API loading via Promise.all
    const [users, courses, results] = await Promise.all([
        getJSON("/users", fetchImpl),
        getJSON("/courses", fetchImpl),
        getJSON("/results", fetchImpl)
    ]);

    const totalStudents = users.length;
    const totalCourses = courses.length;

    const userMap = new Map();
    users.forEach(u => userMap.set(u.id, u));

    let totalMarks = 0;
    let failedStudentsCount = 0;
    let highestStudent = null;

    results.forEach(res => {
        totalMarks += res.marks;

        if (res.marks < 50) {
            failedStudentsCount++;
        }

        if (!highestStudent || res.marks > highestStudent.marks) {
            const studentUser = userMap.get(res.studentId);
            highestStudent = {
                studentId: res.studentId,
                name: studentUser ? studentUser.name : "Unknown",
                department: studentUser ? studentUser.department : "Unknown",
                marks: res.marks
            };
        }
    });

    const overallAverageMarks = results.length > 0
        ? Number((totalMarks / results.length).toFixed(2))
        : 0;

    const deptStats = {};
    results.forEach(res => {
        const studentUser = userMap.get(res.studentId);
        const dept = studentUser ? studentUser.department : "General";

        if (!deptStats[dept]) {
            deptStats[dept] = {
                students: 0,
                totalMarks: 0,
                averageMarks: 0
            };
        }

        deptStats[dept].students++;
        deptStats[dept].totalMarks += res.marks;
    });

    Object.keys(deptStats).forEach(dept => {
        deptStats[dept].averageMarks = Number((deptStats[dept].totalMarks / deptStats[dept].students).toFixed(2));
    });

    return {
        timestamp: new Date().toISOString(),
        totalStudents,
        totalCourses,
        overallAverageMarks,
        highestPerformingStudent: highestStudent,
        numberOfFailedStudents: failedStudentsCount,
        departmentWiseStatistics: deptStats
    };
}

async function runAggregatorDemo() {
    try {
        const dashboard = await loadCampusFlowDashboard();
        console.log("=== CampusFlow Dashboard ===");
        console.log(`Total Students: ${dashboard.totalStudents}`);
        console.log(`Total Courses : ${dashboard.totalCourses}`);
        console.log(`Average Marks : ${dashboard.overallAverageMarks}`);
        console.log(`Top Student   :`, dashboard.highestPerformingStudent);
        console.log(`Failed (< 50) : ${dashboard.numberOfFailedStudents}`);
        console.log(`Department Stats:`);
        console.table(dashboard.departmentWiseStatistics);
    } catch (err) {
        console.error("Dashboard error:", err.message);
    }

    console.log("\n--- Timeout and Error Classification Tests ---");

    // Test A: Succeeds before timeout
    try {
        const response = await fetchWithTimeout("/courses", 200, fakeFetch);
        const data = await response.json();
        console.log(`Test A Success: Fetched ${data.length} courses within timeout.`);
    } catch (err) {
        console.error("Test A Error:", err.message);
    }

    // Test B: Timeout triggered
    try {
        const fetchTimeoutWrapper = (url) => fetchWithTimeout(url, 100, fakeFetch);
        await getJSON("/slow-endpoint", fetchTimeoutWrapper);
    } catch (err) {
        console.log(`Test B Caught -> ${err.message}`);
    }

    // Test C: HTTP 404
    try {
        await getJSON("/not-found", fakeFetch);
    } catch (err) {
        console.log(`Test C Caught -> ${err.message}`);
    }

    // Test D: HTTP 500
    try {
        await getJSON("/server-error", fakeFetch);
    } catch (err) {
        console.log(`Test D Caught -> ${err.message}`);
    }

    // Test E: Network socket failure
    try {
        await getJSON("/network-error", fakeFetch);
    } catch (err) {
        console.log(`Test E Caught -> ${err.message}`);
    }

    // Test F: Invalid JSON
    try {
        await getJSON("/invalid-json", fakeFetch);
    } catch (err) {
        console.log(`Test F Caught -> ${err.message}`);
    }
}

runAggregatorDemo();
