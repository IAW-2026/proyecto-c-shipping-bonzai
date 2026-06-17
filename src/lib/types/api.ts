export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface PaginationMeta {
  total_records: number
  current_page: number
  total_pages: number
  limit: number
}
