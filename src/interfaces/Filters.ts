export interface PostFilters {
  page: {
    current: number; // Current page number
    items: number; // Items amount by page
  };
  type: "mostReaded" | "latest";
  category: "";
}
