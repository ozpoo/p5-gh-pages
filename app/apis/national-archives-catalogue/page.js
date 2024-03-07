export default async function NationalArchivesCatalogueApi() {
//   curl --location --request GET 'https://catalog.archives.gov/api/v2/records/search?q=constitution'
// --header 'Content-Type: application/json'
// --header 'x-api-key: API_KEY'

	const results = await fetch('https://catalog.archives.gov/api/v2/records/search?q=ufo', {
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': 'AlBMXiF4psWQRVk6ZqNLa5JQEC86mAp87FQTVWzg'
		}
	})
	const data = await results.json()

  return (
  <main className='h-screen w-screen'>
    National Archives Catalogue API
  </main>
  )
}