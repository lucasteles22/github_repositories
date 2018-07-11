const axios = require('axios');

async function Fetch(url, collaborators = []) {
  try {
    const response = await axios.get(url);
    collaborators = collaborators.concat(response.data);
    const link = parseLinkHeader(response.headers.link)
    let nextPageUrl = undefined;

    if(link && (nextPageUrl = link.next)) {
      return Fetch(nextPageUrl, collaborators);
    }

    return collaborators;
  } catch (error) {
    console.error(error);
  }
}

function parseLinkHeader(header) {
  if (!header || header.length === 0) {
    return null;
  }

  // Split parts by comma
  var parts = header.split(',');

  let links = {};

  // Parse each part into a named link
  for(let i = 0; i < parts.length; i++) {
    const section = parts[i].split(';');
    if (section.length !== 2) {
      return null;
    }
    const url = section[0].replace(/<(.*)>/, '$1').trim();
    const name = section[1].replace(/rel="(.*)"/, '$1').trim();
    links[name] = url;
  }

  return links;
}

module.exports = { Fetch };