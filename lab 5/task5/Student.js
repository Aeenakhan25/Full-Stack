
/**
 * Class representing a student's academic profile for transcript generation.
 */
class Student {
    /**
     * @param {number|string} id 
     * @param {string} name 
     * @param {Array<{code: string, marks: number}>} courses 
     */
    constructor(id, name, courses = []) {
        if (id === undefined || id === null) {
            throw new TypeError("Student must have a valid ID.");
        }
        if (!name || typeof name !== "string") {
            throw new TypeError("Student must have a valid name string.");
        }
        if (!Array.isArray(courses)) {
            throw new TypeError("Courses must be an array.");
        }

        this.id = id;
        this.name = name.trim();
        this.courses = courses;
    }

    /**
     * Adds a validated course record.
     * @param {string} code 
     * @param {number} marks 
     */
    addCourse(code, marks) {
        if (!code || typeof code !== "string") {
            throw new TypeError("Course code must be a non-empty string.");
        }
        if (typeof marks !== "number" || marks < 0 || marks > 100) {
            throw new RangeError(`Marks for course ${code} must be between 0 and 100.`);
        }
        this.courses.push({ code: code.trim(), marks: marks });
    }
}

// Default Export as required
export default Student;
