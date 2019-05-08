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

action "build" {
  uses = "nuxt/actions-yarn@node-10"
  args = "build"
  needs = ["test"]
}

action "test" {
  uses = "nuxt/actions-yarn@node-10"
  args = "test"
  needs = ["install"]
}

action "publish" {
  uses = "nuxt/actions-yarn@node-10"
  needs = ["build"]
  args = "publish --access public"
  secrets = ["NPM_AUTH_TOKEN"]
}

action "install" {
  uses = "nuxt/actions-yarn@node-10"
  needs = ["new version"]
  args = "install --pure-lockfile"
}
