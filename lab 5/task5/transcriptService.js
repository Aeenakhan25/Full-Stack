import Student from "./Student.js";
import { calculateGrade, calculateAverage, calculateGPA } from "./gradeUtils.js";

function buildReportFromData(rawList) {
    if (!Array.isArray(rawList)) {
        throw new TypeError("Transcript data payload must be an array of student records.");
    }

    const seenIds = new Set();
    const studentReports = [];

    for (let i = 0; i < rawList.length; i++) {
        const item = rawList[i];

        if (!item || typeof item !== "object") {
            throw new TypeError(`Record at index ${i} is not a valid object.`);
        }

        if (item.id === undefined || item.id === null || String(item.id).trim() === "") {
            throw new TypeError(`Student record at index ${i} is missing an 'id'.`);
        }

        const normalizedId = String(item.id).trim();
        if (seenIds.has(normalizedId)) {
            throw new Error(`Duplicate student ID detected: '${normalizedId}'.`);
        }
        seenIds.add(normalizedId);

        if (!item.name || typeof item.name !== "string" || item.name.trim() === "") {
            throw new TypeError(`Student '${normalizedId}' has a missing or empty name.`);
        }

        if (!Array.isArray(item.courses)) {
            throw new TypeError(`Courses for student '${normalizedId}' must be an array.`);
        }

        const validatedCourses = [];
        for (let j = 0; j < item.courses.length; j++) {
            const course = item.courses[j];

            if (!course || typeof course !== "object") {
                throw new TypeError(`Student '${normalizedId}' has invalid course entry at index ${j}.`);
            }

            if (!course.code || typeof course.code !== "string" || course.code.trim() === "") {
                throw new TypeError(`Student '${normalizedId}' has missing or empty course code at index ${j}.`);
            }

            if (typeof course.marks !== "number" || Number.isNaN(course.marks)) {
                throw new TypeError(`Course '${course.code}' for student '${normalizedId}' contains non-numeric marks.`);
            }

            if (course.marks < 0 || course.marks > 100) {
                throw new RangeError(`Course '${course.code}' for student '${normalizedId}' has marks out of range (0 - 100): ${course.marks}`);
            }

            validatedCourses.push({
                code: course.code.trim(),
                marks: course.marks,
                grade: calculateGrade(course.marks)
            });
        }

        const studentInstance = new Student(normalizedId, item.name, validatedCourses);
        const average = calculateAverage(validatedCourses);
        const gpa = calculateGPA(validatedCourses);

        studentReports.push({
            id: studentInstance.id,
            name: studentInstance.name,
            courses: validatedCourses,
            average,
            gpa
        });
    }

    return {
        timestamp: new Date().toISOString(),
        totalStudents: studentReports.length,
        transcripts: studentReports
    };
}

export function processTranscriptJson(rawJson) {
    if (typeof rawJson !== "string") {
        throw new TypeError("Input must be a valid JSON string.");
    }

    let parsed;
    try {
        parsed = JSON.parse(rawJson);
    } catch (syntaxError) {
        throw new SyntaxError(`Malformed JSON payload provided: ${syntaxError.message}`);
    }

    const reportObject = buildReportFromData(parsed);
    const reportJson = JSON.stringify(reportObject, null, 2);

    return {
        reportObject,
        reportJson
    };
}
