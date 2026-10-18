
const SUPPORTED_PROGRAMS = ["BSCS", "BSSE", "BSAI", "BSIT", "BSEE"];

/**
 * 
 * @param {Object} rawApplicant 
 * @returns {Object} 
 */
function sanitizeApplicantData(rawApplicant) {
    const errors = [];

    if (!rawApplicant || typeof rawApplicant !== "object") {
        return {
            isValid: false,
            errors: ["Applicant data must be a valid non-null object."],
            data: null
        };
    }

    const {
        id,
        name,
        age,
        matricMarks,
        intermediateMarks,
        entryTest,
        program,
        feePaid
    } = rawApplicant;

    if (!id || typeof id !== "string" || id.trim() === "") {
        errors.push("Missing or invalid Applicant ID.");
    }

    if (!name || typeof name !== "string" || name.trim() === "") {
        errors.push("Missing or invalid Applicant Name.");
    }

    let parsedAge = NaN;
    if (age !== undefined && age !== null && String(age).trim() !== "") {
        parsedAge = Number(age);
    }

    if (Number.isNaN(parsedAge)) {
        errors.push(`Invalid age value: '${age}'. Must be a valid number.`);
    } else if (parsedAge < 17 || parsedAge > 30) {
        errors.push(`Age ${parsedAge} out of allowable range (17 - 30).`);
    }

    function parseAndValidateMark(value, fieldName) {
        if (value === undefined || value === null || String(value).trim() === "") {
            errors.push(`Missing value for ${fieldName}.`);
            return NaN;
        }
        const numericVal = Number(value);
        if (Number.isNaN(numericVal)) {
            errors.push(`Invalid numeric conversion for ${fieldName}: '${value}'.`);
            return NaN;
        }
        if (numericVal < 0 || numericVal > 100) {
            errors.push(`${fieldName} (${numericVal}) must be between 0 and 100.`);
            return NaN;
        }
        return numericVal;
    }

    const parsedMatric = parseAndValidateMark(matricMarks, "matricMarks");
    const parsedInter = parseAndValidateMark(intermediateMarks, "intermediateMarks");
    const parsedEntryTest = parseAndValidateMark(entryTest, "entryTest");

    // 4. Validate Program against supported list
    const normalizedProgram = typeof program === "string" ? program.trim().toUpperCase() : "";
    let isProgramSupported = false;
    switch (normalizedProgram) {
        case "BSCS":
        case "BSSE":
        case "BSAI":
        case "BSIT":
        case "BSEE":
            isProgramSupported = true;
            break;
        default:
            isProgramSupported = false;
    }

    if (!isProgramSupported) {
        errors.push(`Unsupported academic program: '${program}'. Supported: ${SUPPORTED_PROGRAMS.join(", ")}`);
    }

    // 5. Explicit boolean conversion for feePaid
    let isFeePaid = false;
    if (typeof feePaid === "boolean") {
        isFeePaid = feePaid;
    } else if (typeof feePaid === "string") {
        isFeePaid = feePaid.trim().toLowerCase() === "true";
    }

    const isValid = errors.length === 0;

    return {
        isValid: isValid,
        errors: errors,
        data: isValid ? {
            id: String(id).trim(),
            name: String(name).trim(),
            age: parsedAge,
            matricMarks: parsedMatric,
            intermediateMarks: parsedInter,
            entryTest: parsedEntryTest,
            program: normalizedProgram,
            feePaid: isFeePaid
        } : null
    };
}

/**
 * @param {number} matric 
 * @param {number} intermediate 
 * @param {number} entryTest 
 * @returns {number} 
 */
function calculateMerit(matric, intermediate, entryTest) {
    const rawMerit = (matric * 0.20) + (intermediate * 0.30) + (entryTest * 0.50);
    return Number(rawMerit.toFixed(2));
}

/**
 * @param {Object} rawApplicant 
 * @returns {Object}
 */
function processApplicant(rawApplicant) {
    const sanitization = sanitizeApplicantData(rawApplicant);

    if (!sanitization.isValid) {
        return {
            id: rawApplicant && rawApplicant.id ? rawApplicant.id : "UNKNOWN",
            name: rawApplicant && rawApplicant.name ? rawApplicant.name : "UNKNOWN",
            program: rawApplicant && rawApplicant.program ? rawApplicant.program : "UNKNOWN",
            status: "INVALID DATA",
            merit: null,
            sanitizedData: null,
            errors: sanitization.errors
        };
    }

    const validData = sanitization.data;
    const merit = calculateMerit(
        validData.matricMarks,
        validData.intermediateMarks,
        validData.entryTest
    );

    // Eligibility condition: Merit >= 70, Entry Test >= 60, and Intermediate >= 60
    const isEligible = merit >= 70 && validData.entryTest >= 60 && validData.intermediateMarks >= 60;

    let status = "REJECTED";

    if (isEligible) {
        // Condition distinguishing SELECTED and WAITING:
        // Merit >= 80 qualifies for direct selection; 70 <= Merit < 80 is placed on waiting list
        status = merit >= 80 ? "SELECTED" : "WAITING";
    }

    return {
        id: validData.id,
        name: validData.name,
        program: validData.program,
        status: status,
        merit: merit,
        sanitizedData: validData,
        errors: []
    };
}

/**
 * @param {Array<Object>} applicantsArray 
 * @returns {Object} 
 */
