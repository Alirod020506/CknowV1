/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        'lila-claro':'#EFECF3',
        'lila':'#D6B3FF',
        'morado1':'#6A2A8F',
        'morado2':'#D6B3FF'
      },
      boxShadow: {
        'right-down': '8px 8px 15px rgba(0, 0, 0, 0.3)', // Sombra hacia la derecha y abajo
      },
    },
  },
  plugins: [],
}

