import Editor, { DiffEditor, useMonaco, loader } from '@monaco-editor/react'
import { useEffect } from 'react'

export default function Index(props) {
  const { handleEditorValidation, handleEditorDidMount, handleEditorChange, file } = props

  useEffect(() => {
    loader.init().then(monaco => {
      monaco.editor.defineTheme('ozp-ooo', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#17171780'
        }
      })
    })
  }, [])

  return (
    <div className='overflow-hidden h-full bg-neutraul-900/80'>
      <Editor
        height='100%'
        defaultLanguage='javascript'
        defaultValue='// some comment'
        theme='ozp-ooo'
        path={file.name}
        options={{
          minimap: {
            enabled: false
          },
          cursorStyle: 'block'
        }}
        defaultLanguage={file.language}
        defaultValue={file.value}
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
        onValidate={handleEditorValidation}
      />
    </div>
  )
}

// TYPES
// --------------
// TypeScript
// JavaScript
// CSS
// LESS
// SCSS
// JSON
// HTML

// XML
// PHP
// C#
// C++
// Razor
// Markdown
// Diff
// Java
// VB
// CoffeeScript
// Handlebars
// Batch
// Pug
// F#
// Lua
// Powershell
// Python
// Ruby
// SASS
// R
// Objective-C