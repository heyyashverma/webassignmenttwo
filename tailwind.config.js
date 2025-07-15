module.exports = {
  content: [
    "./views/**/*.ejs",
    "./public/**/*.html",
    "./public/**/*.js"
  ],
  theme: {
    extend: {}
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["dim"], // keep dim for consistency with your layout
  }
};
