let givenPrime = 11;

let nextNumber = givenPrime + 1;
let nextPrime = 0;

// Loop until we find the next prime
while (true) {
    let isPrime = true;

    for (let i = 2; i <= Math.sqrt(nextNumber); i++) {
        if (nextNumber % i === 0) {
            isPrime = false;
            break;
        }
    }
    if (isPrime && nextNumber > 1) {
        nextPrime = nextNumber;
        break;
    }
    nextNumber++;
}

console.log("The given prime number is: " + givenPrime);
console.log("The prime number after " + givenPrime + " is: " + nextPrime);
