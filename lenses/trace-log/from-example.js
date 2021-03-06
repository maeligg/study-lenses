// main
const Aran = require("aran");
const Acorn = require("acorn");
const Astring = require("astring");
module.exports = (pointcut, advice) => {
  pointcut = global.eval(pointcut);
  const aran = Aran();
  const estree1 = aran.setup();
  return (path, script, argv) => {
    const estree2 = aran.weave(Acorn.parse(script), pointcut);
    return new Worker(URL.createObjectURL(new Blob([
      "console.log = function () { \n",
      "  postMessage(Array.from(arguments).map(String).join(' ')+'\\n');\n",
      "};\n",
      "var " + aran.namespace + " = " + advice + ";\n",
      "{\n" + Astring.generate(estree1) + "\n}\n",
      "{\n" + Astring.generate(estree2) + "\n}"
    ])));
  };
};

// pointcut
module.exports = (name, node) => (
  name === "apply" &&
  node.type === "CallExpression" &&
  node.callee.type === "Identifier");

// advice
let depth = "";
exports.apply = (f, t, xs, serial) => {
  console.log(depth + f.name + "(" + xs.join(", ") + ")");
  depth += ".";
  const x = Reflect.apply(f, t, xs);
  depth = depth.substring(1);
  console.log(depth + x);
  return x;
};
