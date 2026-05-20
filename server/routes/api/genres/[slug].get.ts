import { getMoviesByGenre } from '../../../utils/movies'

export default defineEventHandler(async (event) => {
  const genre = event.context.params?.slug || ''
  const query = getQuery(event)
  const page = Math.max(Number(query.page || 1), 1)

  return await getMoviesByGenre(genre, page)
})
