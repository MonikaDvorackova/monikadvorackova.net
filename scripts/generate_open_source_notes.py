#!/usr/bin/env python3
"""Generate a source-linked, reviewable monthly upstream contribution draft."""
import argparse
import calendar
import datetime as dt
import json
import os
from pathlib import Path
import urllib.parse
import urllib.request

USER = "MonikaDvorackova"
API = "https://api.github.com"
EXCLUDED_OWNERS = {USER.lower(), "aigovdev", "aimlgov"}

def get_json(url):
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "monthly-engineering-notes"}
    if os.getenv("GH_TOKEN"):
        headers["Authorization"] = "Bearer " + os.environ["GH_TOKEN"]
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=30) as response:
        return json.load(response)

def merged_prs(year, month):
    start = dt.date(year, month, 1)
    end = dt.date(year + (month == 12), month % 12 + 1, 1)
    query = f"type:pr author:{USER} is:merged merged:>={start} merged:<{end}"
    found = {}
    for page in range(1, 11):
        data = get_json(API + "/search/issues?" + urllib.parse.urlencode({
            "q": query, "per_page": 100, "page": page, "sort": "updated", "order": "desc"
        }))
        for item in data.get("items", []):
            repo = item["repository_url"].split("/repos/", 1)[-1]
            owner = repo.split("/", 1)[0].lower()
            if owner in EXCLUDED_OWNERS:
                continue
            url = item["html_url"]
            found[url] = {"repo": repo, "number": item["number"], "title": item["title"],
                          "url": url, "merged": item.get("pull_request", {}).get("merged_at")}
        if len(data.get("items", [])) < 100:
            break
    return sorted(found.values(), key=lambda x: (x["repo"].lower(), x["number"]))

def render(year, month, prs):
    label = dt.date(year, month, 1).strftime("%B %Y")
    date = dt.date(year, month, calendar.monthrange(year, month)[1]).isoformat()
    lines = [
        "---", f'title: "Open Source Engineering Notes — {label}"',
        f'date: "{date}"', 'type: "article"',
        'tags: ["Open Source", "Engineering", "Python"]',
        f'description: "Verified upstream pull requests merged in {label}."',
        "---", "",
        f"This is a source-linked record of upstream contributions merged in {label}.",
        "It is generated from GitHub merge records and requires editorial review before publication.",
        "",
    ]
    if not prs:
        lines += ["No verified external merged pull requests were found for this period.", ""]
    else:
        lines += [f"## Merged upstream contributions ({len(prs)})", ""]
        for pr in prs:
            title = pr["title"].replace("[", "\\[").replace("]", "\\]")
            lines += [f"### {pr['repo']} — PR #{pr['number']}", "",
                      f"[{title}]({pr['url']})", "",
                      "Technical context and impact: pending manual verification of the diff, tests and maintainer feedback.", ""]
    lines += ["## Editorial verification", "",
              "Before merging this article, check each PR diff, CI results and merge status. "
              "Replace placeholders with precise, evidence-backed explanations. "
              "Do not claim adoption, performance gains or impact without evidence.", ""]
    return "\n".join(lines)

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--year", type=int)
    p.add_argument("--month", type=int)
    args = p.parse_args()
    today = dt.date.today()
    year = args.year or (today.year if today.month > 1 else today.year - 1)
    month = args.month or (today.month - 1 or 12)
    prs = merged_prs(year, month)
    target = Path("posts") / f"open-source-engineering-notes-{year}-{month:02d}.mdx"
    target.parent.mkdir(exist_ok=True)
    target.write_text(render(year, month, prs), encoding="utf-8")
    print(f"Generated {target} with {len(prs)} verified merged external PRs")

if __name__ == "__main__":
    main()
