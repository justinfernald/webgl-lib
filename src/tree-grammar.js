console.log = (x) => console.dir(x, { depth: null })

function r(terminals, ...nonTerminals) {
    // this represents rules // done
    let parts = [];
    for (let [index, text] of Object.entries(terminals)) {
        if (text.length > 0) {
            for (let c of text) {
                parts.push({
                    type: "t",
                    value: c,
                });
            }
        }
        if (nonTerminals[index]) {
            parts.push({
                type: "nt",
                value: nonTerminals[index],
            });
        }
    }
    return parts;
}

let epsilon = r``;

let grammar = {
    rules: {
        X: [{ part: r`${"F"}[+${"X"}]${"F"}[-${"X"}]+${"X"}`, weight: (t) => 1 / (t + 1) }, { part: r``, weight: (t) => t ? 0.3 : 0 }],
        F: [{ part: r`${"F"}${"F"}`, weight: (t) => 1 / (t + 1) }, { part: r`F`, weight: (t) => t ? 0.3 : 0 }]
    },
    starting: "X"
}


function randomGenerate({ rules, starting }, t = 0) {
    let parts = [];
    let rule = rules[starting];
    let sum = rule.map((p) => p.weight(t)).reduce((a, b) => a + b);
    let random = Math.random() * sum;
    let partChoice;
    for (let part of rule) {
        random -= part.weight(t);
        if (random <= 0) {
            partChoice = part;
            break;
        }
    }

    let { part } = partChoice;
    for (let { type, value } of part) {
        if (type === "t")
            parts.push(value);
        else
            parts.push(...randomGenerate({ rules, starting: value }, t + 1));
    }
    return parts;
}

console.log(randomGenerate(grammar).join(""))