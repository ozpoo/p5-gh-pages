import { startCase, toLower } from 'lodash'
import fs from 'fs'
import path from 'path'

export async function getPage(props = {}) {
  const { slug } = props
  if(!slug) return { error: 'Sketch not found.' }
  return new Promise(async resolve => {
    const dir = path.resolve(['./computer-vision', slug + '.js'].join('/'))
    fs.readFile(dir, 'utf8', (e, data) => {
      resolve({
        code: data
      })
    })
  })
}

export async function getPages(props = {}) {
  const { directory } = props

  const directoryPath = path.resolve('./app' + (directory || ''))
  const files = await fs.readdirSync(directoryPath, {
    withFileTypes: true,
    recursive: true
  })

  const pageFileName = 'page.js'

  const pages = await Promise.all(files.filter(file => file.name === 'page.js').map(async file => {
    let slug = file.path.split('/app')[1]

    let pageData = false
    let pagePath = '@/app' + slug + '/' + pageFileName

    if(slug === '') pagePath = '@/app/' + pageFileName

    let metadata = {}
    const filePath = path.resolve('./app' + slug + '/' + pageFileName)
    const exists = await fs.existsSync(filePath)
    if(exists) {
      const file = await fs.readFileSync(filePath, 'utf8')
      let data = useRegex(file)
      data = data[0][2].replace(/\r?\n|\r/g, " ")
      data = data.trim()
      data = data.replaceAll("'", '"')
      data = data.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": ')
      const pageData = JSON.parse('{' + data + '}')
      
      metadata = pageData
    }

    function useRegex(input) {
      // let regex = /[A-Za-z]+ = \{/i
      let regex = /([A-Za-z]+ = )\{([^}]*)\}/g
      return [...input.matchAll(regex)]
    }

    const titleIndex = slug.lastIndexOf('/')
    let title = toTitleCase(slug.substring(titleIndex + 1).replace('-', ' '))

    const parts = slug.split('/')
    let parent = parts[parts.length - 2]

    if(title === '') title = 'Home'
    if(slug === '') slug = '/'
    if(parent === undefined) parent = false
    if(parent !== false) parent = '/' + parent

    if(metadata.title) title = metadata.title

    return { slug, title, parent, metadata }
  }))

  return pages
}

function toTitleCase(string) {
  return string.replace(
    /\w\S*/g,
    (text) => {
      return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
    }
  )
}

export default {
  getPage,
  getPages
}