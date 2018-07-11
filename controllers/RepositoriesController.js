const axios = require('axios');
const GithubGraphQLApi = require('node-github-graphql');
const github = new GithubGraphQLApi({
  token: process.env.GITHUB_ACCESS_TOKEN,
});

const query = `
query($start: Int, $after: String, $login: String = ""){
  organization(login: $login){
    repositories(first: $start, after: $after){
      pageInfo{
        hasNextPage,
        endCursor,
      },
      edges{
        node{
          stargazers{
            totalCount,
          },
          primaryLanguage{
            name,
          },
          name,
          url,
          forkCount,
          resourcePath,
        }
      }
    }
  }
}
`;

const githubHost = "https://api.github.com/repos";
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

const Index = async (_, res) => {
  await fetch(res);
};

async function fetch(fn, array = [], start = 100, after = null, login = "thoughtworks"){
  github.query(query, { start: start, after: after, login: login }, async (req, res) => {
    const repositories = req.data.organization.repositories;
    for(let element of repositories.edges) {
      const url = `${ githubHost }${ element.node.resourcePath }/contributors?client_id=${ githubClientId }&client_secret=${ githubClientSecret }`;
      const collaborators = await fetchCollaborators(url);
      element.collaborators = collaborators;
    }
    array = array.concat(repositories.edges);

    if(repositories.pageInfo.hasNextPage) {
      const endCursor = repositories.pageInfo.endCursor;
      fetch(fn, array, start, endCursor, login);
    } else {
      fn.json(array);
    }
  });
};

async function fetchCollaborators(url, collaborators = []) {
  try {
    const response = await axios.get(url);
    collaborators = collaborators.concat(response.data);
    const link = parseLinkHeader(response.headers.link)
    let nextPageUrl = undefined;

    if(link && (nextPageUrl = link.next)) {
      return fetchCollaborators(nextPageUrl, collaborators);
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

module.exports = { Index };