function processAdmissions(applicantsArray) {
    if (!Array.isArray(applicantsArray)) {
        return {
            processedApplicants: [],
            summary: null,
            error: "Input must be an array of applicant objects."
        };
    }

    const processed = [];
    const validApplicants = [];
    let invalidCount = 0;
    const programCounts = {};

    for (let i = 0; i < SUPPORTED_PROGRAMS.length; i++) {
        programCounts[SUPPORTED_PROGRAMS[i]] = 0;
    }
    programCounts["OTHER/INVALID"] = 0;

    for (let i = 0; i < applicantsArray.length; i++) {
        const result = processApplicant(applicantsArray[i]);
        processed.push(result);

        const prog = result.program;
        if (Object.prototype.hasOwnProperty.call(programCounts, prog)) {
            programCounts[prog]++;
        } else {
            programCounts["OTHER/INVALID"]++;
        }

        if (result.status === "INVALID DATA") {
            invalidCount++;
        } else {
            validApplicants.push(result);
        }
    }

    let highestMeritApplicant = null;
    let lowestMeritApplicant = null;
    let totalMerit = 0;

    if (validApplicants.length > 0) {
        highestMeritApplicant = validApplicants[0];
        lowestMeritApplicant = validApplicants[0];

        for (let i = 0; i < validApplicants.length; i++) {
            const current = validApplicants[i];
            totalMerit += current.merit;

            if (current.merit > highestMeritApplicant.merit) {
                highestMeritApplicant = current;
            }
            if (current.merit < lowestMeritApplicant.merit) {
                lowestMeritApplicant = current;
            }
        }
    }

    const averageMerit = validApplicants.length > 0
        ? Number((totalMerit / validApplicants.length).toFixed(2))
        : 0;

    const summary = {
        totalApplicants: applicantsArray.length,
        validApplicantsCount: validApplicants.length,
        invalidApplicantsCount: invalidCount,
        highestMeritApplicant: highestMeritApplicant ? {
            id: highestMeritApplicant.id,
            name: highestMeritApplicant.name,
            program: highestMeritApplicant.program,
            merit: highestMeritApplicant.merit
        } : null,
        lowestMeritApplicant: lowestMeritApplicant ? {
            id: lowestMeritApplicant.id,
            name: lowestMeritApplicant.name,
            program: lowestMeritApplicant.program,
            merit: lowestMeritApplicant.merit
        } : null,
        averageMerit: averageMerit,
        programCounts: programCounts
    };

    return {
        processedApplicants: processed,
        summary: summary
    };
}

function runAdmissionSystemDemo() {
    console.log("================================================================================");
    console.log("CampusFlow: Admission Decision & Data Sanitization Engine Demonstration");
    console.log("================================================================================\n");

    const sampleApplicants = [
        // Normal Case  
        {
            id: "A101",
            name: "Sara Khan",
            age: "19",
            matricMarks: "91",
            intermediateMarks: "87",
            entryTest: "78",
            program: "BSCS",
            feePaid: "true"
        },
        // Invalid Case
        {
            id: "A102",
            name: "Ahmed Ali",
            age: "twenty",
            matricMarks: "88",
            intermediateMarks: "",
            entryTest: "72",
            program: "BSSE",
            feePaid: "false"
        },
        // Normal Case:
        {
            id: "A103",
            name: "Hassan",
            age: "18",
            matricMarks: "76",
            intermediateMarks: "83",
            entryTest: "91",
            program: "BSAI",
            feePaid: "true"
        },
        // Boundary Case
        {
            id: "A104",
            name: "Bilal Tariq",
            age: "17",
            matricMarks: "95",
            intermediateMarks: "60",
            entryTest: "66",
            program: "BSCS",
            feePaid: "true"
        },
        // Boundary/Eligible Case:
        {
            id: "A105",
            name: "Zainab Bibi",
            age: "24",
            matricMarks: "90",
            intermediateMarks: "59",
            entryTest: "85",
            program: "BSSE",
            feePaid: "true"
        },
        // Boundary Case
        {
            id: "A106",
            name: "Hamza Malik",
            age: "31",
            matricMarks: "80",
            intermediateMarks: "80",
            entryTest: "80",
            program: "BSCS",
            feePaid: "true"
        },
        // Invalid Case
        {
            id: "A107",
            name: "Ayesha Noor",
            age: "20",
            matricMarks: "85",
            intermediateMarks: "82",
            entryTest: "75",
            program: "BBA",
            feePaid: "true"
        },
        // Boundary Case
        {
            id: "A108",
            name: "Daniyal Shah",
            age: "22",
            matricMarks: "105",
            intermediateMarks: "80",
            entryTest: "70",
            program: "BSAI",
            feePaid: "true"
        }
    ];

    const result = processAdmissions(sampleApplicants);

    console.log("Processed Applicants:");
    console.table(result.processedApplicants.map(app => ({
        ID: app.id,
        Name: app.name,
        Program: app.program,
        Status: app.status,
        Merit: app.merit !== null ? app.merit : "N/A",
        Issues: app.errors.length > 0 ? app.errors.join("; ") : "None"
    })));

    console.log("\n================================================================================");
    console.log("Analytics Summary:");
    console.log("================================================================================");
    console.log("Total Applicants Received    :", result.summary.totalApplicants);
    console.log("Valid Applicants             :", result.summary.validApplicantsCount);
    console.log("Invalid Applicants           :", result.summary.invalidApplicantsCount);
    console.log("Highest Merit Applicant      :", result.summary.highestMeritApplicant);
    console.log("Lowest Merit (Valid)         :", result.summary.lowestMeritApplicant);
    console.log("Average Merit (Valid)        :", result.summary.averageMerit);
    console.log("Applicant Count per Program  :", result.summary.programCounts);
}

runAdmissionSystemDemo();
