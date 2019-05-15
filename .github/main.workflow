workflow "Publish to npm" {
  resolves = "Publish package"
  on = "push"
}

action "Publish package" {
  uses = "traveloka/actions-yarn@master"
  needs = ["Build package"]
  args = "publish --access public"
  secrets = ["NPM_AUTH_TOKEN"]
}

action "Build package" {
  uses = "traveloka/actions-yarn@master"
  needs = ["Install dependencies"]
  args = "build && ls lib/"
}

action "Install dependencies" {
  uses = "traveloka/actions-yarn@master"
  needs = ["Check for new version"]
  args = "install --pure-lockfile --prefer-offline"
}
