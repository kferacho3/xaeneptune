// .eslintrc.js
module.exports = {
  // Specify files or directories to ignore during linting
  ignorePatterns: [".next/", "node_modules/"],
  rules: {
    // Change missing dependency warnings to warnings instead of errors
    "react-hooks/exhaustive-deps": "warn",
    // Adjust unused variable warnings if you use patterns like _ for intentional unused variables
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^__" },
    ],
    // Disable no-unused-expressions if you have intentional expressions that are safe
    "@typescript-eslint/no-unused-expressions": "off",
  },
};
