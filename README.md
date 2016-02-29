# github-thumb-up
Github status check to count thumbs up on a merge request

This is a simple service that listens to the webhooks from Github for when a merge request is 
made, or any subsequent comments. It counts the number of :+1: it can find and sets the branch
status to `pending`, `failed`, or `success` based on the result.

* `pending` is the initial state set when a pull request is created.
* `failed` when a :-1: is added, the PR is failed until a subsequent commit and the process starts over again.
* `success` is when the mergepull request has the required number of :+1:
