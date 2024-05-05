import React from "react";
import { RollValueFunction, Strategy, rollValueFunction, solveGame } from "./policyeval";
import { describeKeepReroll } from "./descriptions";

function App() {
    const diceCount = 6;
    const sides = 6;
    const [{ rerollStrategy }] = React.useState(() => {
        return solveGame(diceCount, sides, s => {
            const opponents = 3n;
            const lose_factor = -1n;
            const max_lose = 14n;
            const strictly_below = 10n * opponents;
            const dead_on = 2n * opponents;
            const above = [4n, 8n, 12n, 16n, 20n, 24n];

            // "Skarpt under 11" => strictly less than 5
            // "30" => 24
            if (s < 5) {
                return strictly_below;
            } else if (s < 24) {
                // return 24 - s
                const a = 24n - BigInt(s);
                if (a < max_lose) return lose_factor * a;
                return lose_factor * max_lose;
            } else if (s == 24) {
                return dead_on;
            } else {
                return above[s - 25];
            }
        });
    });
    const [belowMaxProb] = React.useState(() => {
        const { values, rerollStrategy } = solveGame(diceCount, sides, s => s < 5 ? 1n : 0n);
        return rollValueFunction(values, rerollStrategy);
    });
    const [aboveMaxProb] = React.useState(() => {
        const { values, rerollStrategy } = solveGame(diceCount, sides, s => s >= 24 ? 1n : 0n);
        return rollValueFunction(values, rerollStrategy);
    });
    const [inp, setInp] = React.useState("");
    const roll = parseRoll(inp, diceCount, sides);
    const message = roll == null ? null :
        evaluateRoll(diceCount, sides, roll, rerollStrategy, belowMaxProb, aboveMaxProb);
    return <div>
        <div><input placeholder="Enter your roll" value={inp} onChange={e => setInp(e.target.value)} /></div>
        {message && <div>{message}</div>}
    </div>;
}

export default App;

function evaluateRoll(
    diceCount: number,
    sides: number,
    roll: number[],
    rerollStrategy: Strategy,
    belowMaxProb: RollValueFunction,
    aboveMaxProb: RollValueFunction,
) {
    const minSum = diceCount - roll.length;
    const maxSum = (diceCount - roll.length) * sides;
    // Convert one-indexed to zero-indexed dice
    const outcome = roll.map(v => v - 1);
    const rerolls: string[] = [];
    for (let s = minSum; s <= maxSum; ++s) rerolls.push(describeKeepReroll(diceCount, rerollStrategy, roll, s));
    let message = "";
    if (minSum === maxSum) {
        const reroll = rerolls[0];
        message = (`I would ${reroll}. `
            + `If you decide to go under, your chance is at most `
            + `${(belowMaxProb(outcome, 0).valueOf() * 100).toFixed(1)}%. `
            + `Otherwise, your chance is at most `
            + `${(aboveMaxProb(outcome, 0).valueOf() * 100).toFixed(1)}%.`);
    } else {
        let i = 0;
        const messages: string[] = [];
        while (i < rerolls.length) {
            let j = i++;
            while (i < rerolls.length && rerolls[i] === rerolls[j]) ++i;
            if (j === 0 && i === rerolls.length) messages.push(`I would ${rerolls[j]}.`);
            else if (i === j + 1) {
                messages.push(`If you have ${j + minSum}, I would ${rerolls[j]}. `);
            } else {
                messages.push(`If you have between ${j + minSum} and ${i + minSum - 1}, I would ${rerolls[j]}. `);
            }
        }
        message = messages.join("");
    }
    return message;
}

function parseRoll(inp: string, diceCount: number, sides: number) {
    const a = [...inp].map(s => +s).filter(s => !isNaN(s) && 1 <= s && s <= sides);
    if (1 <= a.length && a.length <= diceCount && a.join("") === inp.replace(/\s/g, "")) return a.sort();
    return null;
}
