import { getMoviesByGenre } from '../../utils/movies'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const genre = typeof query.slug === 'string' ? query.slug.trim() : ''
  const page = Math.max(Number(query.page || 1), 1)

  if (!genre) {
    return {
      items: [],
      page,
      pagination: {},
      sources: [],
    }
  }

  return await getMoviesByGenre(genre, page)
})
