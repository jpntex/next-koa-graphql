module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    'airbnb'
  ],
  // add your custom rules here
  rules: {
    "no-console": "off",
    "comma-dangle": "off",
    "react/jsx-filename-extension": "off",
    "react/react-in-jsx-scope": "off",
    "jsx-a11y/anchor-is-valid": "off",
    "react/prop-types": "off"
  },
  globals: {}
}
