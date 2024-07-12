const tes = [[
    { "userId": "6684a814d5b11c1716ee9be4", "priority": 1 },
    { "userId": "6684a81ed5b11c1716ee9be7", "priority": 2 }
], [1, 2, 3], [1, 2, 3]]
const aa = tes.map((val, index) => {
    console.log(...val)
    return {
        ...val,
        eaa: val
    }
})
console.log(aa)
const ta = [{ a: 'b', b: "c" }, { c: 'd', d: "e" }]
const ata = ta.map((val, i) => {
    return { ...val }
})

console.log(ata)

const PizzaSize = {
    SMALL: { key: 0, value: 100 },
    MEDIUM: { key: 1, value: 200 },
    LARGE: { key: 2, value: 300 },
};
console.log(typeof PizzaSize);
