workflow "Publish to npm" {
  resolves = ["test", "publish"]
  on = "push"
}

action "new version" {
  uses = "actions/bin/filter@master"
  args = "tag"
}

action "build " {
  uses = "actions/npm@master"
  args = "build"
  needs = ["new version"]
}

action "test" {
  uses = "actions/npm@master"
  args = "test"
  needs = ["new version"]
}

action "publish" {
  uses = "actions/npm@master"
  needs = ["build ", "test"]
  args = "publish --access public"
  secrets = ["NPM_AUTH_TOKEN"]
}
