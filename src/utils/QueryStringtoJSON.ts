interface IDictionary<TValue> {
  [id: string]: TValue;
}

export default function queryStringToJSON(qs: string) {
  qs = qs || location.search.slice(1);

  let pairs = qs.split("&");
  let result: IDictionary<any> = {};
  pairs.forEach(function (p) {
    let pair = p.split("=");
    let key: string = pair[0];
    let value: string = decodeURIComponent(pair[1] || "");

    if (result[key]) {
      if (Object.prototype.toString.call(result[key]) === "[object Array]") {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
    } else {
      result[key] = value;
    }
  });

  return JSON.parse(JSON.stringify(result));
}
