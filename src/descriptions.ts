import { Strategy } from "./policyeval";

export function describeKeepReroll(
    diceCount: number, strategy: Strategy, roll: number[], currentSum: number
) {
    // One-indexed roll to zero-indexed outcome
    const outcome = roll.map(v => v - 1);
    currentSum = currentSum - (diceCount - roll.length);
    const rerollZ = strategy(outcome, currentSum);
    // Zero-indexed reroll to one-indexed
    const reroll = rerollZ.map(v => v + 1);
    // if (0 < 1) return `reroll [${reroll}]`;

    const rollCounts = new Map<number, number>();
    for (const d of roll) rollCounts.set(d, (rollCounts.get(d) || 0) + 1);
    const rerollCounts = new Map<number, number>();
    for (const d of reroll) rerollCounts.set(d, (rerollCounts.get(d) || 0) + 1);
    const keep = [];
    for (const [d, c] of rollCounts.entries()) {
        const rr = rerollCounts.get(d);
        for (let n = rr || 0; n < c; ++n) keep.push(d);
    }

    if (reroll.length === 0) return "stop";
    if (keep.length === 1) return `keep a ${keep[0]}`;
    if (reroll.length === 1) return `reroll a ${reroll[0]}`;
    if (keep.length < reroll.length) return `keep ${keep}`;
    return `reroll ${reroll}`;
}