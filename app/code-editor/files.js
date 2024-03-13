const indexHTML =
`<!-- index.html -->

<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/p5.js"></script>

<div id="sketch-container" class="h-full w-full" />`

const styleCSS = 
`/* styles.css */

html, body {
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, helvetica, Cantarell, Ubuntu, roboto, noto, arial, sans-serif;
  height: 100vh;
}`

const scriptJS = 
`/* script.js */

window.addEventListener('load', (event) => {
  console.log('page is fully loaded')
  new p5(sketch, "sketch-container")
})

function sketch(p) {
  const container = document.getElementById("sketch-container")

  // p is a reference to the p5 instance this sketch is attached to
  p.setup = function() {
    p.createCanvas(container.offsetWidth, container.offsetHeight)
  }

  p.draw = function() {
    // your draw code here
    p.background(0)
    p.fill(100,0,100)
    p.circle(p.width / 2, p.height / 2, 400)
  }

  window.addEventListener('resize', windowResized, true)

  // On window resize, update the canvas size
  function windowResized () {
    const container = document.getElementById("sketch-container")
    console.log(container.offsetHeight)
    p.resizeCanvas(container.offsetWidth, container.offsetHeight)
  }
}`

const tailwindConfigJS = 
`/* tailwind.config.js */`

export const files = {
  'index.html': {
    name: 'index.html',
    language: 'html',
    value: indexHTML
  },
  'style.css': {
    name: 'style.css',
    language: 'css',
    value: styleCSS
  },
  'script.js': {
    name: 'script.js',
    language: 'javascript',
    value: scriptJS
  },
  'tailwind.config.js': {
    name: 'tailwind.config.js',
    language: 'javascript',
    value: tailwindConfigJS
  }
}