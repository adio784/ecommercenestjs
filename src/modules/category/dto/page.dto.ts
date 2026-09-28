// dtos/page.dto.ts
export class PageMetaDto {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class PageDto<T> {
  data: T[];
  meta: PageMetaDto;
}