const Index = async (req, res) => {
  res.render("repositories/index", { title: "Repositories" })
};

module.exports = { Index };