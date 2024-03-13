'use server'

export async function searchArchives(prevState, formData) {
  // const xApiKey = process.env.NAC_XAPI_KEY
  const xApiKey = 'AlBMXiF4psWQRVk6ZqNLa5JQEC86mAp87FQTVWzg'

  try {
    const q = formData.get('q')
    if(!q) onError('A query parameter must be provided.')

    const results = await fetch('https://catalog.archives.gov/api/v2/records/search?q=' + q, {
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': xApiKey
			}
		})
    const data = await results.json()

    if(data?.statusCode === 200) {
      return {
        success: true,
        data
      }
    } else {
      onError('status code — ' + data.statusCode)
    }
    
  } catch(e) {
    onError(e)
  }
}

function onError(e) {
  const message = 'error: ' + e
  return {
    success: false,
    message: message
  }
}