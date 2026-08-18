function appendSessionListParam(params, key, value) {
  if (value === undefined || value === null || value === "") return;
  const values = Array.isArray(value) ? value : [value];
  values
    .filter(
      (item) =>
        item !== undefined && item !== null && item !== "" && item !== "_unchecked"
    )
    .forEach((item) => params.append(key, String(item)));
}

function buildLibraryQuery(data = {}, overrides = {}) {
  const params = new URLSearchParams();
  const page =
    overrides.page !== undefined ? overrides.page : data.page || "1";
  params.set("page", String(page));

  if (overrides.name !== undefined) {
    if (overrides.name) params.set("name", String(overrides.name));
  } else if (data.name) {
    params.set("name", String(data.name));
  }

  appendSessionListParam(
    params,
    "author",
    overrides.author !== undefined ? overrides.author : data.author
  );
  appendSessionListParam(
    params,
    "organisation",
    overrides.organisation !== undefined
      ? overrides.organisation
      : data.organisation
  );
  appendSessionListParam(
    params,
    "status",
    overrides.status !== undefined ? overrides.status : data.status
  );

  const sort =
    overrides.sort !== undefined
      ? overrides.sort
      : data.sort || "updated-newest";
  if (sort) params.set("sort", String(sort));

  const favouritesOnly =
    overrides.favouritesOnly !== undefined
      ? overrides.favouritesOnly
      : data.favouritesOnly;
  const favouritesOnlyOn =
    favouritesOnly === "yes" ||
    (Array.isArray(favouritesOnly) && favouritesOnly.includes("yes"));
  params.set("favouritesOnly", favouritesOnlyOn ? "yes" : "");

  return `?${params.toString()}`;
}

module.exports = { buildLibraryQuery };
