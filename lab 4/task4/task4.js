function roundMe(...args) {
    if (args.length === 0) {
        return 0;
    } else if (args.length === 1) {
        return Math.round(args[0]);
    } else {
        return args.map(arg => Math.round(arg));
    }
}

console.log(roundMe()); // returns 0
console.log(roundMe(4.7)); // returns 5
console.log(roundMe(4.7, 4.4)); // returns [5, 4]
