export function calculateGrade(marks) {
    if (typeof marks !== "number" || Number.isNaN(marks)) {
        throw new TypeError("Marks must be a valid numeric value.");
    }
    if (marks < 0 || marks > 100) {
        throw new RangeError(`Marks value ${marks} out of allowable range (0 - 100).`);
    }

    if (marks >= 85) return "A";
    if (marks >= 80) return "A-";
    if (marks >= 75) return "B+";
    if (marks >= 70) return "B";
    if (marks >= 65) return "B-";
    if (marks >= 60) return "C+";
    if (marks >= 50) return "C";
    return "F";
}

export function gradeToPoints(grade) {
    switch (grade) {
        case "A": return 4.0;
        case "A-": return 3.67;
        case "B+": return 3.33;
        case "B": return 3.0;
        case "B-": return 2.67;
        case "C+": return 2.33;
        case "C": return 2.0;
        case "F": return 0.0;
        default: return 0.0;
    }
}

export function calculateAverage(courses) {
    if (!Array.isArray(courses)) {
        throw new TypeError("Courses must be an array.");
    }
    if (courses.length === 0) {
        return 0;
    }

    const totalMarks = courses.reduce((sum, course) => {
        if (typeof course.marks !== "number" || course.marks < 0 || course.marks > 100) {
            throw new RangeError(`Course ${course.code} contains invalid marks: ${course.marks}`);
        }
        return sum + course.marks;
    }, 0);

    return Number((totalMarks / courses.length).toFixed(2));
}

export function calculateGPA(courses) {
    if (!Array.isArray(courses)) {
        throw new TypeError("Courses must be an array.");
    }
    if (courses.length === 0) {
        return 0.0;
    }

    const totalPoints = courses.reduce((sum, course) => {
        const letter = calculateGrade(course.marks);
        const points = gradeToPoints(letter);
        return sum + points;
    }, 0);

    return Number((totalPoints / courses.length).toFixed(2));
}
