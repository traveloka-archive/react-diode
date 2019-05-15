workflow "Publish to npm" {
  resolves = "Publish package"
  on = "push"
}

action "Check for new version" {
  uses = "actions/bin/filter@master"
  args = "tag"
}

action "Publish package" {
  uses = "traveloka/actions-yarn@master"
  needs = ["Install dependencies"]
  args = "publish --access public"
  secrets = ["NPM_AUTH_TOKEN"]
}

action "Install dependencies" {
  uses = "traveloka/actions-yarn@master"
  needs = ["Check for new version"]
  args = "install --pure-lockfile --prefer-offline"
}
