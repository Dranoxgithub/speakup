function objToQueryString(obj: any) {
  if (Object.keys(obj).length === 0) {
    return "";
  }

  const keyValuePairs = [];
  for (const key in obj) {
    keyValuePairs.push(
      encodeURIComponent(key) + "=" + encodeURIComponent(obj[key])
    );
  }
  return `?${keyValuePairs.join("&")}`;
}

export function fetchUrl(
  url: string,
  obj: any,
  requestOptions: RequestInit | undefined
): Promise<any> {
  const urlToCall = `${url}${objToQueryString(obj)}`;
  console.log(`Calling url: ${urlToCall}`);
  return fetch(urlToCall, requestOptions)
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
    });
}
