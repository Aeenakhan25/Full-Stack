function evaluateGrade(marks) {
    if (typeof marks !== "number" || Number.isNaN(marks) || marks < 0 || marks > 100) {
        return { grade: "N/A", gradePoints: 0.0, status: "Invalid Marks" };
    }

    if (marks >= 85) {
        return { grade: "A", gradePoints: 4.0, status: "Pass" };
    } else if (marks >= 80) {
        return { grade: "A-", gradePoints: 3.67, status: "Pass" };
    } else if (marks >= 75) {
        return { grade: "B+", gradePoints: 3.33, status: "Pass" };
    } else if (marks >= 70) {
        return { grade: "B", gradePoints: 3.0, status: "Pass" };
    } else if (marks >= 65) {
        return { grade: "B-", gradePoints: 2.67, status: "Pass" };
    } else if (marks >= 60) {
        return { grade: "C+", gradePoints: 2.33, status: "Pass" };
    } else if (marks >= 50) {
        return { grade: "C", gradePoints: 2.0, status: "Pass" };
    } else {
        return { grade: "F", gradePoints: 0.0, status: "Fail" };
    }
}

function processResults(resultsArray) {
    if (!Array.isArray(resultsArray)) {
        return [];
    }

    return resultsArray.map(student => {
        const gradeInfo = evaluateGrade(student.marks);
        return {
            id: student.id,
            name: student.name,
            department: student.department,
            course: student.course,
            marks: student.marks,
            grade: gradeInfo.grade,
            gradePoints: gradeInfo.gradePoints,
            status: gradeInfo.status
        };
    });
}

function getRankedMeritList(processedResults) {
    if (!Array.isArray(processedResults)) {
        return [];
    }

    return processedResults.slice().sort((studentA, studentB) => {
        if (studentB.marks !== studentA.marks) {
            return studentB.marks - studentA.marks;
        }
        return studentA.name.localeCompare(studentB.name);
    });
}

function getDepartmentStatistics(processedResults) {
    if (!Array.isArray(processedResults)) {
        return {};
    }

    const rawStats = processedResults.reduce((accumulator, student) => {
        const dept = student.department;

        if (!accumulator[dept]) {
            accumulator[dept] = {
                students: 0,
                totalMarks: 0,
                highest: student.marks,
                passed: 0
            };
        }

        accumulator[dept].students += 1;
        accumulator[dept].totalMarks += student.marks;

        if (student.marks > accumulator[dept].highest) {
            accumulator[dept].highest = student.marks;
        }

        if (student.status === "Pass") {
            accumulator[dept].passed += 1;
        }

        return accumulator;
    }, {});

    const formattedStats = {};
    Object.keys(rawStats).forEach(dept => {
        const data = rawStats[dept];
        formattedStats[dept] = {
            students: data.students,
            average: Number((data.totalMarks / data.students).toFixed(2)),
            highest: data.highest,
            passed: data.passed
        };
    });

    return formattedStats;
}

function runAcademicQueries(processedResults) {
    if (!Array.isArray(processedResults) || processedResults.length === 0) {
        return {
            firstAbove85: null,
            firstFailedIndex: -1,
            hasFailedStudent: false,
            allMarksValid: false,
            overallAverage: 0,
            aboveAverageStudents: [],
            topThreeNames: []
        };
    }

    const firstAbove85 = processedResults.find(student => student.marks > 85) || null;
    const firstFailedIndex = processedResults.findIndex(student => student.status === "Fail");
    const hasFailedStudent = processedResults.some(student => student.status === "Fail");
    const allMarksValid = processedResults.every(
        student => typeof student.marks === "number" && student.marks >= 0 && student.marks <= 100
    );

    const totalMarks = processedResults.reduce((sum, student) => sum + student.marks, 0);
    const overallAverage = Number((totalMarks / processedResults.length).toFixed(2));

    const aboveAverageStudents = processedResults.filter(student => student.marks > overallAverage);

    const rankedList = getRankedMeritList(processedResults);
    const topThreeNames = rankedList.slice(0, 3).map(student => student.name);

    return {
        firstAbove85,
        firstFailedIndex,
        hasFailedStudent,
        allMarksValid,
        overallAverage,
        aboveAverageStudents,
        topThreeNames
    };
}

function runIntelligenceEngineDemo() {
    const sampleResults = [
        { id: 1, name: 'Ali', department: 'CS', course: 'FSWD', marks: 82 },
        { id: 2, name: 'Sara', department: 'CS', course: 'FSWD', marks: 91 },
        { id: 3, name: 'Usman', department: 'SE', course: 'FSWD', marks: 47 },
        { id: 4, name: 'Hina', department: 'AI', course: 'FSWD', marks: 73 },
        { id: 5, name: 'Ahmed', department: 'SE', course: 'FSWD', marks: 64 },
        { id: 6, name: 'Zoya', department: 'AI', course: 'FSWD', marks: 91 },
        { id: 7, name: 'Bilal', department: 'DS', course: 'FSWD', marks: 85 },
        { id: 8, name: 'Ammar', department: 'DS', course: 'FSWD', marks: 85 }
    ];

    const originalBackup = JSON.stringify(sampleResults);

    // Part A: Result Processing
    const processed = processResults(sampleResults);
    console.log("--- PART A: Enriched Results ---");
    console.table(processed);

    // Part B: Ranked Merit List
    const ranked = getRankedMeritList(processed);
    console.log("\n--- PART B: Ranked Merit List ---");
    console.table(ranked.map(s => ({ Name: s.name, Marks: s.marks, Dept: s.department })));

    console.log(`Original Array Mutation Check: ${JSON.stringify(sampleResults) === originalBackup ? "PASSED" : "FAILED"}`);

    // Part C: Department Statistics
    const deptStats = getDepartmentStatistics(processed);
    console.log("\n--- PART C: Dynamic Department Statistics ---");
    console.log(JSON.stringify(deptStats, null, 2));

    // Part D: Academic Queries
    const queries = runAcademicQueries(processed);
    console.log("\n--- PART D: Academic Queries ---");
    console.log("1. First student scoring > 85   :", queries.firstAbove85 ? `${queries.firstAbove85.name} (${queries.firstAbove85.marks})` : "None");
    console.log("2. Index of first failed student :", queries.firstFailedIndex);
    console.log("3. At least one student failed?  :", queries.hasFailedStudent);
    console.log("4. Every student marks valid?    :", queries.allMarksValid);
    console.log("5. Overall Average Score         :", queries.overallAverage);
    console.log("   Above average students        :", queries.aboveAverageStudents.map(s => `${s.name} (${s.marks})`).join(", "));
    console.log("6. Top 3 Students                :", queries.topThreeNames.join(", "));
}

runIntelligenceEngineDemo();
