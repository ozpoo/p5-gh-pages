import { useState } from 'react'

import { files as myFiles } from '../files'

export default function FolderTree(props) {
  const { fileName, setFileName } = props
  return (
    <div className='text-xs'>
      {files.children?.map((entry, index) => (
        <Entry key={'files-entry-' + index} entry={entry} depth={1}/>
      ))}
      <ul>
        {Object.values(myFiles).map((f, index) =>
          <li key={'object-entry-' + index}>
            <button disabled={fileName === f.name} onClick={() => setFileName(f.name)}>
              {f.name}
            </button>
          </li>
        )}
      </ul>     
    </div>
  )
}

    
function Entry(props) {
  const { entry, depth } = props
  const [isExpanded, setIsExpanded] = useState(false)

  let textClass = entry.children ? 'text-black-500' : 'pl-3 text-yellow-600'
  if(depth > 1) textClass = entry.children ? 'text-black-500' : 'pl-3'
  return (
    <>
      <button className='flex items-center py-1 w-full transition duration-200 hover:bg-black-880' onClick={() => setIsExpanded(prev => !prev)}>
        {entry.children &&
          <span className='w-6 text-black-500'>
            {isExpanded ? '-' : '+'}
          </span>
        }
        <span className={textClass}>{entry.name}</span>
      </button>
      <div className='ml-6 border-l border-black-840'>
        {isExpanded && 
          <div>
            {entry.children?.map((entry, index) =>
              <Entry key={'exp-entry-' + index} entry={entry} depth={depth + 1} />
            )}
          </div>
        }
      </div>
    </>
  )
}
  
const files = {
  name: 'root',
  children: [
    {
      name: 'src',
      children: [
        {
          name: 'index.js'
        }
      ]
    },
    {
      name: 'style',
      children: [
        {
          name: 'style.css'
        }
      ]
    },
    {
      name: 'script',
      children: [
        {
          name: 'script.js',
        },
      ]
    },
    {
      name: 'tailwind.config.js'
    }
  ]
}