function sumOfMultiples(x, y, z) {
    let sum = 0;
    for (let i = 1; i < z; i++) {
        if (i % x === 0 || i % y === 0) {
            sum += i;
        }
    }
    return sum;
}

// Example given in the task description: multiples of 3 or 5 below 10
console.log(sumOfMultiples(3, 5, 10)); // Output should be 23

// Additional tests
console.log(sumOfMultiples(3, 5, 1000)); // Standard Project Euler #1 test
