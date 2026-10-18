import Student from "./Student.js";
import {
    calculateGrade,
    calculateAverage,
    calculateGPA as computeCumulativeGPA
} from "./gradeUtils.js";
import { processTranscriptJson } from "./transcriptService.js";

function executeTranscriptScenario(testTitle, jsonPayload) {
    console.log(`\n--- Scenario: ${testTitle} ---`);
    let isSuccess = false;

    try {
        const { reportObject, reportJson } = processTranscriptJson(jsonPayload);
        console.log(`Success: Processed ${reportObject.totalStudents} student(s).`);
        reportObject.transcripts.forEach(t => {
            console.log(`- ID: ${t.id} | Name: ${t.name} | Average: ${t.average}% | GPA: ${t.gpa}`);
        });
        console.log("JSON Output:", reportJson);
        isSuccess = true;
    } catch (error) {
        console.log(`Caught Error [${error.name}]: ${error.message}`);
    } finally {
        console.log(`[finally] Finished scenario: '${testTitle}' (Success: ${isSuccess})`);
    }
}

function runTask5Demos() {
    // Demonstration of direct import and aliased import
    const directStudent = new Student(999, "Direct Test Student");
    directStudent.addCourse("MATH101", 85);
    directStudent.addCourse("PHY101", 78);
    const directAvg = calculateAverage(directStudent.courses);
    const directGPA = computeCumulativeGPA(directStudent.courses);
    console.log(`Direct Import Verification -> ${directStudent.name}: Avg ${directAvg}, GPA ${directGPA}`);

    // 1. Normal Valid JSON
    const validJson = `
    [
      {
        "id": 101,
        "name": "Ali",
        "courses": [
          { "code": "CS301", "marks": 81 },
          { "code": "CS302", "marks": 74 }
        ]
      },
      {
        "id": 102,
        "name": "Sara",
        "courses": [
          { "code": "CS301", "marks": 92 },
          { "code": "CS302", "marks": 88 }
        ]
      }
    ]
    `;
    executeTranscriptScenario("Normal Valid JSON", validJson);

    // 2. Malformed JSON (SyntaxError)
    const malformedJson = `[ { "id": 103, "name": "Broken" "courses": [] } ]`;
    executeTranscriptScenario("Reject Malformed JSON", malformedJson);

    // 3. Missing Student ID (TypeError)
    const missingIdJson = `[ { "name": "No ID", "courses": [{ "code": "CS101", "marks": 80 }] } ]`;
    executeTranscriptScenario("Reject Missing Student ID", missingIdJson);

    // 4. Duplicate Student ID (Error)
    const duplicateIdJson = `
    [
      { "id": 201, "name": "Ali", "courses": [{ "code": "CS101", "marks": 80 }] },
      { "id": 201, "name": "Duplicate Ali", "courses": [{ "code": "CS102", "marks": 75 }] }
    ]
    `;
    executeTranscriptScenario("Reject Duplicate Student ID", duplicateIdJson);

    // 5. Course Marks Out of Bounds (RangeError)
    const outOfBoundsMarksJson = `[ { "id": 301, "name": "Zahid", "courses": [{ "code": "CS401", "marks": 108 }] } ]`;
    executeTranscriptScenario("Reject Marks > 100", outOfBoundsMarksJson);

    // 6. Missing Course Code (TypeError)
    const missingCourseCodeJson = `[ { "id": 401, "name": "Kiran", "courses": [{ "code": "", "marks": 85 }] } ]`;
    executeTranscriptScenario("Reject Missing Course Code", missingCourseCodeJson);
}

runTask5Demos();
