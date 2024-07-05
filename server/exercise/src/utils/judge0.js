function encode(str) {
  return btoa(unescape(encodeURIComponent(str || "")));
}

function decode(bytes) {
  var escaped = escape(atob(bytes || ""));
  try {
    return decodeURIComponent(escaped);
  } catch {
    return unescape(escaped);
  }
}

function decodeSubmissions(submissions) {
  if (!submissions) return [];
  return submissions.map((submission) => ({
    ...submission,
    compile_output: decode(submission.compile_output),
    stdout: decode(submission.stdout)
  }));
}

export { encode, decode, decodeSubmissions };
