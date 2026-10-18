const STUDENTS_DATA = [
    { id: 101, name: "Ali", completedCourses: ["CS201", "CS301"] },
    { id: 102, name: "Sara", completedCourses: ["CS101"] },
    { id: 103, name: "Usman", completedCourses: ["CS201", "CS301"] },
    { id: 104, name: "Hina", completedCourses: ["CS201", "CS301"] }
];

const COURSES_DATA = [
    { code: "CS401", title: "Enterprise Web Systems", prerequisite: "CS301", capacity: 2, enrolled: ["104"] },
    { code: "CS501", title: "Cloud Computing", prerequisite: "CS401", capacity: 1, enrolled: ["103"] },
    { code: "CS601", title: "Distributed Systems", prerequisite: "CS501", capacity: 5, enrolled: ["101"] }
];

function loadStudent(studentId, callback) {
    setTimeout(() => {
        const student = STUDENTS_DATA.find(s => s.id === Number(studentId));
        if (!student) {
            return callback(new Error(`Student with ID ${studentId} does not exist.`), null);
        }
        return callback(null, student);
    }, 50);
}

function checkPrerequisites(student, courseCode, callback) {
    setTimeout(() => {
        const course = COURSES_DATA.find(c => c.code === courseCode);
        if (!course) {
            return callback(new Error(`Course '${courseCode}' does not exist.`), null);
        }

        const hasPrerequisite = course.prerequisite === null || student.completedCourses.includes(course.prerequisite);
        if (!hasPrerequisite) {
            return callback(
                new Error(`Prerequisite '${course.prerequisite}' not completed by student ${student.id} for '${courseCode}'.`),
                null
            );
        }
        return callback(null, { student, course });
    }, 50);
}

function checkAvailableSeats(context, callback) {
    setTimeout(() => {
        const { course } = context;
        if (course.enrolled.length >= course.capacity) {
            return callback(new Error(`Course '${course.code}' is full (${course.enrolled.length}/${course.capacity}).`), null);
        }
        return callback(null, context);
    }, 50);
}

function registerCourse(context, callback) {
    setTimeout(() => {
        const { student, course } = context;
        const studentIdStr = String(student.id);

        if (course.enrolled.includes(studentIdStr)) {
            return callback(new Error(`Student ${student.id} is already registered in '${course.code}'.`), null);
        }

        const confirmation = {
            studentId: student.id,
            course: course.code,
            status: "REGISTERED"
        };
        return callback(null, confirmation);
    }, 50);
}

function enrollStudentWorkflow(studentId, courseCode, finalCallback) {
    loadStudent(studentId, (err1, student) => {
        if (err1) return finalCallback(err1, null);

        checkPrerequisites(student, courseCode, (err2, studentAndCourse) => {
            if (err2) return finalCallback(err2, null);

            checkAvailableSeats(studentAndCourse, (err3, validContext) => {
                if (err3) return finalCallback(err3, null);

                registerCourse(validContext, (err4, confirmation) => {
                    if (err4) return finalCallback(err4, null);
                    return finalCallback(null, confirmation);
                });
            });
        });
    });
}

function runLegacyServiceTests() {
    const scenarios = [
        { title: "Test 1: Successful Registration", studentId: 101, courseCode: "CS401" },
        { title: "Test 2: Non-existent Student", studentId: 999, courseCode: "CS401" },
        { title: "Test 3: Missing Prerequisite", studentId: 102, courseCode: "CS401" },
        { title: "Test 4: Course Full", studentId: 101, courseCode: "CS501" },
        { title: "Test 5: Already Registered", studentId: 104, courseCode: "CS401" }
    ];

    function runNext(index) {
        if (index >= scenarios.length) {
            console.log("\n--- Callback Hell Maintenance Analysis ---");
            console.log("1. Nesting: Each sequential dependency causes horizontal drift (Pyramid of Doom).");
            console.log("2. Error Handling: Repetitive 'if (err) return cb(err)' at every level; missing one breaks propagation.");
            console.log("3. Inversion of Control: Hard to guarantee callback executes exactly once and unhandled exceptions crash runtime.");
            return;
        }

        const sc = scenarios[index];
        enrollStudentWorkflow(sc.studentId, sc.courseCode, (err, confirmation) => {
            if (err) {
                console.log(`${sc.title} -> Error: ${err.message}`);
            } else {
                console.log(`${sc.title} -> Accepted:`, confirmation);
            }
            runNext(index + 1);
        });
    }

    runNext(0);
}

runLegacyServiceTests();
