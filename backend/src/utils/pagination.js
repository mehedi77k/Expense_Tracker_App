function getPagination(page = 1, limit = 20) {
  const pageNumber = Math.max(Number(page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const offset = (pageNumber - 1) * pageSize;
  return { page: pageNumber, limit: pageSize, offset };
}

module.exports = { getPagination };
