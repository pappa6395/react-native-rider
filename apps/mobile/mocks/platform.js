module.exports = {
    OS: "web",  // ✅ Set Platform to "web"
    select: (obj) => obj.web || obj.default,
  };
  