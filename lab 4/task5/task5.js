function abs(...args) {
    if (args.length === 0) {
        return 0;
    } else if (args.length === 1) {
        return Math.abs(args[0]);
    } else {
        return args.map(arg => Math.abs(arg));
    }
}

function ceil(...args) {
    if (args.length === 0) {
        return 0;
    } else if (args.length === 1) {
        return Math.ceil(args[0]);
    } else {
        return args.map(arg => Math.ceil(arg));
    }
}

function floor(...args) {
    if (args.length === 0) {
        return 0;
    } else if (args.length === 1) {
        return Math.floor(args[0]);
    } else {
        return args.map(arg => Math.floor(arg));
    }
}

console.log("abs:");
console.log(abs()); // 0
console.log(abs(-4.7)); // 4.7
console.log(abs(-4.7, 4.4)); // [4.7, 4.4]

console.log("\nceil:");
console.log(ceil()); // 0
console.log(ceil(4.1)); // 5
console.log(ceil(4.1, 4.4)); // [5, 5]

console.log("\nfloor:");
console.log(floor()); // 0
console.log(floor(4.7)); // 4
console.log(floor(4.7, 4.4)); // [4, 4]
