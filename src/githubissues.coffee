jQuery ($) ->

  GithubIssues =

    getIssues: (user, repo) ->
      $.get "https://api.github.com/repos/#{user}/#{repo}/issues?state=open", (res) ->
        console.log(res)

