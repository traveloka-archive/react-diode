workflow "Publish to npm" {
  resolves = [
    "test",
    "publish",
    "new version",
    "install",
  ]
  on = "push"
}

action "new version" {
  uses = "actions/bin/filter@master"
  args = "tag"
}

action "build " {
  uses = "actions/npm@master"
  args = "run build"
  needs = ["install"]
}

action "test" {
  uses = "actions/npm@master"
  args = "run test"
  needs = ["install"]
}

action "publish" {
  uses = "actions/npm@master"
  needs = ["build ", "test"]
  args = "publish --access public"
  secrets = ["NPM_AUTH_TOKEN"]
}

action "install" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["new version"]
  args = "ci"
}
