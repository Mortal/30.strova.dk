// https://chat.openai.com/share/d4b36294-0b98-400d-8dc8-ba759be6767f
function* combinationsWithReplacement(n: number, r: number) {
    if (!n && r) {
        return;
    }
    const indices: number[] = Array(r).fill(0);
    yield [...indices];
    while (true) {
        let i: number;
        for (i = r - 1; i >= 0; i--) {
            if (indices[i] !== n - 1) {
                break;
            }
        }
        if (i === -1) {
            return;
        }
        indices.fill(indices[i] + 1, i);
        yield [...indices];
    }
}

// Example usage:
// const iterable = ['A', 'B', 'C'];
// const r = 2;
// for (const combination of combinationsWithReplacement(iterable, r)) {
//     console.log(combination.join(''));
// }

function factorial(n: number): bigint {
    let nn = BigInt(n);
    let fac = BigInt(1);
    while (nn > 1n) fac *= nn--;
    return fac;
}

function permutations<T>(xs: T[]): bigint {
    const counts = new Map<T, number>();
    for (const x of xs) {
        counts.set(x, (counts.get(x) || 0) + 1);
    }
    let f = factorial(xs.length);
    let d = 1n;
    for (const n of counts.values()) d *= factorial(n);
    return f / d;
}

export function* outcomes(sides: number, diceCount: number) {
    for (const outcome of combinationsWithReplacement(sides, diceCount)) {
        const multiplicity = permutations(outcome);
        yield {outcome, multiplicity};
    }
}
