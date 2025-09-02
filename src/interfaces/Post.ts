export interface PostTS {
  id?: string;
  title: string;
  category: string;
  contentHtml: string;
  coverUrl: string;
  tags: string;
  state: PostState;
  reads: number;
  author: string;
  date: Date | string;
  fixedHome: boolean;
  fixedCategory: boolean;
}

export enum PostState {
  PENDIENTE = "Pendiente",
  PUBLICADO = "Publicado",
  OCULTO = "Oculto",
}
