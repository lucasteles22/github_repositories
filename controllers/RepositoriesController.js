const GithubGraphQLApi = require('node-github-graphql');
const github = new GithubGraphQLApi({
  token: "223c82b526c1db14e7ad3196291f6512bd9908ff",
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

const Index = async (_, res) => {
  fetch(res); 
};

function fetch(fn, array = [], start = 10, after = null, login = "thoughtworks"){
  github.query(query, { start: start, after: after, login: login }, (req, res) => {
    const repositories = req.data.organization.repositories;
    array = array.concat(repositories.edges);
    if(repositories.pageInfo.hasNextPage) {
      const endCursor = repositories.pageInfo.endCursor;
      fetch(fn, array, start, endCursor, login);
    } else {
      fn.json(array);
    }
  });
};

module.exports = { Index };