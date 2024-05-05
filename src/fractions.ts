type FractionLike = { n: bigint; d?: bigint };

export class Fraction {
    n: bigint;
    d: bigint;

    static readonly ZERO = new Fraction(0n, 1n);
    static readonly ONE = new Fraction(1n, 1n);

    constructor(n: bigint, d: bigint = 1n) {
        this.n = n;
        this.d = d;
    }

    toString() {
        return this.d === 1n ? `${this.n}` : `${this.n}/${this.d}`;
    }

    valueOf() {
        return Number(this.n) / Number(this.d);
    }

    plus({ n, d = 1n }: FractionLike) {
        return reduce(this.n * d + n * this.d, d * this.d);
    }

    minus({ n, d = 1n }: FractionLike) {
        return reduce(this.n * d - n * this.d, d * this.d);
    }

    times({ n, d = 1n }: FractionLike) {
        return reduce(this.n * n, this.d * d);
    }

    div({ n, d = 1n }: FractionLike) {
        return reduce(this.n * d, this.d * n);
    }

    compareTo({ n, d = 1n }: FractionLike) {
        return Number(this.n * d - n * this.d);
    }
}

function gcd(a: bigint, b: bigint): bigint {
    while (b != 0n) {
        [a, b] = [b, a % b];
    }
    return a;
}

function abs(a: bigint): bigint {
    return a < 0n ? -a : a;
}

function reduce(n: bigint, d: bigint): Fraction {
    const g = gcd(abs(n), abs(d));
    return new Fraction(n / g, d / g);
}
