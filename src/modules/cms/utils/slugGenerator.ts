export const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD') // Normalize accented characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumerics with hyphens
      .replace(/(^-|-$)+/g, '') // Remove leading/trailing hyphens
      .trim();
  };