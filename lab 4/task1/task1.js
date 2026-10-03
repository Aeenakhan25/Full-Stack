// 1 & 2. Biography stored using 'var' and appropriate primitive types
var myName = "Aeena Khan";
var myAge = 21;
var isStudent = true;
var degree = "BSCS";
var birthplace = "Islamabad";

console.log("--- Primitive Variables ---");
console.log("Hello! My name is " + myName + ". I am " + myAge + " years old. I am a " + degree + " student, born and raised in " + birthplace + ".");
console.log("\n--- Object ---");

// 3. Biography stored in a JS Object with nested objects
var myBiography = {
    name: "Aeena Khan",
    age: 21,
    isStudent: true,
    hometown: "Islamabad",
    address: {
        city: "Islamabad",
        country: "Pakistan"
    },
    degreeProgram: {
        degree: "Bachelor of Science in Computer Science (BSCS)",
        uni: "Air university, E9 Campus",
        status: "Active Student"
    }
};
console.log("Biography Details:");
console.log("Name: " + myBiography.name);
console.log("Age: " + myBiography.age);
console.log("Student Status: " + (myBiography.isStudent ? "Enrolled" : "Not Enrolled"));
console.log("Hometown: " + myBiography.hometown);
console.log("Address: " + myBiography.address.city + ", " + myBiography.address.country);
console.log("Degree Program: " + myBiography.degreeProgram.degree + " at " + myBiography.degreeProgram.uni + " [" + myBiography.degreeProgram.status + "]");
