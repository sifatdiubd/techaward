export function getCreatedAt(item) {
  const createdAt = item.createdAt;
  return createdAt
    ? createdAt.toDate
      ? createdAt.toDate()
      : createdAt.seconds
        ? new Date(createdAt.seconds * 1000)
        : typeof createdAt == "string" || typeof createdAt == "number"
          ? new Date(createdAt)
          : null
    : null;
}
