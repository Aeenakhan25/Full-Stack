class Person {
    constructor(name, email) {
        if (!name || !email) {
            throw new Error("Person must have a valid name and email.");
        }
        this.name = name;
        this.email = email;
    }

    introduce() {
        return `Hello, I am ${this.name} (Email: ${this.email}).`;
    }
}

class Student extends Person {
    constructor(name, email, rollNo, marks) {
        super(name, email);
        this.rollNo = rollNo;
        this.marks = typeof marks === "number" ? marks : 0;
    }

    introduce() {
        return `${super.introduce()} I am a student [Roll No: ${this.rollNo}].`;
    }

    getResult() {
        const status = this.marks >= 50 ? "Pass" : "Fail";
        return `Student ${this.name} (${this.rollNo}) - Marks: ${this.marks}, Status: ${status}`;
    }
}

class FacultyMember extends Person {
    constructor(name, email, employeeId, department) {
        super(name, email);
        this.employeeId = employeeId;
        this.department = department;
    }

    introduce() {
        return `${super.introduce()} I am a faculty member in ${this.department} [ID: ${this.employeeId}].`;
    }
}

function runHierarchyAndThisDemo() {
    const student1 = new Student("Sara Khan", "sara@au.edu.pk", "210981", 88);
    const student2 = new Student("Usman Tariq", "usman@au.edu.pk", "210982", 42);
    const faculty1 = new FacultyMember("Dr. Babar", "babar@au.edu.pk", "EMP-401", "Computer Science");
    const faculty2 = new FacultyMember("Prof. Ayesha", "ayesha@au.edu.pk", "EMP-502", "Software Engineering");

    const users = [student1, student2, faculty1, faculty2];

    users.forEach(user => console.log(user.introduce()));

    console.log(student1.getResult());
    console.log(student2.getResult());

    console.log("student1 instanceof Student:", student1 instanceof Student);
    console.log("student1 instanceof Person :", student1 instanceof Person);
    console.log("faculty1 instanceof Person :", faculty1 instanceof Person);

    // this, call(), and bind() Challenge
    const guest = {
        name: "Dr. Ahmed",
        email: "ahmed@example.com"
    };

    console.log("call():", Person.prototype.introduce.call(guest));

    const fn = student1.introduce;
    try {
        fn();
    } catch (err) {
        console.log("Detached fn() error:", err.message);
        console.log("Explanation: In ES6 classes, methods run in strict mode. Detached fn() loses receiver; 'this' is undefined.");
    }

    const boundFn = student1.introduce.bind(student1);
    console.log("bind():", boundFn());
}

runHierarchyAndThisDemo();
