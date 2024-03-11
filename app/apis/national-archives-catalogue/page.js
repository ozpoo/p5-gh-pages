'use client'

import { useState, useEffect } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { searchArchives } from './actions'

export const routemetadata = {
  title: 'National Archives Catalogue'
}

export default function NationalArchivesCatalogueApi() {
	const [formState, formAction] = useFormState(searchArchives, { q: '' })

	const [searchQuery, setSearchQuery] = useState('')
	const [hits, setHits] = useState(false)

	useEffect(() => {
	  if(formState.success) {
	  	parseData(formState.data)
	  }
	}, [formState])

	function parseData(data) {
		const total = data.body.hits.total.value || 0

		let parsed = total ? data.body.hits.hits.map(hit => {
			return {
				...hit,
				title: hit._source.record.title,
				objects: hit._source.record.digitalObjects
			}
		}) : []

		setHits({
			total: total,
			hits: parsed
		})
	}

  return (
	  <main className='p-8 space-y-12'>
	    <h1 className='uppercase text-sm font-bold tracking-wider'>Page — National Archives Catalogue API</h1>
	    <form action={formAction} className='flex gap-3 items-center'>
		    <SearchForm hits={hits} setHits={setHits}/>
	    </form>
	    {Boolean(hits?.total) &&
		    <div>
			    <ul className='divide-y divide-neutral-800'>
			    	{hits.hits.map(hit => 
			    		<div key={hit._id} className='py-3'>
				    		<li>
				    			<h3 className='font-bold'>{hit.title}</h3>
			    			</li>
				    		{Boolean(hit.objects?.length) &&
				    			<ul className='text-sm font-mono'>
				    				{hit.objects.map(object =>
				    					<li key={object.objectId}>
				    						<a className='block max-w-lg truncate' href={object.objectUrl} target='_blank'>{object.objectUrl}</a>
				    					</li>
			    					)}
		    					</ul>
			    			}
			    		</div>
			  		)}
					</ul>
				</div>
			}
	  </main>
  )
}

function SearchForm(props) {
	const { hits, setHits } = props
	const formStatus = useFormStatus()

	useEffect(() => {
	  if(formStatus.pending) {
	  	setHits(false)
	  }
	}, [formStatus])

	return (
		<>
			<input
	    	className='transition duration-200 rounded-lg px-3 py-2 bg-black border border-white placeholder-neutral-600 appearance-none outline-none ring-yellow-600 focus:border-transparent focus:ring-2'
	    	placeholder='Search'
	    	type='text'
	    	name='q'
	    />
			<button className='hover:pointer-cursor disabled:bg-neutral-600 bg-white text-black px-3 py-2 rounded-lg' type="submit" disabled={formStatus.pending} aria-disabled={formStatus.pending}>
	      Search
	    </button>
	    {formStatus.pending &&
	    	<p>Searching archives...</p>
		  }
		  {Boolean(hits?.total) && <p>Hits: {hits.total}</p>}
    </>
  )
}