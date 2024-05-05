import { Fraction } from "./fractions";
import { outcomes } from "./rolls";

type Slice = [number, number];

export type Strategy = (outcome: number[], currentSum: number) => number[];
export type Utility = (finalSum: number) => bigint;
export type RollValueFunction = (outcome: number[], currentSum: number) => Fraction;

function optimizingStrategy(diceCount: number, values: Fraction[][]): Strategy {
    /**
     * values[n][s] is the expected value of the remainder of the game
     * when there are n dice left and your current sum is s.
     * Return a strategy that picks the reroll that has the highest expected value.
     * The strategy captures `values` by reference, so it can be built
     * incrementally using the strategy returned by this function.
     */
    const rerolls: Slice[][] = [];
    for (let n = 0; n <= diceCount; ++n) {
        // What can we do with an outcome on n dice?
        // Reroll the first m (0 <= m < n) or the last m (1 <= m < n).
        const rr: Slice[] = [];
        for (let m = 0; m < n; ++m) rr.push([0, m]);
        for (let m = 1; m < n; ++m) rr.push([m, n]);
        rerolls.push(rr);
    }

    return (outcome: number[], currentSum: number): number[] => {
        /** "outcome" is a list of length [1, dice_count] with dice in sorted
         * order. Returns the subset of the dice to reroll. */
        const outcomeSum = outcome.reduce((a, v) => a + v);
        let best: { rerollValue: Fraction, reroll: number[] } | null = null;
        for (const rerollSlice of rerolls[outcome.length]) {
            const reroll = outcome.slice(rerollSlice[0], rerollSlice[1]);
            const rerollSum = reroll.reduce((a, v) => a + v, 0);
            const keepSum = outcomeSum - rerollSum;
            // Suppose we had already accumulated "current_sum",
            // and now we keep another "keep_sum"
            // and reroll the "reroll_count" dice.
            const rerollValue = values[reroll.length][currentSum + keepSum];
            if (best == null || best.rerollValue.compareTo(rerollValue) < 0) best = { rerollValue, reroll };
        }
        return best!.reroll;
    };
}

function computeValuesSingleRow(
    n: number,
    diceCount: number,
    sides: number,
    strategy: Strategy,
    values: Fraction[][],
) {
    // What might the accumulated sum be at most with n dice remaining?
    const maxSum = (diceCount - n) * (sides - 1);
    const tmpValue: Fraction[] = [];
    // At the end, tmpValue[s] will be k**n times the expected utility.
    while (tmpValue.length < maxSum + 1) tmpValue.push(Fraction.ZERO);
    for (const { outcome, multiplicity } of outcomes(sides, n)) {
        const outcomeSum = outcome.reduce((a, v) => a + v);
        for (let currentSum = 0; currentSum <= maxSum; ++currentSum) {
            const reroll = strategy(outcome, currentSum);
            const rerollSum = reroll.reduce((a, v) => a + v, 0);
            const keepSum = outcomeSum - rerollSum;
            const rerollValue = values[reroll.length][currentSum + keepSum];
            tmpValue[currentSum] = tmpValue[currentSum].plus(rerollValue.times({ n: multiplicity }));
        }
    }
    return tmpValue.map(a => a.div({ n: BigInt(sides) ** BigInt(n) }));
}

export function computeValues(
    diceCount: number,
    sides: number,
    strategy: Strategy,
    utility: Utility,
) {
    // values[n][s] == v means that for n remaining dice,
    // accumulated sum s, the expected utility is v.
    const values: Fraction[][] = [];
    // Fill out "values" for n = 0 using the utility function.
    values.push([]);
    for (let s = 0; s <= diceCount * (sides - 1); ++s) values[0].push(new Fraction(BigInt(utility(s))));

    for (let n = 1; n <= diceCount; ++n) {
        values.push(computeValuesSingleRow(n, diceCount, sides, strategy, values));
    }
    return values;
}

export function solveGame(
    diceCount: number,
    sides: number,
    utility: Utility,
) {
    // values[n][s] == v means that for n remaining dice,
    // accumulated sum s, the expected utility is v.
    const values: Fraction[][] = [];
    // Fill out "values" for n = 0 using the utility function.
    values.push([]);
    for (let s = 0; s <= diceCount * (sides - 1); ++s) values[0].push(new Fraction(BigInt(utility(s))));
    const rerollStrategy = optimizingStrategy(diceCount, values);
    for (let n = 1; n <= diceCount; ++n) {
        values.push(computeValuesSingleRow(n, diceCount, sides, rerollStrategy, values));
    }
    return { values, rerollStrategy };
}

export function rollValueFunction(values: Fraction[][], strategy: Strategy): RollValueFunction {
    return (outcome: number[], currentSum: number) => {
        const outcomeSum = outcome.reduce((a, v) => a + v, 0);
        const reroll = strategy(outcome, 0);        
        const rerollSum = reroll.reduce((a, v) => a + v, 0);
        const keepSum = outcomeSum - rerollSum;
        return values[reroll.length][currentSum + keepSum];
    }
}
