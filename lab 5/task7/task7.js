const STUDENTS_STORE = [
    { id: 101, name: "Ali", completedCourses: ["CS201", "CS301"] },
    { id: 102, name: "Sara", completedCourses: ["CS101"] },
    { id: 103, name: "Usman", completedCourses: ["CS201", "CS301"] }
];

const COURSES_PRIMARY_SERVER = [
    { code: "CS401", title: "Cloud Architecture", prerequisite: "CS301", capacity: 2, enrolledCount: 1 },
    { code: "CS501", title: "Machine Learning", prerequisite: "CS401", capacity: 1, enrolledCount: 1 }
];

const COURSES_MIRROR_SERVER = [
    { code: "CS401", title: "Cloud Architecture (Mirror)", prerequisite: "CS301", capacity: 2, enrolledCount: 1 },
    { code: "CS501", title: "Machine Learning (Mirror)", prerequisite: "CS401", capacity: 1, enrolledCount: 1 }
];

function getStudent(studentId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const student = STUDENTS_STORE.find(s => s.id === Number(studentId));
            if (!student) return reject(new Error(`Student with ID ${studentId} not found.`));
            return resolve(student);
        }, 30);
    });
}

function getCourse(courseCode) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const course = COURSES_PRIMARY_SERVER.find(c => c.code === courseCode);
            if (!course) return reject(new Error(`Course ${courseCode} not found on primary server.`));
            return resolve(course);
        }, 30);
    });
}

function checkPrerequisites(context) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const { student, course } = context;
            const isSatisfied = !course.prerequisite || student.completedCourses.includes(course.prerequisite);
            if (!isSatisfied) {
                return reject(new Error(`Prerequisite '${course.prerequisite}' not completed by student ${student.id}.`));
            }
            return resolve(context);
        }, 30);
    });
}

function checkSeats(context) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const { course } = context;
            if (course.enrolledCount >= course.capacity) {
                return reject(new Error(`Course '${course.code}' is full (${course.enrolledCount}/${course.capacity}).`));
            }
            return resolve(context);
        }, 30);
    });
}

function registerStudent(context) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const { student, course } = context;
            return resolve({
                studentId: student.id,
                course: course.code,
                status: "REGISTERED",
                timestamp: new Date().toISOString()
            });
        }, 30);
    });
}

function sendEmail(confirmation) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(`Email sent to student ${confirmation.studentId}`), 40);
    });
}

function sendSMS() {
    return new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error("SMS gateway timeout")), 50);
    });
}

function writeAuditLog(confirmation) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(`Audit log recorded for student ${confirmation.studentId}`), 20);
    });
}

function fetchCourseFromServerA(courseCode) {
    return new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error("Server A HTTP 503 Service Unavailable")), 20);
    });
}

function fetchCourseFromServerB(courseCode) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const course = COURSES_MIRROR_SERVER.find(c => c.code === courseCode);
            if (course) return resolve(course);
            return reject(new Error("Course not found on Mirror Server B"));
        }, 60);
    });
}

// Part A: Registration Chain
function executeRegistrationChain(studentId, courseCode) {
    return getStudent(studentId)
        .then(student => getCourse(courseCode).then(course => ({ student, course })))
        .then(context => checkPrerequisites(context))
        .then(context => checkSeats(context))
        .then(context => registerStudent(context))
        .catch(error => {
            throw error;
        })
        .finally(() => {
            console.log(`[finally] Registration chain completed for student ${studentId}.`);
        });
}

// Part B: Post-Registration Services
function executePostRegistrationServices(confirmation) {
    const emailPromise = sendEmail(confirmation);
    const smsPromise = sendSMS();
    const auditPromise = writeAuditLog(confirmation);

    return Promise.allSettled([emailPromise, smsPromise, auditPromise])
        .then(results => {
            const [emailResult, smsResult, auditResult] = results;
            return [
                { service: "Email", status: emailResult.status },
                { service: "SMS", status: smsResult.status },
                { service: "Audit", status: auditResult.status }
            ];
        });
}

// Part C: Redundant Service Selection
function getCourseFromRedundantServers(courseCode) {
    const serverAPromise = fetchCourseFromServerA(courseCode);
    const serverBPromise = fetchCourseFromServerB(courseCode);
    return Promise.any([serverAPromise, serverBPromise]);
}

function runAllDemos() {
    executeRegistrationChain(101, "CS401")
        .then(confirmation => {
            console.log("Part A Succeeded:", confirmation);
            return executePostRegistrationServices(confirmation);
        })
        .then(servicesReport => {
            console.log("Part B Report (Promise.allSettled):", servicesReport);
            return getCourseFromRedundantServers("CS401");
        })
        .then(courseData => {
            console.log("Part C Succeeded (Promise.any):", courseData.title);
            console.log("\nJustification:");
            console.log("- Promise.any() resolves on the first SUCCESSFUL promise, ignoring Server A's quick failure.");
            console.log("- Promise.race() would fail prematurely if the faster server returned an error.");
            console.log("- Promise.allSettled() in Part B ensures all notifications settle without fail-fast aborts.");

            // Test boundary failures
            return executeRegistrationChain(102, "CS401");
        })
        .catch(err => {
            console.log("Caught Expected Chain Error:", err.message);
        });
}

runAllDemos();
