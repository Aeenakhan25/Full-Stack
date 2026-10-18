function createUpdateLog(studentId, ...updatedFieldNames) {
    const [firstField, secondField = "none", ...remainingFields] = updatedFieldNames;
    return `Student ${studentId} updated: ${firstField}, ${secondField} (+${remainingFields.length} more)`;
}

function updateStudentProfile(originalStudent, updateData) {
    if (!originalStudent || typeof originalStudent !== "object") {
        throw new Error("Invalid original student profile provided.");
    }

    if (!updateData || typeof updateData !== "object") {
        return { ...originalStudent };
    }

    const {
        address: originalAddress = {},
        contact: originalContact = {},
        ...originalPrimitives
    } = originalStudent;

    const {
        address: incomingAddress,
        contact: incomingContact,
        name: incomingName,
        marks: incomingMarks,
        scholarship: incomingScholarship,
        ...incomingOtherProps
    } = updateData;

    const {
        city: origCity,
        sector: origSector = "Not Assigned"
    } = originalAddress;

    const updatedName = incomingName !== undefined ? incomingName : originalPrimitives.name;
    const updatedMarks = incomingMarks ?? originalPrimitives.marks;
    const updatedScholarship = incomingScholarship ?? originalPrimitives.scholarship;

    const updatedAddress = {
        ...originalAddress,
        ...(incomingAddress ?? {}),
        city: incomingAddress?.city ?? origCity,
        sector: incomingAddress?.sector ?? origSector
    };

    const updatedContact = {
        ...originalContact,
        ...(incomingContact ?? {}),
        email: incomingContact?.email ?? originalContact?.email,
        phone: incomingContact?.phone ?? originalContact?.phone
    };

    const updatedStudent = {
        ...originalPrimitives,
        ...incomingOtherProps,
        name: updatedName,
        marks: updatedMarks,
        scholarship: updatedScholarship,
        address: updatedAddress,
        contact: updatedContact
    };

    return updatedStudent;
}

function verifyReferenceIntegrity(original, updated) {
    const isRootSame = original === updated;
    const isAddressSame = original.address === updated.address;
    const isContactSame = original.contact === updated.contact;

    return [
        {
            comparison: "original === updated",
            equal: isRootSame,
            explanation: "Spread syntax allocated a new object in memory."
        },
        {
            comparison: "original.address === updated.address",
            equal: isAddressSame,
            explanation: "A new address object was created to merge updates while preserving sector."
        },
        {
            comparison: "original.contact === updated.contact",
            equal: isContactSame,
            explanation: "A new contact object was created to add phone while keeping email."
        }
    ];
}

function runProfileUpdateDemo() {
    const student = {
        id: 101,
        name: "Ali",
        marks: 0,
        scholarship: false,
        address: {
            city: "Islamabad",
            sector: "F-10"
        },
        contact: {
            email: "ali@university.edu"
        }
    };

    const update = {
        name: "Ali Khan",
        address: {
            city: "Rawalpindi"
        },
        contact: {
            phone: "03001234567"
        }
    };

    console.log("Original Student:", student);

    const originalSnapshot = JSON.stringify(student);
    const updatedStudent = updateStudentProfile(student, update);

    console.log("Updated Student:", updatedStudent);

    const logMessage = createUpdateLog(student.id, "name", "address.city", "contact.phone");
    console.log("Update Log:", logMessage);

    console.log("\nVerifications:");
    console.log("1. ID unchanged:", updatedStudent.id === 101);
    console.log("2. City changed:", updatedStudent.address.city === "Rawalpindi");
    console.log("3. Sector retained:", updatedStudent.address.sector === "F-10");
    console.log("4. Email retained:", updatedStudent.contact.email === "ali@university.edu");
    console.log("5. Phone added:", updatedStudent.contact.phone === "03001234567");
    console.log("6. Falsy marks (0) preserved:", updatedStudent.marks === 0);
    console.log("7. Falsy scholarship (false) preserved:", updatedStudent.scholarship === false);
    console.log("8. Source not mutated:", JSON.stringify(student) === originalSnapshot);

    console.log("\nReference Challenge:");
    console.table(verifyReferenceIntegrity(student, updatedStudent));

    // Boundary Test: Explicit update with falsy values
    const boundaryResult = updateStudentProfile(updatedStudent, { name: "", marks: 0, scholarship: false });
    console.log("Boundary: Empty string name preserved:", boundaryResult.name === "");
    console.log("Boundary: Zero marks preserved:", boundaryResult.marks === 0);
    console.log("Boundary: False scholarship preserved:", boundaryResult.scholarship === false);
}

runProfileUpdateDemo();
