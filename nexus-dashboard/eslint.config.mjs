import import_ from "eslint-config-next";

const eslintConfig = [
  ...import_.compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
