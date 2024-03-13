'use client'

import { useRef, useState, useEffect } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

import FolderTree from './folder-tree'
import Editor from './editor'
import Console from './console'

import { files } from '../files'

const LOCAL_STORAGE = 'ozp-ooo-code-editor'

export default function Viewport() {
  const storage = localStorage.getItem(LOCAL_STORAGE)
  const initialSettings = JSON.parse(storage)

  const [ settings, setSettings ] = useState(initialSettings?.editor ?? {
    outerSizes: [60, 40],
    leftSizes: [75, 25],
    innerLeftSizes: [75, 25]
  })

  const editorRef = useRef(null)

  const [directory, setDirectory] = useState(files)

  const [fileName, setFileName] = useState('script.js')
  const [outputValue, setOutputValue] = useState('')

  const file = directory[fileName]

  function updateSettings(key, update) {
    localStorage.setItem(LOCAL_STORAGE, JSON.stringify({
      ...initialSettings,
      editor: {
        ...settings,
        [key]: update
      }
    }))
    setSettings({
      ...settings,
      [key]: update
    })
  }

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor
  }

  function handleEditorChange(value, event) {
    setDirectory({
      ...directory,
      [fileName]: {
        ...directory[fileName],
        value: value
      }
    })
  }

  function handleEditorValidation(markers) {
    // model markers
    markers.forEach((marker) => {
      console.log(marker)
      const message = marker.message + ' ' + marker.resource.path + ':' + marker.startColumn
      if(marker.severity < 2) {
        console.warn(message)
      } else {
        console.error(message)
      }
    })
  }

  useEffect(() => {
    setOutputValue(
`
<html>
  <style>
    ${directory['style.css'].value}
  </style>
  <body>
    ${directory['index.html'].value}
    <script type='text/javascript'>
      ${directory['script.js'].value}
    </script>
  </body>
</html>
`
    )
  }, [directory])

  return (
    <div className='h-screen'>
      <PanelGroup onLayout={update => updateSettings('outerSizes', update)} autoSaveId='outer' direction='horizontal'>
        <Panel defaultSize={settings.outerSizes[0]}>
          <PanelGroup onLayout={update => updateSettings('leftSizes', update)} autoSaveId='innerLeft' direction='vertical'>
            <Panel defaultSize={settings.leftSizes[0]} className='w-full'>
              <PanelGroup onLayout={update => updateSettings('innerLeftSizes', update)} className='h-full' autoSaveId='horizontal' direction='horizontal'>
                <Panel defaultSize={settings.innerLeftSizes[0]} className='h-full'>
                  <FolderTree fileName={fileName} setFileName={setFileName} />
                </Panel>
                <PanelResizeHandle className='w-1 bg-neutral-900 rounded-full' />
                <Panel defaultSize={settings.innerLeftSizes[1]}>
                  <Editor file={file} handleEditorChange={handleEditorChange} handleEditorValidation={handleEditorValidation} handleEditorDidMount={handleEditorDidMount} />
                </Panel>
              </PanelGroup>
            </Panel>
            <PanelResizeHandle className='h-1 bg-neutral-900 rounded-full' />
            <Panel defaultSize={settings.leftSizes[1]} className='w-full'>
              <Console />
            </Panel>
          </PanelGroup>
        </Panel>
        <PanelResizeHandle className='w-1 bg-neutral-900 rounded-full' />
        <Panel defaultSize={settings.outerSizes[1]} className='h-full'>
          <iframe srcDoc={outputValue} className='w-full h-full' />
        </Panel>
      </PanelGroup>
    </div>
  )
}