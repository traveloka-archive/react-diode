workflow "Publish to npm" {
  resolves = "publish"
  on = "push"
}

action "new version" {
  uses = "actions/bin/filter@master"
  args = "tag"
}

action "publish" {
  uses = "nuxt/actions-yarn@node-10"
  needs = ["install"]
  args = "publish --access public"
  secrets = ["NPM_AUTH_TOKEN"]
}

action "install" {
  uses = "nuxt/actions-yarn@node-10"
  needs = ["new version"]
  args = "install --pure-lockfile"
}
