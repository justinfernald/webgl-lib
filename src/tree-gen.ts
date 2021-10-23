import { Grammar, r, randomGenerate } from "./utils/gen-grammar";

let grammar1: Grammar = {
    rules: {
        F: [
            {
                part: r`${"F"}[+${"F"}]${"F"}[-${"F"}]${"F"}`,
                weight: (t) => 1 / (t + 1),
            },
            { part: r`F`, weight: (t) => (t ? 0.5 : 0) },
        ],
    },
    starting: "F",
};

let grammar2: Grammar = {
    rules: {
        X: [
            {
                part: r`${"F"}[+${"X"}]${"F"}[-${"X"}]+${"X"}`,
                weight: (t) => 1 / (t + 1),
            },
            { part: r``, weight: (t) => (t ? 0.3 : 0) },
        ],
        F: [
            { part: r`${"F"}${"F"}`, weight: (t) => 1 / (t + 1) },
            { part: r`F`, weight: (t) => (t ? 0.3 : 0) },
        ],
    },
    starting: "X",
};

let grammar3: Grammar = {
    rules: {
        F: [
            {
                part: r`${"F"}[+${"F"}]${"F"}[-${"F"}][${"F"}]`,
                weight: (t) => (t < 5 ? 1 : 0),
            },
            { part: r`F`, weight: (t) => (t < 5 ? 0 : 1) },
        ],
    },
    starting: "F",
};

let grammar4: Grammar = {
    rules: {
        X: [
            {
                part: r`${"F"}[+${"X"}][-${"X"}]${"F"}${"X"}`,
                weight: (t) => (t < 7 ? 1 : 0),
            },
            { part: r``, weight: (t) => (t < 7 ? 0 : 1) },
        ],
        F: [
            { part: r`${"F"}${"F"}`, weight: (t) => (t < 7 ? 1 : 0) },
            { part: r`F`, weight: (t) => (t < 7 ? 0 : 1) },
        ],
    },
    starting: "X",
};

export default randomGenerate(grammar4).join("");
