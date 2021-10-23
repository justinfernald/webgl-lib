export function r(terminals: TemplateStringsArray, ...nonTerminals: string[]) {
    let parts = [];
    for (let [i, text] of Object.entries(terminals) as [string, string][]) {
        const index = +i;
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

export let epsilon = r``;

export type Grammar = {
    rules: { [key: string]: Rule };
    starting: string;
};

export type Rule = Part[];

export type Part = {
    part: {
        type: string;
        value: any;
    }[];
    weight: (t: number) => number;
};

export function randomGenerate({ rules, starting }: Grammar, t = 0) {
    let parts: string[] = [];
    let rule = rules[starting];

    if (rule.length === 0) throw new Error("No rules for symbol");

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

    let { part } = partChoice as Part;
    for (let { type, value } of part)
        if (type === "t") parts.push(value);
        else parts.push(...randomGenerate({ rules, starting: value }, t + 1));

    return parts;
}
