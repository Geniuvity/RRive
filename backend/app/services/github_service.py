import requests

def search_repositories(query: str, page: int = 1):
    url = f"https://api.github.com/search/repositories?q={query}&sort=stars&order=desc&page={page}&per_page=5"

    response = requests.get(url)

    if response.status_code != 200:
        return "Failed to fetch repositories"

    data = response.json()

    repos = []
    for item in data.get("items", []):
        repos.append({
            "name": item["name"],
            "url": item["html_url"],
            "stars": item["stargazers_count"],
            "description": item["description"],
            "owner": item["owner"]["login"],
            "avatar": item["owner"]["avatar_url"]
        })

    return repos


def get_repo_readme(repo_full_name: str):
    """
    Fetches README content for a given repo.
    repo_full_name format: 'owner/repo' e.g. 'facebook/react'
    """
    url = f"https://api.github.com/repos/{repo_full_name}/readme"

    headers = {"Accept": "application/vnd.github.raw"}

    res = requests.get(url, headers=headers)

    if res.status_code != 200:
        return "README not available."

    # Limit to first 3000 chars to avoid huge prompts
    return res.text[:3000]